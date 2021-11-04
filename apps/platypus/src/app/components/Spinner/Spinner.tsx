import { Loader } from '@cognite/cogs.js';
import { StyledLoaderContainer } from './elements';

export const Spinner = () => (
  <StyledLoaderContainer className="spinner">
    <Loader width={150} darkMode={false} />
  </StyledLoaderContainer>
);
