import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import theme from 'styles/theme';

export const ColumnFilterIcon = ({ filtered }: { filtered: boolean }) => (
  <FilterWrapper
    filtered={filtered}
    style={{
      position: 'relative',
      width: 'auto',
      padding: '0',
      marginLeft: '16px',
    }}
  >
    <Button
      icon="Filter"
      iconPlacement="right"
      style={{ color: filtered ? theme.actionText : 'black' }}
    >
      Filter
    </Button>
  </FilterWrapper>
);

export const FilterWrapper = styled.div`
  width: auto;
  display: inline-block;
  color: ${(props: { filtered: boolean }) =>
    props.filtered ? theme.primaryBackground : 'black'};
  cursor: pointer;
  :hover {
    background: transparent;
  }
`;
