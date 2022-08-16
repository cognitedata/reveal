import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Tooltip } from '@cognite/cogs.js';

import { DataError } from 'modules/inspectTabs/types';

import {
  WellboreErrorWarningButton,
  WellboreErrorsWrapper,
  WellboreErrorItemsTitle,
} from './elements';

export type WellboreErrorWarningProps = {
  errors: DataError[];
};

export const WellboreErrorWarning: React.FC<WellboreErrorWarningProps> = ({
  errors,
}) => {
  return (
    <Tooltip
      placement="right-start"
      appendTo={document.body}
      content={
        <WellboreErrorsWrapper>
          {errors.map((error, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <DataErrorItem key={`${error.message}-${index}`} {...error} />
          ))}
        </WellboreErrorsWrapper>
      }
    >
      <WellboreErrorWarningButton />
    </Tooltip>
  );
};

export const DataErrorItem: React.FC<DataError> = ({ message, items }) => {
  if (!items || isEmpty(items)) {
    return <li>{message}</li>;
  }

  return (
    <>
      <WellboreErrorItemsTitle>{message}</WellboreErrorItemsTitle>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </>
  );
};
