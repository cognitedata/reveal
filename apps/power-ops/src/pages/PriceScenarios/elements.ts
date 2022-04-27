import styled from 'styled-components/macro';
import { Icon, Tabs } from '@cognite/cogs.js';

export const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 280px;
  right: 0;
  height: 100%;
  overflow: auto;
  padding: 16px;
`;

export const GraphContainer = styled.div`
  background: #fafafa;
  border-radius: 12px;
  width: 100%;
  height: fit-content;
  padding: 24px 16px 0 16px;
`;

export const StyledTabs = styled(Tabs)`
  background: none;
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => props.color};
`;

export const StyledTable = styled.div`
  text-align: left;
  overflow: scroll;
`;
