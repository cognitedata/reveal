import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyledLabel } from 'styles/StyledForm';
import DetailsValueView from 'components/table/details/DetailsValueView';
import styled from 'styled-components';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import {
  DetailFieldNames,
  IntegrationFieldName,
  IntegrationFieldValue,
} from 'model/Integration';

const FieldWrapper = styled.div`
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: start;
`;
interface FieldVerticalDisplayProps {
  label: TableHeadings | DetailFieldNames;
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}

export const FieldVerticalDisplay: FunctionComponent<FieldVerticalDisplayProps> = ({
  label,
  fieldName,
  fieldValue,
}: PropsWithChildren<FieldVerticalDisplayProps>) => {
  return (
    <FieldWrapper>
      <StyledLabel htmlFor={fieldName}>{label}</StyledLabel>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </FieldWrapper>
  );
};
