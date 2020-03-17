import React, { useState } from 'react';

import CreateContent from '../views/create-content';

const useCreateContent = ({ onComplete = () => {} }) => {
  const [content, setContent] = useState(null);

  let modal;
  if (content != null) {
    modal = (
      <CreateContent
        content={content}
        onCancel={() => setContent(null)}
        onSubmit={response => {
          setContent(null);
          onComplete(response.createContent);
        }}
      />
    );
  }

  return {
    createContent: contentDefault => {
      setContent(contentDefault);
    },
    modal
  };
};

export default useCreateContent;