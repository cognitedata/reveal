import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';
import React, { PropsWithoutRef } from 'react';
import { IntegrationFieldName, IntegrationFieldValue } from 'model/Integration';
import { splitWordsLowerCase } from 'utils/primitivesUtils';
import DetailsValueView from 'components/table/details/DetailsValueView';

const BluePlus = styled((props) => <Icon {...props} type="Plus" />)`
  &.cogs-icon-Plus {
    opacity: 1;
    margin-left: 0;
    svg {
      g {
        path {
          fill: ${Colors.primary.hex()};
        }
      }
    }
  }
`;
const BlueText = styled.span`
  margin-left: 1rem;
  color: ${Colors.primary.hex()};
`;

export const AddInfo = ({
  fieldValue,
  fieldName,
}: PropsWithoutRef<{
  fieldValue?: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}>) => {
  if (!fieldValue) {
    return (
      <>
        <BluePlus />
        <BlueText>add {splitWordsLowerCase(fieldName)}</BlueText>
      </>
    );
  }
  return (
    <>
      <DetailsValueView fieldName={fieldName} fieldValue={fieldValue} />
    </>
  );
};
