import _ from 'lodash';

const findQuestion = (questions, question) => {
  return questions.find(item => item.id === question.id);
};

// check if a question is the first of a nested question
// if the previous question is also the parent
const isFirstOfNested = (questions, question) => {
  const idx = questions.findIndex(item => item.id === question.id);
  return idx !== -1 && idx !== 0 && question.parent === questions[idx - 1].id;
};


export { findQuestion, isFirstOfNested };