import styled from 'styled-components';
import z from 'utils/z';

export const CommentsWrapper = styled.div`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  z-index: ${z.LIST_TOOL_OVERLAY};
  right: 0;
  width: 430px;
  background: white;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.08),
    0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  display: block;
  overflow: hidden;
  height: auto;
  padding-bottom: 10px;
  min-height: 200px;

  .header {
    height: 40px;
    line-height: 40px;
    display: block;
    overflow: hidden;
    text-transform: uppercase;
    color: var(--cogs-midblue-2);
    padding-left: 16px;
  }
`;
