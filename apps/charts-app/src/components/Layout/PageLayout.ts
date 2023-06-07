import styled from 'styled-components/macro';

export default styled.div`
  height: calc(100vh - var(--cdf-ui-navigation-height));
  width: 100%;
  display: flex;
  flex-direction: column;

  main,
  #chart-view {
    height: calc(100% - 56px + var(--cdf-ui-navigation-height));
    display: flex;
    flex-direction: row;

    /** Hide "More" button from the Cogs tabs component that showed up on some zoom levels */
    .rc-tabs-nav-more {
      display: none;
    }
  }
  #chart-view {
    height: 100%;
    overflow: hidden;
  }
`;
