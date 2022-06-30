import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const Container = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  width: 100%;
  bottom: ${sizes.medium};
  left: 0;
  display: flex;
  justify-content: center;
`;

export const Content = styled.div`
  width: 85%;
  min-height: 200px;
  padding: ${sizes.medium} ${sizes.medium};
  background: #ffffff;
  border-radius: ${sizes.medium};
`;

export const TextWrapper = styled.div`
  display: inline-block;
`;

export const EditOptionItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const EditPopupContentFieldsWrapper = styled.div`
  display: flex;
  gap: ${sizes.small};
  flex-direction: column;
`;

export const FlexColumnSpaceAround = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
`;

export const FlexSpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const DivWithMarginBottom = styled.div`
  margin-bottom: 5%;
`;

export const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const ButtonWithMargin = styled(Button)`
  margin-left: ${sizes.extraSmall};
`;
