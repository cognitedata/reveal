import { Icon } from '@cognite/cogs.js';
import { StyledLoaderContainer } from './elements';

export const Spinner = () => (
  <StyledLoaderContainer className="spinner">
    <Icon type="Loading" size={40} />
  </StyledLoaderContainer>
);
