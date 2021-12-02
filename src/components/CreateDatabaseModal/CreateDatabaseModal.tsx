import React, { useContext, useEffect } from 'react';

import { Body, Button, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { notification } from 'antd';
import { useFormik } from 'formik';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { RawExplorerContext } from 'contexts';
import { useCreateDatabase } from 'hooks/sdk-queries';

type CreateDatabaseFormValues = {
  databaseName: string;
};

type CreateDatabaseModalProps = {
  databases: RawDB[];
} & Omit<ModalProps, 'children' | 'onOk' | 'title'>;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const CreateDatabaseModal = ({
  databases,
  onCancel,
  visible,
  ...modalProps
}: CreateDatabaseModalProps): JSX.Element => {
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
            message: `Database ${databaseName} created!`,
            key: 'create-database',
          });
          onCancel();
          setSelectedSidePanelDatabase(databaseName);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Database {databaseName} was not created!</p>
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
      errors.databaseName = 'A required field is missing.';
    } else if (values.databaseName.length > 32) {
      errors.databaseName = 'This name exceeds the character limit (32).';
    } else if (databases.some(({ name }) => name === values.databaseName)) {
      errors.databaseName = 'This name already exist. Try a different name.';
    }
    return errors;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        footer={[
          <StyledCancelButton onClick={onCancel} type="ghost">
            Cancel
          </StyledCancelButton>,
          <Button
            disabled={isDisabled}
            htmlType="submit"
            loading={isLoading}
            onClick={() => handleSubmit()}
            type="primary"
          >
            Create
          </Button>,
        ]}
        onCancel={onCancel}
        title={<Title level={5}>Create database</Title>}
        visible={visible}
        {...modalProps}
      >
        <Body level={2} strong>
          Name
        </Body>
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
          placeholder="Enter name"
          value={values.databaseName}
        />
        {!errors.databaseName && (
          <Detail>Enter a unique name. You cannot change this later.</Detail>
        )}
      </Modal>
    </form>
  );
};

export default CreateDatabaseModal;
