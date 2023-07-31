import styled from 'styled-components/macro';

import { FlexAlignItems, FlexColumn, sizes } from 'styles/layout';

export const WellDateRangeWrapper = styled.div`
  padding-bottom: ${sizes.medium};
  & > * .cogs-date-range--input {
    margin-top: ${sizes.small};
    margin-bottom: ${sizes.small};
    border: 2px solid var(--cogs-greyscale-grey4) !important;
    width: 100%;
  }
`;

export const MultiSelectWrapper = styled.div`
  padding-top: ${sizes.small};
  padding-bottom: ${sizes.small};
  margin-bottom: ${sizes.normal};
`;

export const DateRangeTitle = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${sizes.small};
  color: var(--cogs-greyscale-grey9);
  font-weight: 500;
`;

export const DateRangeFooterWrapper = styled(FlexAlignItems)`
  border-top: 1px solid var(--cogs-greyscale-grey3);
  justify-content: flex-end;
  padding-right: ${sizes.normal};
  padding-top: ${sizes.extraSmall};
  .cogs-btn {
    margin-left: ${sizes.extraSmall};
  }
`;
