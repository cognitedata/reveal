import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { useCapabilities } from '../../../../hooks/useCapabilities';
import { actions as dataManagementActions } from '../../../../redux/reducers/global/dataManagementReducer';

export const useDataManagementPageUI = () => {
  const dispatch = useDispatch();

  const onShowNoRowsOverlay = useRef<() => void>();
  const onHideOverlay = useRef<() => void>();
  const doesSupportRead = useCapabilities('transformationsAcl', [
    'READ',
  ]).isAclSupported;
  const doesSupportWrite = useCapabilities('transformationsAcl', [
    'WRITE',
  ]).isAclSupported;

  const getMissingPermissions = () => {
    const missingPermissions: string[] = [];
    if (!doesSupportRead) {
      missingPermissions.push('READ');
    }
    if (!doesSupportWrite) {
      missingPermissions.push('WRITE');
    }
    return missingPermissions;
  };

  const toggleShouldShowDraftRows = useCallback(
    () => dispatch(dataManagementActions.toggleShouldShowDraftRows()),
    [dispatch]
  );

  const toggleShouldShowPublishedRows = useCallback(
    () => dispatch(dataManagementActions.toggleShouldShowPublishedRows()),
    [dispatch]
  );

  return {
    toggleShouldShowDraftRows,
    toggleShouldShowPublishedRows,
    getMissingPermissions,
    onShowNoRowsOverlay,
    onHideOverlay,
    doesSupportRead,
    doesSupportWrite,
  };
};
