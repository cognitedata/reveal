import React from 'react';

import styled from 'styled-components';

import { DetailsItem } from './DetailsItem';

export const GeneralDetails = ({ children }: React.PropsWithChildren) => {
  return (
    <GeneralDetailsCard>
      <GeneralDetailsContent>{children}</GeneralDetailsContent>
    </GeneralDetailsCard>
  );
};
GeneralDetails.Item = DetailsItem;

const GeneralDetailsCard = styled.div`
  width: 100%;
  /* background-color: var(--cogs-surface--medium); */
  background-color: white;
  border-radius: 8px;
`;

const GeneralDetailsContent = styled.div`
  display: grid;
  grid-gap: 4px;
  /* Adjusting for the 8px grid-gap as well */
  grid-template-columns: repeat(
    auto-fit,
    minmax(max(263px, calc(100% / 1 - 32px)), 1fr)
  );
`;
