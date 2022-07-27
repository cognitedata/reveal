import { Collapse, Flex } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Container = styled.div`
  padding: 32px 64px 32px 64px;

  .eventsTable {
    display: flex;
    justify-content: center;
    width: 100%;

    .tableContainer {
      min-width: 100%;
    }
  }
`;

export const FlexContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;

  .cogs-flex {
    width: 100%;
  }

  h2,
  p {
    margin-bottom: 4px;
  }
`;

export const CollapseContainer = styled(Collapse)`
  margin: 24px 0 40px 0;
`;

export const Header = styled.span`
  display: flex;
  align-items: center;
  height: 64px;
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 8px;

  h1 {
    margin: 0;
    padding-left: 20px;
    font-size: 28px;
  }

  .cogs-label {
    margin-left: auto;
  }
`;
