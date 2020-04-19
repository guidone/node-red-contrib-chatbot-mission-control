import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { sortableContainer } from 'react-sortable-hoc';


import './style.scss';
import Question from './views/question';
import QuestionDetail from './views/question-detail';


import SurveyEditorContext from './context';


const replace = (items, oldElement, newElement) => {
  const result = [...items];
  const idx = items.findIndex(item => item.id === oldElement);
  result[idx] = newElement;
  return result;
}

// get the parent of a question if any
const findParent = (questions, question) => {
  return question.parent != null ? questions.find(item => item.id === question.parent) : null
}

const remove = (questions, question) => {
  // if we are removing a question with children, move all questions up
  const parent = findParent(questions, question);

  return questions
    .filter(item => item.id !== question.id)
    .map(item => {
      // if item is children of the removed element
      if (item.parent == question.id) {
        // transfer to the parent of the removed children, otherwise to root
        return parent != null ? { ...item, parent: parent.id } : _.omit(item, 'parent');
      }
      return item;
    });
};

const add = (questions, params) => {
  const newQuestion = {
    id: _.uniqueId('q_'),
    title: ''
  };


  return [...questions, newQuestion];




}



const SortableContainer = sortableContainer(({children}) => {
  return <div className="questions">{children}</div>;
});

// returns an hash, for each node id the nested level, my_id: 3 means that the questions
// with parent = 'my_id' is at level 3
const getLevels = questions => {
  const result = {};
  questions.forEach(question => {
    // if question has parent
    if (question.parent != null) {
      // if level of the parent is not yet calculated
      if (result[question.parent] == null) {
        // get the parent question
        const parent = questions.find(item => item.id === question.parent);
        // if the parent has a parent, then just increase the level
        if (parent.parent != null) {
          result[question.parent] = result[parent.parent] + 1;
        } else {
          result[question.parent] = 1;
        }
      }
    }
  });

  return result;
};

const retag = questions => {
  const result = [...questions];
  const counters = {
    root: 0
  };

  const getPath = question => {
    if (question == null) {
      return '';
    }
    const parent = question.parent != null ? questions.find(item => item.id === question.parent) : null;
    return `${parent != null ? getPath(parent) : ''}${counters[parent != null ? parent.id : 'root']}.`
  };

  const getLabel = question => {
    const parent = question.parent != null ? questions.find(item => item.id === question.parent) : null;

    let index;
    if (parent != null) {
      if (counters[parent.id] != null) {
        counters[parent.id] += 1;
        index = counters[parent.id];
      } else {
        counters[parent.id] = 1;
        index = 1;
      }
    } else {
      counters.root += 1;
      index = counters.root;
    }

    return `Q${getPath(parent)}${index}`;
  }

  return questions.map(question => ({ ...question, tag: getLabel(question) }));

  /*result.forEach(question => {
    //if (question.parent == null) {
      //counters.root += 1;
      question.tag = getLabel(question);
    //} else
  })


  return result;*/
}



const SurveyEditor = ({ value: questions, onChange = () => {} }) => {

  const [active, setActive] = useState();

  useEffect(() => {
    if (active == null) {
      setActive(!_.isEmpty(questions) ? questions[0].id : null)
    }
  }, [questions])


  //const onSortEnd = ({ oldIndex, newIndex}) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {

    console.log('from, to', oldIndex, newIndex)

    // TODO: get the previous element and inheriths it's parent e children scalano

    /*const newQuestions = _(questions)
      .chain()
      .map((item, idx) => {
        if (idx === (newIndex + 1)) {
          return [questions[oldIndex], item];
        } else if (idx === oldIndex) {
          return null;
        }
        return item;
      })
      .compact()
      .flatten()
      .value();*/


    const newQuestions = [...questions];

    const to = newIndex;
    const from = oldIndex

    const startIndex = to < 0 ? newQuestions.length + to : to;
	  const item = newQuestions.splice(from, 1)[0];
	  newQuestions.splice(startIndex, 0, item);


    onChange(retag(newQuestions));
  };

  console.log('questions---->', questions)


  const activeQuestion = questions.find(question => question.id === active);
  const levels = getLevels(questions);



  return (
    <SurveyEditorContext.Provider value={{ questions }}>
      <div className="ui-survey-editor">



        <SortableContainer onSortEnd={onSortEnd} useDragHandle>
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
              onAdd={params => onChange(retag(add(questions, params)))}
            />
          )}
        </div>
      </div>
    </SurveyEditorContext.Provider>
  );

}

export default SurveyEditor;