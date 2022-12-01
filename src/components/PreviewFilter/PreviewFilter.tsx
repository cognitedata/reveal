import { Input } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

interface Props {
  query?: string;
  onQueryChange?: (newQuery: string) => void;
}
export const DefaultPreviewFilter: React.FC<Props> = ({
  query,
  onQueryChange,
  children,
}) => {
  return (
    <>
      <StyledInput
        variant="default"
        value={query || ''}
        placeholder={'Search for name, description, etc...'}
        onChange={event => onQueryChange?.(event.target.value)}
      />
      <FlexGrow />
      {children}
    </>
  );
};

const FlexGrow = styled.div`
  flex-grow: 1;
`;

const StyledInput = styled(Input)`
  width: 100%;
  max-width: 300px;
  border-color: #cccccc;
`;
