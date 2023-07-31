import styled from 'styled-components/macro';

import { Flex, sizes } from 'styles/layout';

const SELECTED_OPTION_COLOR = '#3F56B5';

export const OptionWrapper = styled(Flex)`
  font-size: 14px;
  font-weight: 500;
  ${(props: { $selected: boolean }) =>
    props.$selected &&
    `
    color: ${SELECTED_OPTION_COLOR};
  `}
`;

export const SelectedOptionIconWrapper = styled(Flex)`
  padding-left: ${sizes.normal};
  margin-left: auto;
  margin-right: -${sizes.small};
  color: ${SELECTED_OPTION_COLOR};
  visibility: ${(props: { $selected: boolean }) =>
    props.$selected ? 'visible' : 'hidden'};
`;
