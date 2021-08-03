import DeleteSuite from 'components/modals/deleteModal/DeleteSuite';
import DeleteBoard from 'components/modals/deleteModal/DeleteBoard';
import EditSuite from 'components/modals/editModal/EditSuiteModal';
import EditBoard from 'components/modals/editModal/EditBoardModal';
import ShareLink from 'components/modals/shareLinkModal/ShareLinkModal';
import UploadLogo from 'components/modals/uploadLogoModal/UploadLogoModal';
import SelectApplications from 'components/modals/applicationsModal/SelectApplicationsModal';
import AppConfig from 'components/modals/appConfigModal/AppConfigModal';
import { useSelector } from 'react-redux';
import { getModalState } from 'store/modals/selectors';

const modalComponentLookupTable = {
  DeleteSuite,
  DeleteBoard,
  EditSuite,
  EditBoard,
  ShareLink,
  UploadLogo,
  SelectApplications,
  AppConfig,
};

const ModalManager: React.FC = () => {
  const { modalConfig } = useSelector(getModalState);
  const { modalType, modalProps } = modalConfig;
  if (!modalType) return null;

  const SpecificModal = modalComponentLookupTable[modalType];
  return <SpecificModal {...modalProps} />;
};

export default ModalManager;
