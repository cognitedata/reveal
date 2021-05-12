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
  margin-bottom: ${(props: { mb?: string }) => props.mb ?? '0'};
  display: flex;
  flex-direction: column;
  align-items: start;
`;
interface FieldVerticalDisplayProps {
  label: TableHeadings | DetailFieldNames;
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
  mb?: string;
}

export const FieldVerticalDisplay: FunctionComponent<FieldVerticalDisplayProps> = ({
  label,
  fieldName,
  fieldValue,
  mb,
}: PropsWithChildren<FieldVerticalDisplayProps>) => {
  return (
    <FieldWrapper mb={mb}>
      <StyledLabel htmlFor={fieldName}>{label}</StyledLabel>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </FieldWrapper>
  );
};
