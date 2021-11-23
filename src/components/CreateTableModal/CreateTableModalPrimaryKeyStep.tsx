import React from 'react';

import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';

import { PrimaryKeyMethod } from './CreateTableModal';
import CreateTableModalOption from './CreateTableModalOption';

type CreateTableModalPrimaryKeyStepProps = {
  selectPrimaryKeyMethod: (method: PrimaryKeyMethod) => () => void;
  selectedPrimaryKeyMethod?: PrimaryKeyMethod;
};

const CreateTableModalPrimaryKeyStep = ({
  selectPrimaryKeyMethod,
  selectedPrimaryKeyMethod,
}: CreateTableModalPrimaryKeyStepProps): JSX.Element => {
  return (
    <FormFieldWrapper isRequired title="Select one">
      <StyledCreateOptions>
        <StyledCreateOption>
          <CreateTableModalOption
            description="Choose a column that will be used. Note: this might mean data will be lost if the column is not 100% unique."
            icon="Placeholder"
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

export default CreateTableModalPrimaryKeyStep;
