import CopyToClipboard from 'react-copy-to-clipboard';

import styled from 'styled-components/macro';

import { Flex, Title, Tooltip } from '@cognite/cogs.js';

import Divider from 'components/Divider';
import { FlexAlignJustifyContent, FlexAlignItems, sizes } from 'styles/layout';

import { CARD_WIDTH } from './constants';

const Container = styled.div`
  width: ${CARD_WIDTH}px;
  border-radius: ${sizes.small};
  box-shadow: 0px 10px 24px 4px #0000001a;
  background-color: var(--cogs-white);
`;

const Content = styled.div`
  padding: ${({ collapsed }: { collapsed: boolean }) =>
    collapsed ? sizes.small : sizes.normal};
  padding-bottom: ${({ collapsed }: { collapsed: boolean }) => !collapsed && 0};
  transition: 200ms;
`;

const CopyIconContainer = styled.div`
  padding: ${sizes.small};
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const TitleContainer = styled(Title)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 0px !important;
  padding-left: ${sizes.small};
  color: var(--cogs-greyscale-grey9);
`;

const CopyToClipboardContainer = styled(CopyToClipboard)`
  flex: 1;
`;

const DividerContainer = styled(Divider)`
  margin: 0px -${sizes.normal} !important;
`;

const HeaderContainer = styled(Flex)`
  padding-bottom: ${sizes.normal};
  height: 52px; // total 68px with the padding
`;

const LoaderContainer = styled(FlexAlignJustifyContent)`
  height: 100%;
  width: 100%;
  padding: ${sizes.medium};
`;

const PreviewTitleAlignItems = styled(FlexAlignItems)`
  overflow: hidden;
  width: 100%;
`;

const TooltipContainer = styled(Tooltip)`
  width: 100% !important;
`;

export {
  Container,
  Content,
  CopyIconContainer,
  TitleContainer,
  CopyToClipboardContainer,
  DividerContainer,
  HeaderContainer,
  LoaderContainer,
  PreviewTitleAlignItems,
  TooltipContainer,
};
