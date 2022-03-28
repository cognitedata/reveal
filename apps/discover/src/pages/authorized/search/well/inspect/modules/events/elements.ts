import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Col } from '@cognite/cogs.js';

const boxSHadow = `box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);`;

export const NdsFilterWrapper = styled.div`
  .nds-events-expander {
    position: relative;
    flex: 1;
    width: 100% !important;
  }
`;

export const NDSTableWrapper = styled.div`
  margin-top: 10px;
  height: ${(props: { height: string }) => props.height};
  min-height: 200px;
  overflow-y: auto;
  ${boxSHadow}
`;

export const NPTFilterContent = styled.div`
  z-index: ${layers.FILTER_BOX};
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

export const FilterCol = styled(Col)`
  display: flex;
  justify-content: center;
  padding: 4px;
  align-items: center;
  min-width: 220px;
`;
