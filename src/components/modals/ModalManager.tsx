import React from 'react';
import DeleteSuite from 'components/modals/deleteModal/DeleteSuite';
import DeleteBoard from 'components/modals/deleteModal/DeleteBoard';
import CreateSuite from 'components/modals/createSuiteModal/CreateSuiteModal';
import AddBoard from 'components/modals/addBoardModal/AddBoardModal';
import EditSuite from 'components/modals/editModal/EditSuiteModal';
import EditBoard from 'components/modals/editModal/EditBoardModal';
import ShareBoard from 'components/modals/shareBoardModal/ShareBoardModal';
import { useSelector } from 'react-redux';
import { getModalState } from 'store/modals/selectors';
import { TS_FIX_ME } from 'types/core';

const modalComponentLookupTable: TS_FIX_ME = {
  DeleteSuite,
  DeleteBoard,
  CreateSuite,
  AddBoard,
  EditSuite,
  EditBoard,
  ShareBoard,
};

const ModalManager: React.FC = () => {
  const { modalConfig } = useSelector(getModalState);
  const { modalType, modalProps } = modalConfig;
  if (!modalType) return null;

  const SpecificModal = modalComponentLookupTable[modalType];
  return <SpecificModal {...modalProps} />;
};

export default ModalManager;
