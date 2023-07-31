import styled from 'styled-components/macro';

import { Flex, Body } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

import { FullContainer } from '../elements';

export const ProjectConfigSidebar = styled(Flex)`
  width: 400px;
  height: 100%;
  border-right: 1px solid var(--cogs-color-strokes-default);
`;

export const PaddingBottomBorder = styled.div`
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  padding: ${sizes.normal};
`;

export const ConfigFieldsWrapper = styled(Flex)`
  height: 100%;
  flex: 1 1 0;
  overflow: auto;
  padding: ${sizes.normal};
`;

export const ProjectConfigFooter = styled(Flex)`
  padding: 24px 16px;
  background-color: var(--cogs-greyscale-grey1);
`;

export const RightPanelContainer = styled(FullContainer)`
  flex: 1 1 0;
`;

export const FormContainer = styled(FullContainer)`
  height: 100%;
  flex: 1 1 0;
  padding: 16px;
  overflow: auto;
  .config-textarea-container {
    display: flex;
    flex-direction: column;
  }
`;

export const ItemWrapper = styled(Body)`
  width: 150px;
`;
