import { Icon } from '@cognite/cogs.js';
import { CSSProperties } from 'styled-components';
import { StyledLoaderContainer } from './elements';

export const Spinner = ({
  style,
  size = 40,
}: {
  style?: CSSProperties;
  size?: number;
}) => (
  <StyledLoaderContainer className="spinner" style={style}>
    <Icon type="Loader" size={size} />
  </StyledLoaderContainer>
);
