import React from 'react';
import Delete from 'components/modals/deleteModal/DeleteModal';
import CreateSuite from 'components/modals/createSuiteModal/CreateSuiteModal';
import AddBoard from 'components/modals/addBoardModal/AddBoardModal';
import EditSuite from 'components/modals/editSuiteMdal/EditSuiteModal';
import { useSelector } from 'react-redux';
import { getModalState } from 'store/modals/selectors';
import { TS_FIX_ME } from 'types/core';

const modalComponentLookupTable: TS_FIX_ME = {
  Delete,
  CreateSuite,
  AddBoard,
  EditSuite,
};

const ModalManager: React.FC = () => {
  const { modalConfig } = useSelector(getModalState);
  const { modalType, modalProps } = modalConfig;
  if (!modalType) return null;

  const SpecificModal = modalComponentLookupTable[modalType];
  return <SpecificModal {...modalProps} />;
};

export default ModalManager;
