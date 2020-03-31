const _ = require('lodash');
const URL = require('url');
const mime = require('mime-types');

var validators = {

  credentials: {
    cloudinary: function(obj) {
      return _.isObject(obj) && !_.isEmpty(obj.cloudName) && !_.isEmpty(obj.apiKey) && !_.isEmpty(obj.apiSecret);
    }
  },

  number: function(value) {
    return _.isNumber(value);
  },

  numberOrVariable: function(value) {
    return _.isNumber(value)
      ||
      (!_.isEmpty(value) && !isNaN(parseFloat(value)))
      ||
      (!_.isEmpty(value) && validators.isVariable(value));
  },

  shippingOption: function(element) {
    return _.isObject(element)
      && _.isString(element.id) && !_.isEmpty(element.id)
      && _.isString(element.label) && !_.isEmpty(element.label)
      && validators.numberOrVariable(element.amount);
  },

  shippingOptions: function(elements) {
    return _.isArray(elements)
      && !_.isEmpty(elements)
      && _(elements).all(function(element) {
        return validators.shippingOption(element);
      });
  },

  variable: function(element) {
    return _.isString(element) && element.match(/^\{\{[A-Za-z0-9_-]*\}\}$/) != null;
  },

  isVariable: function(value) {
    return validators.variable(value); // legacy
  },

  invoiceItem(element) {
    return validators.invoiceItemErrors(element) == null;
  },

  invoiceItemErrors(element) {
    let result = {};

    if (!_.isObject(element)) {
      result.price = 'Invalid price element';
    }
    if (!_.isString(element.label)) {
      result.label = 'Missing or invalid label';
    }
    if (!validators.numberOrVariable(element.amount)) {
      result.amount = 'Missing or invalid amount (must be number or variable)';
    }

    return !_.isEmpty(result) ? result : null;
  },

  invoiceItems(elements) {
    return validators.invoiceItemsErrors(elements) == null;
  },

  invoiceItemsErrors(elements) {
    let result = {};

    if (!_.isArray(elements)) {
      result.prices = 'Missing invoice items';
      return result;
    }
    if (_.isEmpty(elements)) {
      result.prices = 'Empty invoice items';
      return result;
    }
    // check each items
    elements.forEach((element, idx) => {
      const validate = validators.invoiceItemErrors(element);
      if (validate != null) {
        result[`prices[${idx}]`] = validate;
      }
    });

    return !_.isEmpty(result) ? result : null;
  },

  invoice(invoice) {
    return validators.invoiceErrors(invoice) == null;
  },

  invoiceErrors(invoice) {
    let result = {};

    if (!validators.string(invoice.title)) {
      result.title = 'Missing invoice title';
    }
    if (!validators.string(invoice.description)) {
      result.description = 'Missing invoice description';
    }
    if (!validators.string(invoice.payload)) {
      result.payload = 'Missing invoice payload';
    }
    if (!validators.string(invoice.currency)) {
      result.currency = 'Missing currency';
    }
    if (!validators.invoiceItems(invoice.prices)) {
      result = { ...validators.invoiceItemsErrors(invoice.prices), ...result };
    }
    // check photo
    if (!_.isEmpty(invoice.photoUrl)) {
      if (!validators.integer(invoice.photoWidth)) {
        result.photoWidth = 'Missing or invalida photoWidth';
      }
      if (!validators.integer(invoice.photoHeight)) {
        invoice.photoHeight = 'Missing or invalid photoHeight'
      }
    }

    return !_.isEmpty(result) ? result : null;
  },

  float: function(value) {
    return !isNaN(parseFloat(value));
  },

  button: function(button) {
    return _.isObject(button) && (button.type != null || validators.buttons(button.items));
  },

  buttons: function(buttons) {
    return _.isArray(buttons)
      && !_.isEmpty(buttons)
      && _(buttons).all(function(button) {
        return validators.button(button);
      });
  },

  genericTemplateElements: function(elements) {
    return _.isArray(elements)
      && !_.isEmpty(elements)
      && _(elements).all(function(element) {
        return validators.genericTemplateElement(element);
      });
  },

  genericTemplateElement: function(element) {
    return _.isObject(element)
      && !_.isEmpty(element.title)
      && _.isString(element.title)
      && _.isArray(element.buttons)
      && (element.buttons.length === 0 || validators.buttons(element.buttons));
  },

  filepath(filepath) {
    return filepath.startsWith('./')
      || filepath.startsWith('../')
      || filepath.startsWith('/')
      || filepath.startsWith('__tests__');
  },

  url: function(url) {
    if (!_.isString(url)) {
      return false;
    }
    var myUrl = URL.parse(url);
    return _.isString(url) && !_.isEmpty(myUrl.host) && !_.isEmpty(myUrl.hostname) && !_.isEmpty(myUrl.protocol)
      && myUrl.hostname.indexOf('.') !== -1;
  },

  secureUrl: function(url) {
    return validators.url(url) && url.toLowerCase().startsWith('https');
  },

  buffer: function(buffer) {
    return buffer instanceof Buffer;
  },

  string: function(value) {
    return _.isString(value) && !_.isEmpty(value);
  },

  boolean: function(value) {
    return _.isBoolean(value);
  },

  array: function(value) {
    return _.isArray(value) && !_.isEmpty(value);
  },

  nlpToken: function(token) {
    return token != null && token.match(/^([a-zA-Z0-9%$£# ]{1,}){0,1}(\[[a-zA-Z0-9]{1,}\]){0,1}(->[a-zA-Z0-9_]{1,}){0,1}$/) != null;
  },

  nlpTokens: function(tokens) {
    return !_.isEmpty(tokens) && _(tokens.split(',')).all(function(token) {
      return validators.nlpToken(token);
    });
  },

  integer: function(value) {
    return !isNaN(parseInt(value, 10));
  },

  messages: function(value) {
    return !_.isEmpty(value) && _.isArray(value) && _(value).all(function(message) {
      // in node config elements are object, in payload are just strings
      return _.isObject(message) ? !_.isEmpty(message.message) : !_.isEmpty(message);
    });
  },

  arrayOfMessage: function(value) {
    return _.isArray(value)
      && _(value).all(function(item) { return _.isObject(item) && !_.isEmpty(item.type); });
  },

  filenameIsImage: function(str) {
    if (!_.isEmpty(str)) {
      var mimeType = mime.lookup(str);
      return mimeType.indexOf('image') !== -1;
    }
    return false;
  },

  path: function(value) {
    return typeof value === 'string' && value.length !== 0 && value.match(/^[A-Za-z0-9_-]*$/);
  }

};
module.exports = validators;
