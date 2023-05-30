import styled from 'styled-components';
import { DocumentDetails } from './DocumentDetails';

export default {
  title: 'ResourceDetails/DocumentDetails',
  component: DocumentDetails,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
