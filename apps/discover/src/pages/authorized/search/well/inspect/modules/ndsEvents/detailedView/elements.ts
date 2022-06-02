import styled from 'styled-components/macro';

import { FlexRow, sizes } from 'styles/layout';

export const FiltersBar = styled(FlexRow)`
  padding: ${sizes.normal};
  padding-bottom: 0;

  & > *:not(:last-child) {
    margin-right: ${sizes.normal};
  }
`;

export const DetailedViewContent = styled.div`
  overflow: auto;
  height: 100%;
  padding: ${sizes.normal};
`;
