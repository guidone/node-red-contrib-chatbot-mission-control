import _ from 'lodash';
import { hasError } from 'apollo-client/core/ObservableQuery';


const append = (validation, msg) => ({
  ...validation,
  errors: [...validation.errors, msg]
});
const hasErrors = validation => {
  if (_.isArray(validation)) {
    return !_.isEmpty(validation);
  } else if (_.isObject(validation)) {
    return !_.isEmpty(validation.errors);
  }
  return false;
};
const createBlankValidation = (path, jsonSchema) => ({
  path: _.isEmpty(path) ? '/' : path,
  id: jsonSchema['$id'],
  errors: []
});


const validateObject = (value, path, jsonSchema) => {

  const { required } = jsonSchema || [];
  let validation = createBlankValidation(path, jsonSchema);
  let validations = [];

  if (!_.isObject(value)) {
    return [append(validation, { error: `is not an object` })];
  }


  // TODO extract title for better messages
  // check required values
  (required || [])
    .forEach(field => {
      if (_.isEmpty(value[field]) && !_.isNumber(value[field])) {
        // check local validation of the object
        validation = append(validation, {
          id: jsonSchema.properties[field] != null ? jsonSchema.properties[field]['$id'] : null,
          path: `${path}/${field}`,
          error: `${field} is required`
        });
      }
    });


  // check sub properties
  Object.entries(jsonSchema.properties)
    .forEach(([field, schema]) => {
      // only check if not null
      if (value[field] != null) {
        // check validation of sub objects
        const subValidation = validate(value[field], `${path}/${field}`, schema);
        //console.log('sub validations', subValidation, hasErrors(subValidation))
        if (hasErrors(subValidation)) {
          validations = [...validations, ...subValidation];
        }
      }
    });

  // add local validation
  if (hasErrors(validation)) {
    validations = [validation, ...validations];
  }

  return !_.isEmpty(validations) ? validations : null;
}

const validateString = (value, path, jsonSchema) => {
  const { minLength, maxLength, title } = jsonSchema || {};
  let validation = createBlankValidation(path, jsonSchema);

  if (!_.isString(value)) {
    return [append(validation, { error: `"${title}" is not a string` })];
  }
  if (_.isNumber(minLength) && value.length < minLength) {
    validation = append(validation, { error: `"${title}" is shorter than ${minLength} chars` });
  }
  if (_.isNumber(maxLength) && value.length > maxLength) {
    validation = append(validation, { error: `"${title}" is longer than ${maxLength} chars` });
  }

  return hasErrors(validation) ? [validation] : null;
};

const validateInteger = (value, path, jsonSchema) => {
  const { minimum , exclusiveMinimum, maximum, exclusiveMaximum, title } = jsonSchema || {};
  let validation = createBlankValidation(path, jsonSchema);

  if (!_.isNumber(value)) {
    return [append(validation, { error: `"${title}" is not an integer` })];
  }
  if (_.isNumber(minimum) && value >= minimum) {
    validation = append(validation, { error: `"${title}" is greater or equal than ${minimum}` });
  }
  if (_.isNumber(exclusiveMinimum) && value > exclusiveMinimum) {
    validation = append(validation, { error: `"${title}" is not greater than ${exclusiveMinimum}` });
  }
  if (_.isNumber(maximum) && value <= maximum) {
    validation = append(validation, { error: `"${title}" is not smallar or equal than ${maximum}` });
  }
  if (_.isNumber(exclusiveMaximum) && value < exclusiveMaximum) {
    validation = append(validation, { error: `"${title}" is not smaller than ${exclusiveMaximum}` });
  }

  return hasErrors(validation) ? [validation] : null;
};



const validators = {
  object: validateObject,
  string: validateString,
  integer: validateInteger
};

const validate = (value, path = '', jsonSchema) => {

  let errors = null;
  const { type } = jsonSchema || {};

  if (_.isFunction(validators[type])) {
    errors = validators[type](value, path, jsonSchema);
  } else {
    console.log(`Warning, don't know how to validate "${type}"`);
  }


  return errors;
}




export default (value, jsonSchema) => {

  return validate(value, '/', jsonSchema)
    .map(error => ({
      ...error,
      path: error.path.replace('//', '/')
    }));
};