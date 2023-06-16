import styled from 'styled-components';

import { Flex, Icon } from '@cognite/cogs.js';

import ListItem from './ListItem';

const LoadingMore = () => (
  <ListItem>
    <StyledContent>
      <Icon type="Loader" size={14} />
      Loading more data
    </StyledContent>
  </ListItem>
);

const StyledContent = styled(Flex).attrs({
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
})`
  line-height: 20px;
  padding: 8px;
`;

export default LoadingMore;
