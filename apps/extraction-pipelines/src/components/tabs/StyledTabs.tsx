import React from 'react';
import styled from 'styled-components';
import { Colors, TabPane, Tabs } from '@cognite/cogs.js';

const StyledTabs = styled((props) => <Tabs {...props} />)`
  height: 100%;

  .rc-tabs-nav {
    padding: 0 1rem;
    margin-bottom: 0;
    &::before {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 0;
      border-bottom: 1px solid ${Colors['greyscale-grey2'].hex()};
      content: '';
    }
  }
  .rc-tabs-tabpane {
    display: grid;
    grid-template-columns: ${(props) =>
      props.sidepaneltabs ? 'auto' : 'auto 25rem'};
    padding: 0 1rem;
  }
  .rc-tabs-tab {
    .rc-tabs-tab-btn {
      font-weight: 600;
      line-height: 1.25rem;
      &:hover {
        background-color: ${Colors.white.hex()};
      }
    }
  }
  .rc-tabs-content {
    height: 100%;
    overflow-y: ${(props) => (props.sidepaneltabs ? 'auto' : 'hidden')};
  }
  .rc-tabs-content-holder {
    min-height: 0;
  }
`;

const StyledTabPane = styled((props) => (
  <TabPane {...props}>{props.children}</TabPane>
))`
  grid-template-rows: 100%;
`;

export { StyledTabs, StyledTabPane };
