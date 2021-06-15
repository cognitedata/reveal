import React, { useContext, useState } from 'react';
import Modal from 'components/modals/simpleModal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { modalClose } from 'store/modals/actions';
import { RootDispatcher } from 'store/types';
import { Button, Icon } from '@cognite/cogs.js';
import {
  CustomInputContainer,
  ModalFooter,
  UploadLogoContainer,
} from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import * as Sentry from '@sentry/browser';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { setHttpError } from 'store/notification/thunks';

import {
  validImgTypes,
  maximumLogoSize,
  validateFileType,
  validateFileSize,
  uploadFile,
} from 'utils/files';

import { CUSTOMER_LOGO_ID } from 'constants/cdf';
import { ExternalFileInfo } from '@cognite/sdk';
import { getConfigState } from 'store/config/selectors';
import { addConfigItems } from 'store/config/actions';

const ModalWidth = 528;

const UploadLogoModal: React.FC = () => {
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const metrics = useMetrics('UploadLogo');
  const { dataSetId } = useSelector(getConfigState);

  const handleCloseModal = () => {
    dispatch(modalClose());
  };

  const cancel = () => {
    metrics.track('Cancel');
    handleCloseModal();
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    if (!file) {
      return;
    }
    if (!validateFileType(file)) {
      setError('For now we only allow .jpeg, .png and .svg');
      metrics.track('Error_FileType', {
        fileType: file?.type,
      });
      return;
    }
    if (!validateFileSize(file, maximumLogoSize)) {
      setError('This image is too big. Please upload one under 100Kb');
      metrics.track('Error_MaxSize', {
        fileSize: file?.size,
      });
      return;
    }

    setError('');
    setSelectedFile(file);

    metrics.track('Selected', {
      fileSize: file?.size,
      fileType: file?.type,
    });
  };

  const uploadLogoFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    const fileInfo: ExternalFileInfo = {
      name: `${CUSTOMER_LOGO_ID}`,
      mimeType: selectedFile.type,
      externalId: CUSTOMER_LOGO_ID,
      dataSetId,
    };
    try {
      await uploadFile(client, fileInfo, selectedFile);
      dispatch(addConfigItems({ customerLogoFetched: false }));
      metrics.track('Uploaded');
    } catch (e) {
      dispatch(setHttpError(`Failed to upload customer logo`, e));
      Sentry.captureException(e);
    }
    setIsSaving(false);
    handleCloseModal();
  };

  const Footer = () => (
    <ModalFooter>
      <Button variant="ghost" onClick={cancel} disabled={isSaving}>
        Cancel
      </Button>
      {isSaving ? (
        <Icon type="Loading" />
      ) : (
        <Button type="primary" variant="ghost" onClick={uploadLogoFile}>
          Upload logo
        </Button>
      )}
    </ModalFooter>
  );

  return (
    <Modal
      visible
      onCancel={cancel}
      headerText="Upload a customer logo"
      width={ModalWidth}
      footer={<Footer />}
    >
      <CustomInputContainer>
        <UploadLogoContainer>
          <input
            type="file"
            name="uploadImage"
            placeholder="Select a logo"
            accept={validImgTypes.join(',')}
            onChange={handleFileInputChange}
          />
        </UploadLogoContainer>
        <div className="error-space">{error}</div>
      </CustomInputContainer>
    </Modal>
  );
};

export default UploadLogoModal;
