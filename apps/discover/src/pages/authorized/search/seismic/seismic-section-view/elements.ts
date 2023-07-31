import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const SeismicModalBodyWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const SeismicModalContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const SeismicHeaderWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  background-color: var(--cogs-white);
  height: 56px;
  padding: 10px 50px 10px 36px;
  border-radius: 5px 5px 0 0;
`;

export const SeismicSecondaryHeaderWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  background-color: var(--cogs-white);
  height: 46px;
  padding: 10px 64px;
  align-items: center;
  justify-content: center;
`;

export const VertSeperator = styled.div`
  display: flex;
  border-right: 1px solid var(--cogs-color-strokes-default);
  height: 100%;
  margin: 0 14px;
`;

export const HeaderButtonsWrapper = styled.div`
  margin-right: ${sizes.small};
`;

export const ButtonValue = styled.span`
  font-weight: 400;
  margin-left: 2px;
`;

export const StyledCanvas = styled.canvas`
  cursor: ${(props: { cursorMode: string }) =>
    props.cursorMode === 'pan' ? 'pointer' : 'auto'};
`;

export const HorizontalRangeContainer = styled.div`
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  position: absolute;
  height: 15px;
  width: ${(props: { width: number }) => `${props.width}px`};
  ${(props: { bottom: boolean }) =>
    props.bottom ? 'bottom: 8px;' : 'top: 8px;'};
`;

export const HorizontalRangeValue = styled.span`
  width: 50px;
  display: inline-block;
  position: absolute;
  text-align: center;
  left: ${(props: { left: number }) => props.left - 25}px;
`;

export const SeismicImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  padding: 30px;
  position: relative;
  outline: 2px solid var(--cogs-black);
  outline-offset: -30px;
`;

export const HorizontalRangeType = styled.span`
  width: 50px;
  text-align: center;
  left: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  position: absolute;
  height: 15px;
  ${(props: { bottom: boolean }) =>
    props.bottom ? 'bottom: 8px;' : 'top: 8px;'};
`;
