import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { DivFlexProps } from 'styles/flex/StyledFlex';
import { bottomSpacing } from 'styles/StyledVariables';

type ButtonPlacedProps = DivFlexProps & { mb?: number };
export const ButtonPlaced = styled(Button)`
  align-self: ${(props: ButtonPlacedProps) => props.self ?? 'flex-start'};
  margin-bottom: ${(props: ButtonPlacedProps) =>
    `${props.mb ? `${props.mb}rem` : bottomSpacing}`};
`;
