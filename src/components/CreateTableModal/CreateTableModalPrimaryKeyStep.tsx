import React from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Select from 'components/Select/Select';

import { PrimaryKeyMethod } from './CreateTableModal';
import CreateTableModalOption from './CreateTableModalOption';
import Message from 'components/Message/Message';
import { useTranslation } from 'common/i18n';

type CreateTableModalPrimaryKeyStepProps = {
  columns?: string[];
  selectedColumnIndex?: number;
  selectColumnAsPrimaryKey: (columnIndex: number) => void;
  selectedPrimaryKeyMethod?: PrimaryKeyMethod;
  selectPrimaryKeyMethod: (method: PrimaryKeyMethod) => () => void;
};

const CreateTableModalPrimaryKeyStep = ({
  columns,
  selectColumnAsPrimaryKey,
  selectedPrimaryKeyMethod,
  selectPrimaryKeyMethod,
}: CreateTableModalPrimaryKeyStepProps): JSX.Element => {
  const { t } = useTranslation();
  const handleSelectedColumnChange = (value: string): void => {
    const selectedColumnIndex =
      columns?.findIndex((columnName) => columnName === value) ?? -1;
    if (selectedColumnIndex !== -1) {
      selectColumnAsPrimaryKey(selectedColumnIndex);
    }
  };

  return (
    <>
      <FormFieldWrapper isRequired title="Select one">
        <StyledCreateOptions>
          <StyledCreateOption>
            <CreateTableModalOption
              description={t(
                'create-table-modal-primary-key-option-description'
              )}
              icon="KeyIcon"
              isDisabled={!columns}
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.ChooseColumn)}
              title={t('create-table-modal-primary-key-option-title')}
            />
          </StyledCreateOption>
          <StyledCreateOption>
            <CreateTableModalOption
              description={t(
                'create-table-modal-no-primary-key-option-description'
              )}
              icon="UnknownPrimaryKeyIcon"
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.AutoGenerate
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.AutoGenerate)}
              title={t('create-table-modal-no-primary-key-option-title')}
            />
          </StyledCreateOption>
        </StyledCreateOptions>
      </FormFieldWrapper>
      {selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn && (
        <>
          <StyledMessage
            message={t(
              'create-table-modal-select-primary-key-file-parsed-message_success',
              {
                count: columns?.length,
              }
            )}
            type="success"
          />
          <FormFieldWrapper
            isRequired
            title={t('create-table-modal-select-primary-key-title')}
          >
            {columns?.length ? (
              <Select
                defaultOpen
                onChange={handleSelectedColumnChange}
                placeholder={t(
                  'create-table-modal-select-primary-key-placeholder'
                )}
                showSearch
              >
                {columns?.map((columnName) => (
                  <Select.Option value={columnName} key={columnName}>
                    {columnName}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <StyledColumnsEmptyText level={2}>
                {t('create-table-modal-select-primary-key-not-found')}
              </StyledColumnsEmptyText>
            )}
          </FormFieldWrapper>
        </>
      )}
    </>
  );
};

const StyledCreateOptions = styled.ul`
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const StyledCreateOption = styled.li`
  flex: 1;

  &:not(:last-child) {
    margin-right: 16px;
  }
`;

const StyledColumnsEmptyText = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  height: 22px;
  margin-top: 16px;
`;

const StyledMessage = styled(Message)`
  margin-bottom: 16px;
`;

export default CreateTableModalPrimaryKeyStep;
