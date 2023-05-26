import styled from 'styled-components';

import { TimeseriesDetails } from './TimeseriesDetails';

export default {
  title: 'ResourceDetails/TimeseriesDetails',
  component: TimeseriesDetails,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
