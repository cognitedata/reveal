import { useDispatch } from 'react-redux';

import { showErrorMessage } from 'components/Toast';

import { documentSearchActions } from '../actions';
import { DocumentType } from '../types';

export const useExtractParentFolder = () => {
  const dispatch = useDispatch();

  return (document: DocumentType) => {
    const parentPath = document.doc.filepath;

    if (!parentPath) {
      showErrorMessage('Parent path not found');
      return;
    }

    dispatch(documentSearchActions.setExtractParentFolderPath(parentPath));
  };
};
