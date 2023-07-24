import { CSSProperties } from 'styled-components';

import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

export const StyledLoaderContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(250, 250, 250, 0.5);
`;

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
