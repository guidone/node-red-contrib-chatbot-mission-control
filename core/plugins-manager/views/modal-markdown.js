import React from 'react';
import Showdown from 'showdown';
import PropTypes from 'prop-types';


const ModalMarkdown = ({ value = {} }) => {
  const converter = new Showdown.Converter({ openLinksInNewWindow: true });

  return (
    <div
      className="modal-markdown-content"
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(value.markdown.replace('---', ''))}}
    />
  );
};
ModalMarkdown.propTypes = {
  value: PropTypes.shape({
    markdown: PropTypes.string
  })
};

export default ModalMarkdown;