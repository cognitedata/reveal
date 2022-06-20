import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexRow, sizes } from 'styles/layout';

export const FiltersBar = styled(FlexRow)`
  padding: ${sizes.normal};
  padding-bottom: 0;
  z-index: ${layers.FILTER};

  & > *:not(:last-child) {
    margin-right: ${sizes.normal};
  }
`;

export const DetailedViewContent = styled.div`
  overflow: auto;
  height: 100%;
  padding: ${sizes.normal};
`;

export const DetailedViewWrapper = styled.div`
  margin-left: 11%;
  margin-right: 11%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
