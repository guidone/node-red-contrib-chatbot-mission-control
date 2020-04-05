import { useState, useCallback } from 'react';

export default ({ onCancel }) => {
  const [isChanged, setIsChanged] = useState(false);

  const handleCancel = useCallback(() => {
    if (!isChanged || confirm('Close and lose all the changes?')) {
      onCancel();
    };
  }, [onCancel, isChanged]);

  return {
    handleCancel,
    isChanged,
    setIsChanged
  };
};