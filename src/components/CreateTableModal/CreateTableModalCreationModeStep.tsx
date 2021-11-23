import React from 'react';

import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';

import CreateTableModalOption from './CreateTableModalOption';
import { CreationMode } from './CreateTableModal';

type CreateTableModalCreationModeStepProps = {
  isCreatingTable: boolean;
  selectCreationMode: (creationMode: CreationMode) => () => void;
  selectedCreationMode?: CreationMode;
};

const CreateTableModalCreationModeStep = ({
  isCreatingTable,
  selectCreationMode,
  selectedCreationMode,
}: CreateTableModalCreationModeStepProps): JSX.Element => {
  return (
    <FormFieldWrapper isRequired title="Select one">
      <StyledCreateOptions>
        <StyledCreateOption>upload csv</StyledCreateOption>
        <StyledCreateOption>
          <CreateTableModalOption
            description="Upload files later or write data directly using the API."
            icon="DataTable"
            isDisabled={isCreatingTable}
            isSelected={selectedCreationMode === CreationMode.Empty}
            onClick={selectCreationMode(CreationMode.Empty)}
            title="Create an empty table"
          />
        </StyledCreateOption>
      </StyledCreateOptions>
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

  :not(:last-child) {
    margin-right: 16px;
  }
`;

export default CreateTableModalCreationModeStep;
