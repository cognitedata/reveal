import React, { ChangeEvent, useState } from 'react';

import { Body, Colors, Input, Radio } from '@cognite/cogs.js';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';

import { PrimaryKeyMethod } from './CreateTableModal';
import CreateTableModalOption from './CreateTableModalOption';

type CreateTableModalPrimaryKeyStepProps = {
  columns?: string[];
  selectedColumn?: string;
  selectColumnAsPrimaryKey: (name: string) => void;
  selectedPrimaryKeyMethod?: PrimaryKeyMethod;
  selectPrimaryKeyMethod: (method: PrimaryKeyMethod) => () => void;
};

const CreateTableModalPrimaryKeyStep = ({
  columns,
  selectedColumn,
  selectColumnAsPrimaryKey,
  selectedPrimaryKeyMethod,
  selectPrimaryKeyMethod,
}: CreateTableModalPrimaryKeyStepProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColumns = columns?.filter((columnName) =>
    columnName.toLowerCase().includes(searchQuery)
  );

  const selectColumn =
    (columnName: string): (() => void) =>
    (): void => {
      selectColumnAsPrimaryKey(columnName);
    };

  return (
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
            icon="Placeholder"
            isSelected={
              selectedPrimaryKeyMethod === PrimaryKeyMethod.AutoGenerate
            }
            onClick={selectPrimaryKeyMethod(PrimaryKeyMethod.AutoGenerate)}
            title="I don’t know the primary key."
          />
        </StyledCreateOption>
      </StyledCreateOptions>
      {selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn && (
        <StyledColumnsWrapper>
          <Input
            fullWidth
            icon="Search"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Enter column name"
            value={searchQuery}
          />
          {filteredColumns?.length ? (
            <StyledColumns>
              {filteredColumns?.map((columnName) => (
                <StyledRadio
                  checked={selectedColumn === columnName}
                  key={columnName}
                  name={columnName}
                  onChange={selectColumn(columnName)}
                >
                  {columnName}
                </StyledRadio>
              ))}
            </StyledColumns>
          ) : (
            <StyledColumnsEmptyText level={2}>
              No column found
            </StyledColumnsEmptyText>
          )}
        </StyledColumnsWrapper>
      )}
    </FormFieldWrapper>
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

const StyledColumnsWrapper = styled.div`
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 8px;
  margin-top: 24px;
  max-height: 256px;
  overflow-y: auto;
  padding: 16px;
`;

const StyledColumns = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRadio = styled(Radio)`
  margin-top: 16px;
`;

const StyledColumnsEmptyText = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  height: 22px;
  margin-top: 16px;
`;

export default CreateTableModalPrimaryKeyStep;
