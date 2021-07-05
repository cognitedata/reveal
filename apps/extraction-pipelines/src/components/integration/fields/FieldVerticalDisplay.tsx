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
  margin-bottom: ${(props: { marginBottom?: string }) =>
    props.marginBottom ?? '0'};
  display: flex;
  flex-direction: column;
  align-items: start;
`;
interface FieldVerticalDisplayProps {
  label: TableHeadings | DetailFieldNames;
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
  marginBottom?: string;
}

export const FieldVerticalDisplay: FunctionComponent<FieldVerticalDisplayProps> = ({
  label,
  fieldName,
  fieldValue,
  marginBottom,
}: PropsWithChildren<FieldVerticalDisplayProps>) => {
  return (
    <FieldWrapper marginBottom={marginBottom}>
      <StyledLabel htmlFor={fieldName}>{label}</StyledLabel>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </FieldWrapper>
  );
};
