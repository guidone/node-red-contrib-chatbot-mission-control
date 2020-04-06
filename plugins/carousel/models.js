import _ from 'lodash';
import { Schema } from 'rsuite';

const { StringType, ArrayType, ObjectType, DateType } = Schema.Types;

const carousel = Schema.Model({
  openings: ArrayType().of(ObjectType()
    .shape({
      start: DateType()
        .isRequired('Specify starting hour'),
      end: DateType()
        .isRequired('Specify ending hour'),
      range: StringType()
        .isRequired('Select a range for opening hours')
    }))
    .addRule(
      value => _.isArray(value) && value.length !== 0,
      'Specify at least an opening hour'
    )
});

export { carousel };