import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const DisplayContainer = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  background: #ffffff;
  border-radius: ${sizes.medium} ${sizes.medium} 0 0;
`;

export const EditContainer = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  background: #ffffff;
`;

export const Content = styled.div`
  width: 100%;
  min-height: 200px;
  padding: ${sizes.medium} ${sizes.medium};
`;

export const EditContent = styled.div`
  width: 100%;
  min-height: 200px;
  padding: ${sizes.medium} ${sizes.medium};
`;

export const TextWrapper = styled.div`
  display: inline-block;
`;

export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const EditPopupContentFieldsWrapper = styled.div`
  display: flex;
  gap: ${sizes.small};
  flex-direction: column;
`;

export const FlexColumnSpaceBetween = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const FlexSpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const DivWithMarginBottom = styled.div`
  margin-bottom: 5%;
`;

export const DivLine = styled.div`
  width: 40px;
  height: 3px;
  margin: auto;
  margin-bottom: ${sizes.normal};
  background: #d9d9d9;
`;

export const GridPopupHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 25px;
`;

export const CenteredTitle = styled(Title)`
  text-align: center;
  align-self: center;
`;
