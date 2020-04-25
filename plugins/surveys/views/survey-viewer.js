import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import '../styles/survey-viewer.scss';

const ALPHABET = 'ABCDEFGHILMNOPQRTSUVZ';

const Answer = ({ question }) => {
  switch (question.type) {
    case 'text':
    case 'number':
      return (
        <div className={classNames('answer', { [question.type]: true })}>{question.answer}</div>
      );
    case 'multiple':
      return (
        <div className="answer multiple">
          {question.data.map((answer, index) => (
            <div className={classNames('choice', { selected: answer.answer === question.answer || answer.value === question.answer })}>
              <span className="placeholder">{ALPHABET[index]}</span> {answer.answer}
            </div>
          ))}
        </div>
      );
  }
};
Answer.propTypes = {
  question: PropTypes.shape({
    type: PropTypes.oneOf(['text', 'number', 'multiple', 'image']),
    answer: PropTypes.string,
    data: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        answer: PropTypes.string,
        value: PropTypes.string
      })
    ])
  })
};


const SurveryViewer = ({ record }) => {
  const { payload: questions } = record;

  return (
    <div className="survey-viewer">
      {questions.map(question => (
        <div key={question.id} className="question">
          <h5>{question.title}</h5>
          <Answer question={question}/>
        </div>
      ))}
    </div>
  );
};
SurveryViewer.propTypes = {
  record: PropTypes.shape({
    question: PropTypes.shape({
      type: PropTypes.oneOf(['text', 'number', 'multiple', 'image']),
      answer: PropTypes.string,
      data: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          answer: PropTypes.string,
          value: PropTypes.string
        })
      ])
    })
  })
};

export default SurveryViewer;