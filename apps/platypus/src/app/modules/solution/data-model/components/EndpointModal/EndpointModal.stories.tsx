import { EndpointModal } from './EndpointModal';
import { Wrapper } from '@platypus-app/components/Styles/storybook';

export default {
  title: 'Basic Components/EndpointModal',
  component: EndpointModal,
};

export const Base = () => (
  <Wrapper>
    <EndpointModal
      endpoint="/api/v1/projects/mock/schema/api/blog/1/graphql"
      onRequestClose={() => {
        return;
      }}
    />
  </Wrapper>
);
