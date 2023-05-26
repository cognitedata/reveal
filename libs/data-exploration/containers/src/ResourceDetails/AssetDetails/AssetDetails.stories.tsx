import styled from 'styled-components';

import { AssetDetails } from './AssetDetails';

export default {
  title: 'ResourceDetails/AssetDetails',
  component: AssetDetails,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const Container = styled.div`
  height: 1000px;
  width: 700px;
`;
