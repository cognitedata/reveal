import { Icon } from '@cognite/cogs.js';
import { CSSProperties } from 'styled-components';
import { StyledLoaderContainer } from './elements';

export const Spinner = ({ style }: { style?: CSSProperties }) => (
  <StyledLoaderContainer className="spinner" style={style}>
    <Icon type="Loading" size={40} />
  </StyledLoaderContainer>
);
