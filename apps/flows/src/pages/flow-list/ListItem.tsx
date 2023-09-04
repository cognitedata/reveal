import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { CANVAS_PATH } from '@flows/common';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Colors, Flex } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk/dist/src';

import FlowListItemMenu from './FlowItemMenu';

const format = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
  timeStyle: 'long',
});

export default function ListItem({ file }: { file: FileInfo }) {
  return (
    <StyledListItem justifyContent="space-between">
      <Link to={createLink(`/${CANVAS_PATH}/${file.externalId}`)}>
        <Flex direction="column" gap={4}>
          <Body level={2} strong>
            {file.name}
          </Body>
          <div style={{ color: Colors['text-icon--muted'] }}>
            {format.format(file.uploadedTime)}
          </div>
          <div style={{ color: Colors['text-icon--muted'] }}>
            {file.metadata?.description}
          </div>
        </Flex>
      </Link>
      <FlowListItemMenu externalId={file.externalId!} />
    </StyledListItem>
  );
}

const StyledListItem = styled(Flex)`
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 16px;
`;
