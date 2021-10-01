import styled from 'styled-components';
import z from 'utils/z';

export const WorkSpaceToolsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2px;
  position: fixed;
  left: 16px;
  bottom: 16px;
  background: #ffffff;

  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.08),
    0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  z-index: ${z.OVERLAY};

  &.expanded {
    left: 386px;
  }
`;

export const ToolboxSeparator = styled.div`
  background: #d9d9d9;
  display: block;
  margin: 4px;
  height: 1px;
  overflow: hidden;
  width: 100%;
`;
