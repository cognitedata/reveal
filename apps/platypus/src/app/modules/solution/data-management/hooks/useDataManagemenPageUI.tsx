import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import { actions as dataManagementActions } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';

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
    const missingPermissions = [];
    if (!doesSupportRead) {
      missingPermissions.push('READ');
    }
    if (!doesSupportWrite) {
      missingPermissions.push('WRITE');
    }
    return missingPermissions;
  };

  const toggleShouldShowDraftRows = () =>
    dispatch(dataManagementActions.toggleShouldShowDraftRows());

  const toggleShouldShowPublishedRows = () =>
    dispatch(dataManagementActions.toggleShouldShowPublishedRows());

  const setIsTransformationModalOpen = (
    value: boolean,
    transformationId: number | null
  ) => {
    dispatch(
      dataManagementActions.setIsTransformationModalOpen({
        transformationId,
        isTransformationModalOpen: value,
      })
    );
  };
  return {
    toggleShouldShowDraftRows,
    toggleShouldShowPublishedRows,
    setIsTransformationModalOpen,
    getMissingPermissions,
    onShowNoRowsOverlay,
    onHideOverlay,
    doesSupportRead,
    doesSupportWrite,
  };
};
