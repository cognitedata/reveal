import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { FileReaderComp } from 'components/file-reader';
import { Modal } from 'components/modal';
import { showErrorMessage } from 'components/toast';

import { CustomComponent, ConfigFormFields } from '../projectConfig';

import { CustomForm } from './elements';

export const LayersFormModal: CustomComponent = ({
  onClose,
  onOk,
  metadataValue,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [layerSource, setLayerSource] = useState<Record<string, unknown>>();

  const handleChange = useCallback(
    (changeKey: string, changeValue: unknown) =>
      setFormData((state) => ({ ...state, [changeKey]: changeValue })),
    []
  );

  const handleOk = useCallback(() => {
    onOk(formData);
  }, [formData, layerSource]);

  const handleRead = (fileContent: unknown) => {
    try {
      if (typeof fileContent === 'string') {
        setLayerSource(JSON.parse(fileContent as string));
      }
    } catch (e) {
      showErrorMessage('Invalid JSON file.');
    }
  };

  return (
    <Modal
      halfWidth
      visible
      title={`New ${metadataValue?.label}`}
      onCancel={onClose}
      okText={t('Create')}
      onOk={handleOk}
      className="project-config-modal-form"
    >
      <CustomForm direction="column" gap={16}>
        <ConfigFormFields
          metadataValue={metadataValue}
          value={formData}
          onChange={handleChange}
        />
        <FileReaderComp onRead={handleRead} />
      </CustomForm>
    </Modal>
  );
};
