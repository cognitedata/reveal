import React from 'react';

import { v4 as uuid } from 'uuid';

import { Dropdown } from '@cognite/cogs.js';

import { DataError } from 'modules/inspectTabs/types';

import { WellboreErrorWarningButton, WellboreErrorsWrapper } from './elements';

export type Props = {
  errors: DataError[];
};

export const WellboreErrorWarning: React.FC<Props> = ({ errors }) => {
  return (
    <Dropdown
      placement="left-start"
      openOnHover
      appendTo={document.body}
      content={
        <WellboreErrorsWrapper>
          <ul>
            {errors.map((error) => (
              <li key={`${error.message}-${uuid()}`}>{error.message}</li>
            ))}
          </ul>
        </WellboreErrorsWrapper>
      }
    >
      <WellboreErrorWarningButton />
    </Dropdown>
  );
};
