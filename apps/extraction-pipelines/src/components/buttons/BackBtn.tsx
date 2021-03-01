import React, { FunctionComponent, PropsWithChildren } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';

import { BackWrapper } from '../../styles/StyledPage';

interface BackBtnProps {
  path: string;
}

export const BackBtn: FunctionComponent<BackBtnProps> = ({
  path,
}: PropsWithChildren<BackBtnProps>) => {
  return (
    <BackWrapper to={createLink(path)}>
      <Icon type="ChevronLeftCompact" />
      Back
    </BackWrapper>
  );
};
