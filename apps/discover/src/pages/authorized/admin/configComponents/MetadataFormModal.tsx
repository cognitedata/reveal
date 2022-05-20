import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from 'components/Modal';

import { ConfigFormFields } from '../projectConfig';

import { CustomForm } from './elements';
import { FormModalProps } from './types';

export const MetadataFormModal = ({
  onClose,
  onOk,
  metadataValue,
}: FormModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});

  const handleChange = useCallback(
    (changeKey: string, changeValue: unknown) =>
      setFormData((state) => ({ ...state, [changeKey]: changeValue })),
    []
  );

  return (
    <Modal
      thirdWidth
      visible
      title={`New ${metadataValue?.label}`}
      onCancel={onClose}
      okText={t('Create')}
      onOk={() => {
        onOk(formData);
      }}
      className="project-config-modal-form"
    >
      <CustomForm direction="column" gap={16}>
        <ConfigFormFields
          metadataValue={metadataValue}
          values={formData}
          onChange={handleChange}
        />
      </CustomForm>
    </Modal>
  );
};
