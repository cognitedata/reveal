import React from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Select from 'components/Select/Select';

import { PrimaryKeyMethod } from './CreateTableModal';
import CreateTableModalOption from './CreateTableModalOption';

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
  const handleSelectedColumnChange = (value: any): void => {
    const selectedColumnIndex =
      columns?.findIndex((columnName) => columnName === value) ?? -1;
    if (selectedColumnIndex !== undefined) {
      selectColumnAsPrimaryKey(selectedColumnIndex);
    }
  };

  return (
    <>
      <FormFieldWrapper isRequired title="Select one">
        <StyledCreateOptions>
          <StyledCreateOption>
            <CreateTableModalOption
              description="Choose a column that will be used. Note: this might mean data will be lost if the column is not 100% unique."
              icon="KeyIcon"
              isDisabled={!columns}
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.ChooseColumn)}
              title="I know the primary key."
            />
          </StyledCreateOption>
          <StyledCreateOption>
            <CreateTableModalOption
              description="A key will be auto-generate for you. This means that updating the data will overwrite the entire table."
              icon="UnknownPrimaryKeyIcon"
              isSelected={
                selectedPrimaryKeyMethod === PrimaryKeyMethod.AutoGenerate
              }
              onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.AutoGenerate)}
              title="I don’t know the primary key."
            />
          </StyledCreateOption>
        </StyledCreateOptions>
      </FormFieldWrapper>
      {selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn && (
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

export default CreateTableModalPrimaryKeyStep;
