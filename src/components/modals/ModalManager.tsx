import React from 'react';
import DeleteSuite from 'components/modals/deleteModal/DeleteSuite';
import DeleteBoard from 'components/modals/deleteModal/DeleteBoard';
import CreateSuite from 'components/modals/createSuiteModal/CreateSuiteModal';
import AddBoard from 'components/modals/addBoardModal/AddBoardModal';
import EditSuite from 'components/modals/editModal/EditSuiteModal';
import EditBoard from 'components/modals/editModal/EditBoardModal';
import ShareLink from 'components/modals/shareLinkModal/ShareLinkModal';
import { useSelector } from 'react-redux';
import { getModalState } from 'store/modals/selectors';

const modalComponentLookupTable = {
  DeleteSuite,
  DeleteBoard,
  CreateSuite,
  AddBoard,
  EditSuite,
  EditBoard,
  ShareLink,
};

const ModalManager: React.FC = () => {
  const { modalConfig } = useSelector(getModalState);
  const { modalType, modalProps } = modalConfig;
  if (!modalType) return null;

  const SpecificModal = modalComponentLookupTable[modalType];
  return <SpecificModal {...modalProps} />;
};

export default ModalManager;
