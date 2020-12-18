import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import DetailsValueView from '../table/details/DetailsValueView';
import { TableHeadings } from '../table/IntegrationTableCol';
import {
  DetailFieldNames,
  IntegrationFieldName,
  IntegrationFieldValue,
} from '../../model/Integration';
import { PaddedGridDiv } from '../../styles/grid/StyledGrid';

export const FieldGrid = styled((props) => (
  <PaddedGridDiv {...props}>{props.children}</PaddedGridDiv>
))`
  grid-template-columns: 8rem 5fr;
`;
interface OwnProps {
  label: TableHeadings | DetailFieldNames;
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}

type Props = OwnProps;

const FieldView: FunctionComponent<Props> = ({
  label,
  fieldName,
  fieldValue,
}: Props) => {
  return (
    <FieldGrid className="field-view row-style-even row-height-4">
      <label htmlFor={fieldName}>{label}</label>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </FieldGrid>
  );
};

export default FieldView;
