import styled from 'styled-components/macro';

import { FlexColumn, FlexNoWrapRow, sizes } from 'styles/layout';

export const RangeFilterWrapper = styled.div`
  margin-bottom: ${sizes.medium};
`;

export const RangeFilterTitle = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${sizes.small};
  color: var(--cogs-greyscale-grey9);
  font-weight: 500;
`;

export const RangeSliderWrapper = styled.div`
  padding-top: ${sizes.small};
  padding-left: ${sizes.small};
  padding-right: ${sizes.small};
  padding-bottom: ${sizes.normal};
  & > * .rc-slider-mark {
    display: none;
  }
`;

export const InputWrapper = styled(FlexNoWrapRow)`
  padding-top: ${sizes.small};
  padding-bottom: ${sizes.small};
  & > .cogs-input-container {
    width: calc(50% - 4px);
    & > * input {
      width: 100%;
    }
  }
`;
