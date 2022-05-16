import styled from 'styled-components';

export const StyleSelectorWrapper = styled.div`
  background: white;
  box-shadow: var(--cogs-z-8);
  width: auto;
  display: inline-block;
  border-radius: 4px;
  header {
    h4 {
      color: var(--cogs-text-hint);
      font-weight: bold;
      margin: 0;
      line-height: 0;
    }
    margin-bottom: 8px;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0 0 12px;
  }
  h5 {
    font-size: 12px;
    padding-left: 4px;
    margin-top: 4px;
    color: var(--cogs-text-hint);
  }
  main {
    padding: 8px;
  }
`;
