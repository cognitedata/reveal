import styled, { StyledComponent } from 'styled-components';
import { Button, ButtonProps } from '@cognite/cogs.js';

interface Clickable {
  onClick?: (e: any) => void;
}

export const Flex = styled.div<
  {
    direction: 'column' | 'row';
    items?: string;
    gap?: number;
    justify?: string;
    heightFull?: boolean;
  } & Clickable
>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  ${({ items }) => (items ? `align-items: ${items};` : ``)}
  ${({ justify }) => (justify ? `justify-content: ${justify};` : ``)}
  ${({ gap }) => (gap ? `gap: ${gap}px;` : ``)}
  ${({ heightFull }) => (heightFull ? `height: 100%;` : ``)}
`;

export const Box = styled.div<{
  m?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  p?: number;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  inline?: boolean;
  flex?: number;
  spaceY?: number;
  backgroundColor?: string;
  borderRadius?: number;
  cursor?: string;
  scrollY?: boolean;
}>`
  height: auto;
  ${({ scrollY }) => scrollY && `overflow-y: auto;`}

  ${({ m }) => m && `margin: ${m}px;`}
  ${({ mt }) => mt && `margin-top: ${mt}px;`}
  ${({ mb }) => mb && `margin-bottom: ${mb}px;`}
  ${({ ml }) => ml && `margin-left: ${ml}px;`}
  ${({ mr }) => mr && `margin-right: ${mr}px;`}

  ${({ p }) => p && `padding: ${p}px;`}
  ${({ pt }) => pt && `padding-top: ${pt}px;`}
  ${({ pb }) => pb && `padding-bottom: ${pb}px;`}
  ${({ pl }) => pl && `padding-left: ${pl}px;`}
  ${({ pr }) => pr && `padding-right: ${pr}px;`}

  ${({ backgroundColor }) =>
    backgroundColor && `background-color: ${backgroundColor};`}
  ${({ borderRadius }) => borderRadius && `border-radius: ${borderRadius}px;`}
  ${({ cursor }) => cursor && `cursor: ${cursor};`}

  display: ${({ inline }) => (inline ? 'inline-block' : 'block')};
  ${({ flex }) => (flex ? `flex: ${flex};` : ``)}
  ${({ spaceY }) =>
    spaceY
      ? `
       > * {
         margin-bottom: ${spaceY}px;
       }
       `
      : ``}
`;

export const Text = styled.span<{
  color?: string;
  size?: number;
  weight?: number;
  transform?: string;
  cursor?: string;
}>`
  color: ${({ color }) => color ?? 'black'};
  font-size: ${({ size }) => size ?? 12}px;
  font-weight: ${({ weight }) => weight ?? 300}px;
  ${({ transform }) => transform && `text-transform: ${transform};`}
  ${({ cursor }) => cursor && `cursor: ${cursor};`}
`;

export const Card = styled.div`
  @media (max-width: 450px) {
    height: 100%;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
  @media (min-width: 451px) {
    max-height: calc(100vh - 10px);
  }
  width: 450px;
  max-width: 100%;
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 16.8443px 50.5328px rgba(0, 0, 0, 0.1),
    0px 13.4754px 20.2131px rgba(0, 0, 0, 0.07);
`;

export const FatButton: StyledComponent<
  React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >,
  any,
  any,
  never
> = styled(Button)`
  background-color: #f5f5f5;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  padding: 35px !important;
`;
