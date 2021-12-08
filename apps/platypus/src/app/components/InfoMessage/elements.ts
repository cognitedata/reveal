import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';

export const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledGraphic = styled.div`
  margin: 1rem 0;
`;

export const StyledTitle = styled(Title)`
  margin: 0.5rem 0;
`;

export const StyledContent = styled.div`
  text-align: center;
`;

interface IStyledIconType {
  type: string;
  size: number;
}

export const StyledIcon = styled.div<IStyledIconType>`
  display: inline-block;
  width: ${(props: IStyledIconType) => `${props.size}px`};
  height: ${(props: IStyledIconType) => `${props.size}px`};
  background: ${(props: IStyledIconType) =>
    `transparent url('/images/graphics/${props.type.toLocaleLowerCase()}.svg') center center no-repeat`};
  background-size: cover;
`;
