import styled from 'styled-components/macro';
import { Icon, Tabs } from '@cognite/cogs.js';

export const MainPanel = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 280px;
  right: 0;
  height: 100%;
  overflow: auto;
  padding: 16px 0 16px 16px;
`;

export const GraphContainer = styled.div`
  background: #fafafa;
  border-radius: 12px;
  width: 100%;
  height: fit-content;
  margin-right: 16px;
  padding: 24px 16px 0 16px;
`;

export const StyledTabs = styled(Tabs)`
  background: none;
  align-items: center;
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => props.color};
`;
