import * as React from 'react';
import { useDispatch } from 'react-redux';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { useSelectedDocumentIds } from 'modules/documentSearch/selectors';

import { DocumentsBulkActions } from '../common/DocumentsBulkActions';

export const DocumentsSearchResultsBulkActions: React.FC = () => {
  const dispatch = useDispatch();
  const selectedDocumentIds = useSelectedDocumentIds();

  const handleDeselectAll = React.useCallback(() => {
    dispatch(documentSearchActions.unselectDocumentIds(selectedDocumentIds));
  }, [dispatch, selectedDocumentIds]);

  return (
    <DocumentsBulkActions
      selectedDocumentIds={selectedDocumentIds.map(Number)}
      handleDeselectAll={handleDeselectAll}
    />
  );
};
