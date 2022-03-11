import styled from 'styled-components/macro';

import Typography from 'components/typography/Typography';
import { FlexColumn, sizes } from 'styles/layout';
import { FadeInFast } from 'styles/transition';

export const Container = styled(FlexColumn)`
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex: 1;
`;

export const Content = styled.div`
  min-height: 50%;
  text-align: center;
  width: 100%;
`;

export const StyledTypography = styled(Typography)`
  display: block;
  position: relative;
  height: 1.4em; // Height of 1 line (140% line height)
  width: 100%;
  & > span {
    margin-top: 8px;
  }
`;

export const Text = styled.span`
  opacity: ${(props: { visible: boolean }) => (props.visible ? '1' : '0')};
  text-align: center;
  transition: opacity 0.1s;
  width: 100%;
  position: absolute;
  white-space: nowrap;
  top: 0;
  left: 0;
`;

export const SubTitleText = styled.span`
  opacity: ${(props: { visible: boolean }) => (props.visible ? '1' : '0')};
  transition: opacity 0.1s;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  padding-top: ${sizes.small};
  letter-spacing: 0em;
  color: var(--cogs-text-color-secondary);
`;

export const ChildrenContainer = styled.div`
  ${FadeInFast()};
  margin-top: ${sizes.small};

  opacity: ${(props: { visible: boolean }) => (props.visible ? '1' : '0')};
  transition: opacity 0.1s;
`;

export const SubtitleContainer = styled.div`
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
