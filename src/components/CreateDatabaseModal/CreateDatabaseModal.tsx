import React, { useContext, useEffect } from 'react';

import { Button, Colors, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { notification } from 'antd';
import { useFormik } from 'formik';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { RawExplorerContext } from 'contexts';
import { useCreateDatabase } from 'hooks/sdk-queries';
import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import { useTranslation } from 'common/i18n';

type CreateDatabaseFormValues = {
  databaseName: string;
};

type CreateDatabaseModalProps = {
  databases: RawDB[];
} & Omit<ModalProps, 'children' | 'onOk' | 'title'>;

const CreateDatabaseModal = ({
  databases,
  onCancel,
  visible,
  ...modalProps
}: CreateDatabaseModalProps): JSX.Element => {
  const { t } = useTranslation();
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  const {
    errors,
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    values,
  } = useFormik<CreateDatabaseFormValues>({
    initialValues: {
      databaseName: '',
    },
    onSubmit: handleCreate,
    validate: handleValidation,
    validateOnBlur: true,
  });

  const { mutate: createDatabase, isLoading } = useCreateDatabase();

  const isDisabled = !values.databaseName || !!errors.databaseName || isLoading;

  useEffect(() => {
    if (!visible) {
      handleReset(undefined);
    }
  }, [handleReset, visible]);

  function handleCreate(values: CreateDatabaseFormValues): void {
    const { databaseName } = values;
    createDatabase(
      { name: databaseName },
      {
        onSuccess: () => {
          notification.success({
            message: t('database-created-notification_success', {
              name: databaseName,
            }),
            key: 'create-database',
          });
          onCancel();
          setSelectedSidePanelDatabase(databaseName);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>
                  {t('database-created-notification_error', {
                    name: databaseName,
                  })}
                </p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'create-database',
          });
        },
      }
    );
  }

  function handleValidation(values: CreateDatabaseFormValues) {
    const errors: Partial<Record<keyof CreateDatabaseFormValues, string>> = {};
    if (!values.databaseName) {
      errors.databaseName = t('database-name-validation-error-required');
    } else if (values.databaseName.length > 32) {
      errors.databaseName = t('database-name-validation-error-long');
    } else if (databases.some(({ name }) => name === values.databaseName)) {
      errors.databaseName = t('database-name-validation-error-duplicate');
    }
    return errors;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        footer={[
          <StyledCancelButton onClick={onCancel} type="ghost">
            {t('cancel')}
          </StyledCancelButton>,
          <Button
            disabled={isDisabled}
            htmlType="submit"
            loading={isLoading}
            onClick={() => handleSubmit()}
            type="primary"
          >
            {t('create-database-modal-button-create')}
          </Button>,
        ]}
        onCancel={onCancel}
        title={<Title level={5}>{t('create-database-modal-title')}</Title>}
        visible={visible}
        {...modalProps}
      >
        <FormFieldWrapper
          isRequired
          title={t('create-database-modal-name-field-title')}
        >
          <Input
            autoFocus
            disabled={isLoading}
            error={errors.databaseName}
            fullWidth
            onBlur={handleBlur}
            onChange={handleChange('databaseName')}
            onKeyUp={(e) => {
              if (!isDisabled && e.key === 'Enter') {
                handleSubmit();
              }
            }}
            placeholder={t('create-database-modal-name-field-placeholder')}
            value={values.databaseName}
          />
          {!errors.databaseName && (
            <StyledNameInputDetail>
              {t('create-database-modal-name-field-note')}
            </StyledNameInputDetail>
          )}
        </FormFieldWrapper>
      </Modal>
    </form>
  );
};

const StyledNameInputDetail = styled(Detail)`
  color: ${Colors['text-secondary'].hex()};
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

export default CreateDatabaseModal;
