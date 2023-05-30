import styled from 'styled-components';
import { SequenceDetails } from './SequenceDetails';

export default {
  title: 'ResourceDetails/SequenceDetails',
  component: SequenceDetails,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
