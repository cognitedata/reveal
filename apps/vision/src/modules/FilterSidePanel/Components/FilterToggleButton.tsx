import React from 'react';

import styled from 'styled-components';

import { Button, Tooltip } from '@cognite/cogs.js';

export default function FilterToggleButton({
  toggleOpen,
}: {
  toggleOpen: () => void;
}) {
  return (
    // TODO: add badge number if filer is not empty: https://github.com/cognitedata/data-exploration/blob/master/src/app/containers/Exploration/FilterToggleButton.tsx
    <HideFiltersTooltip content="Filter files">
      <Button onClick={toggleOpen} type="ghost" icon="Filter" />
    </HideFiltersTooltip>
  );
}

const HideFiltersTooltip = styled(Tooltip)`
  margin-bottom: 8px;
`;
