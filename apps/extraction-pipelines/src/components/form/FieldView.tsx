import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import DetailsValueView from '../table/details/DetailsValueView';
import {
  IntegrationFieldName,
  IntegrationFieldValue,
} from '../table/details/DetailsCols';
import { TableHeadings } from '../table/IntegrationTableCol';
import { DetailFieldNames } from '../../utils/integrationUtils';

export const FieldGrid = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  display: grid;
  grid-template-columns: 8rem 5fr;
  grid-column-gap: 0.4rem;
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
    <FieldGrid className="field-view detail-row">
      <label htmlFor={fieldName}>{label}</label>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </FieldGrid>
  );
};

export default FieldView;
