import { CSSProperties } from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { StyledLoaderContainer } from './elements';

export const Spinner = ({
  style,
  size = 40,
}: {
  style?: CSSProperties;
  size?: number;
}) => (
  <StyledLoaderContainer
    className="spinner"
    data-cy="loader-container"
    style={style}
  >
    <Icon type="Loader" size={size} />
  </StyledLoaderContainer>
);
