import { plug } from 'code-plug';

import AnswersForm from './views/aswers-form';

plug('user-tabs', AnswersForm, {
  id: 'data-user',
  label: 'Answers'
});
