import { Detail, Flex, Title } from '@cognite/cogs.js';
import React from 'react';
import ErrorIcon from './ErrorIcon';

type Props = {
  error: any;
};
export function ErrorFeedback({ error }: Props) {
  return (
    <Flex
      gap={16}
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <ErrorIcon />
      <Title level={5}>
        {error.status ? `${error.status}:` : null}
        {error.message}
      </Title>
      {error.requestId && (
        <Flex gap={4} direction="column">
          <Detail>Request ID: </Detail>
          <Detail>{error.requestId}</Detail>
        </Flex>
      )}
    </Flex>
  );
}
