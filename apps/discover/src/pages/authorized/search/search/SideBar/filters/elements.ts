import styled from 'styled-components/macro';

import { Label, Icon } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

const IconWrapper = styled(Label)`
  padding: ${sizes.small};
  border-radius: ${sizes.small};
  cursor: pointer;
`;

export const SeismicIconWrapper = styled(IconWrapper)`
  background: rgba(140, 140, 140, 0.08);
`;

export const WellIconWrapper = styled(IconWrapper)`
  background: rgba(112, 100, 246, 0.08);
`;

export const DocumentIconWrapper = styled(IconWrapper)`
  background: rgba(94, 146, 246, 0.08);
`;

export const SeismicIcon = styled(Icon)`
  color: var(--cogs-greyscale-grey6);
`;

export const WellIcon = styled(Icon)`
  color: #7064f6;
`;

export const DocumentIcon = styled(Icon)`
  color: #5e92f6;
`;
