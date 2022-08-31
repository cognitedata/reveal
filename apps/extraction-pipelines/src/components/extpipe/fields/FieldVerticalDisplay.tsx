import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyledLabel } from 'components/styled';
import DetailsValueView from 'components/table/details/DetailsValueView';
import styled from 'styled-components';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import {
  DetailFieldNames,
  ExtpipeFieldName,
  ExtpipeFieldValue,
} from 'model/Extpipe';
interface FieldVerticalDisplayProps {
  label: TableHeadings | DetailFieldNames;
  fieldValue: ExtpipeFieldValue;
  fieldName: ExtpipeFieldName;
}

export const FieldVerticalDisplay: FunctionComponent<
  FieldVerticalDisplayProps
> = ({
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

export const FieldWrapper = styled.div`
  display: flex;
  padding: 0 1rem;
  flex-direction: column;
  align-items: start;
`;
