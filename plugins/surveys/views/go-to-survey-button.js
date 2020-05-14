import React from 'react';
import { Button } from 'rsuite';
import { Link } from 'react-router-dom';

const GoToSurveyButton = ({ user }) => {
  return (
    <Link to={`/surveys?userId=${user.userId}`}>
      <Button appearance="ghost">View Surveys</Button>
    </Link>
  );
};

export default GoToSurveyButton;