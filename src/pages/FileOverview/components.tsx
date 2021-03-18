import styled from 'styled-components';
import Layers from 'utils/zindex';

export const Wrapper = styled.div`
  display: flex;
  height: calc(100vh - 180px);
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-top: 20px;
  box-sizing: border-box;
`;

export const Header = styled.div`
  display: flex;
  padding: 20px 24px;
  box-shadow: 0px 0px 6px #cdcdcd;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  z-index: ${Layers.MINIMUM};
  margin-top: 40px;
  background: #fff;
  button {
    margin-right: 26px;
  }
`;
