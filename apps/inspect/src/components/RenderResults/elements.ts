import styled from 'styled-components';

export const StyledKDB = styled.kbd`
  font-family: monospace;
  background: rgba(0 0 0 / 0.1);
  padding: 4px 6px;
  border-radius: 4px;
  fontsize: 14;
`;

export const ResultItemWrapper = styled.div<{ active: boolean }>`
padding: 12px 16px;
background: active ? rgb(53 53 54) : transparent;
border-left: 2px solid ${(props) =>
  props.active ? 'rgb(28 28 29)' : 'transparent'};
display: flex;
align-items: center;
justify-content: space-between;
cursor: pointer;
`;

export const GroupName = styled.div`
  padding: 8px 16px;
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.5;
`;
