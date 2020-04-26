import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { sortableContainer } from 'react-sortable-hoc';



import './style.scss';
import Question from './views/question';
import QuestionDetail from './views/question-detail';


import SurveyEditorContext from './context';
import { findQuestion, findParent, hasChildren, remove, replace, add, getLevels, retag } from './helpers';





const SortableContainer = sortableContainer(({ children }) => {
  return <div className="questions">{children}</div>;
});







const SurveyEditor = ({ value: questions = [{}], onChange = () => {} }) => {

  const [active, setActive] = useState();

  useEffect(() => {
    if (active == null) {
      setActive(!_.isEmpty(questions) ? questions[0].id : null)
    }
  }, [questions])


  //const onSortEnd = ({ oldIndex, newIndex}) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {


    // do not move into itself
    if (oldIndex === newIndex) {
      return;
    }

    const newQuestions = [...questions];
    const to = newIndex;
    const from = oldIndex

    const startIndex = to < 0 ? newQuestions.length + to : to;
	  const item = newQuestions.splice(from, 1)[0];
	  newQuestions.splice(startIndex, 0, item);


    const movedQuestion = newQuestions[newIndex];
    const previous = newIndex > 0 ? newQuestions[newIndex - 1] : null;
    const hasSubQuestions = hasChildren(questions, movedQuestion);
    const parent = findParent(questions, movedQuestion);

    //console.log('movedQuestion', movedQuestion)
    //console.log('previous', previous)
    //console.log('hasSubQuestions', hasSubQuestions)
    //console.log('parent', parent)
    // if the previous article has some children, then the moved question becomes
    // its children too
    if (previous != null && hasChildren(questions, previous)) {
      newQuestions[newIndex].parent = previous.id;
    } else {
      newQuestions[newIndex].parent = null;
    }
    // if the moved question has children, then move up one level
    if (hasSubQuestions) {
      questions.forEach(item => {
        if (item.parent === movedQuestion.id) {
          item.parent = parent != null ? parent.id : null;
        }
      });
    }



    onChange(retag(newQuestions));
  };


  const activeQuestion = questions.find(question => question.id === active);
  // get levels, in order to know for every parent what's the indent level
  const levels = getLevels(questions);

  return (
    <SurveyEditorContext.Provider value={{ questions }}>
      <div className="ui-survey-editor">
        <SortableContainer onSortEnd={onSortEnd} helperClass="sorting" useDragHandle>
          {questions.map((question, index) => (
            <Question
              key={question.id}
              index={index}
              question={question}
              level={question.parent != null ? levels[question.parent] : null}
              active={active === question.id}
              onSelect={question => setActive(question.id)}
            />
          ))}
        </SortableContainer>
        <div className="question-detail">
          {activeQuestion != null && (
            <QuestionDetail
              key={activeQuestion.id}
              question={activeQuestion}
              onChange={question => onChange(replace(questions, active, question))}
              onRemove={question => {
                setActive(null);
                onChange(retag(remove(questions, question)))
              }}
              onAdd={params => {
                const { questions: newQuestions, question } = add(questions, params);
                setActive(question.id);
                onChange(newQuestions);
              }}
            />
          )}
        </div>
      </div>
    </SurveyEditorContext.Provider>
  );
}

export default SurveyEditor;