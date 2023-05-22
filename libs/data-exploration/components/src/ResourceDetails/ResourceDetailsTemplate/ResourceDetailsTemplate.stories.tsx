import styled from 'styled-components';
import { ResourceDetailsTemplate } from './ResourceDetailsTemplate';

export default {
  title: 'Component/ResourceDetailsTemplate',
  component: ResourceDetailsTemplate,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Default = () => {
  return (
    <ResourceDetailsTemplate title="TEST" icon="Assets">
      <p>Custom content</p>
    </ResourceDetailsTemplate>
  );
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
