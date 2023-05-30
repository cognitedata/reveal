import React, { useContext, useEffect } from 'react';

import { Colors, Detail, Input, Modal, ModalProps } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { notification } from 'antd';
import { useFormik } from 'formik';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import { useCreateDatabase } from 'hooks/sdk-queries';
import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import { Trans, useTranslation } from 'common/i18n';

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
          setSelectedSidePanelDatabase(databaseName);
        },
        onError: (e) => {
          notification.error({
            description: (
              <>
                {e.status === 403 && (
                  <>
                    <Trans i18nKey="error-insufficient-access" />
                    <Trans
                      i18nKey={'explorer-side-panel-databases-access-warning'}
                    />
                  </>
                )}
                {e.status !== 403 && (
                  <>
                    {!!e.requestId && (
                      <>
                        <p>Request ID</p>
                        <p>{e.requestId}</p>
                      </>
                    )}

                    <pre>{e.errorMessage}</pre>
                  </>
                )}
              </>
            ),
            message: t('database-created-notification_error', {
              name: databaseName,
            }),
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
        okText={t('create-database-modal-button-create')}
        onOk={() => handleSubmit()}
        okDisabled={isDisabled}
        onCancel={onCancel}
        title={t('create-database-modal-title')}
        visible={visible}
        size={'small'}
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
  color: ${Colors['text-icon--medium']};
`;

export default CreateDatabaseModal;
