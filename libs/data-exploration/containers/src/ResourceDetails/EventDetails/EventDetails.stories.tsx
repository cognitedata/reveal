import styled from 'styled-components';

import { EventDetails } from './EventDetails';

export default {
  title: 'ResourceDetails/EventDetails',
  component: EventDetails,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
