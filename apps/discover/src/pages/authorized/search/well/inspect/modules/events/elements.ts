import styled from 'styled-components/macro';

import { Col } from '@cognite/cogs.js';

import layers from '_helpers/zindex';

const boxSHadow = `box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);`;

export const NdsFilterWrapper = styled.div`
  .nds-events-expander {
    position: relative;
    flex: 1;
    width: 100% !important;
  }
`;

export const NdsFilterContent = styled.div`
  height: 100%;
  ${boxSHadow}
`;

export const NDSTableWrapper = styled.div`
  margin-top: 10px;
  height: ${(props: { height: string }) => props.height};
  min-height: 200px;
  overflow-y: auto;
  ${boxSHadow}
`;

export const NPTFilterContent = styled.div`
  z-index: ${layers.DROPDOWN_SELECT};
  height: 25%;
  padding-top: 5px;
  padding-left: 10px;
  padding-bottom: 10px;
  ${boxSHadow}
`;

export const NPTTableWrapper = styled.div`
  margin-top: 10px;
  height: calc(75% - 10px);
  overflow-y: auto;
  ${boxSHadow}
`;

export const ResizeHandle = styled.div`
  background-color: transparent;
  position: absolute;
  width: 100%;
  height: 15px;
  z-index: ${layers.RESIZE_BAR};
  border-left: none;
  overflow: hidden;
  cursor: row-resize;
`;

export const FilterCol = styled(Col)`
  display: flex;
  justify-content: center;
  padding: 4px;
  align-items: center;
`;
