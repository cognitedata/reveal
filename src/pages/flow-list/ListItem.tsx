import { createLink } from '@cognite/cdf-utilities';
import { Body, Colors, Flex } from '@cognite/cogs.js';
import { CANVAS_PATH } from 'common';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Flow } from 'types';
import FlowListItemMenu from './FlowItemMenu';

export default function ListItem({ flow }: { flow: Flow }) {
  return (
    <StyledListItem justifyContent="space-between">
      <Link to={createLink(`/${CANVAS_PATH}/${flow.id}`)}>
        <Flex direction="column" gap={4}>
          <Body level={2} strong>
            {flow.name}
          </Body>
          <div style={{ color: Colors['text-icon--muted'] }}>
            {flow.description}
          </div>
        </Flex>
      </Link>
      <FlowListItemMenu id={flow.id} />
    </StyledListItem>
  );
}

const StyledListItem = styled(Flex)`
  border: 1px solid ${Colors['border-default']};
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 16px;
`;
