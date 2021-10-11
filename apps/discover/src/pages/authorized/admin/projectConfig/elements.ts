import styled from 'styled-components/macro';

import { Flex } from '@cognite/cogs.js';

import { PageBottomPaddingWrapper, sizes } from 'styles/layout';

export const ProjectConfigSidebar = styled(Flex)`
  width: 300px;
  height: 100%;
  background-color: var(--cogs-greyscale-grey2);
`;

export const ProjectConfigContainer = styled(PageBottomPaddingWrapper)`
  display: flex;
  flex-direction: column;
  gap: ${sizes.normal};
  height: 100%;
  width: 100%;
`;

export const ProjectConfigFooter = styled(Flex)`
  margin-top: auto;
`;
