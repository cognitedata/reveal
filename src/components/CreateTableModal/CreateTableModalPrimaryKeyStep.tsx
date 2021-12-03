import React from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Select from 'components/Select/Select';

import { PrimaryKeyMethod } from './CreateTableModal';
import CreateTableModalOption from './CreateTableModalOption';
import Message from 'components/Message/Message';

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
              description="This is the column that identifies each table record. Data is overwritten if the entries in the column are not unique."
              icon="KeyIcon"
              isDisabled={!columns}
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.ChooseColumn)}
              title="I know the primary key"
            />
          </StyledCreateOption>
          <StyledCreateOption>
            <CreateTableModalOption
              description="An auto-generated key is added as a new column. Updating data creates a new entry and can result in duplicated entries."
              icon="UnknownPrimaryKeyIcon"
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.AutoGenerate
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.AutoGenerate)}
              title="I don’t know the primary key"
            />
          </StyledCreateOption>
        </StyledCreateOptions>
      </FormFieldWrapper>
      {selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn && (
        <>
          <StyledMessage
            message={`File parsed. ${columns?.length ?? 0} column${
              !!columns?.length ? 's' : ''
            } detected.`}
            type="success"
          />
          <FormFieldWrapper isRequired title="Select primary key">
            {columns?.length ? (
              <Select
                defaultOpen
                onChange={handleSelectedColumnChange}
                placeholder="Enter column name"
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
                No column found
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
