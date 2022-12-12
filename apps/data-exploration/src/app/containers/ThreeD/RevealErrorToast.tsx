import React from 'react';
import { Flex, Title } from '@cognite/cogs.js';

export default function RevealErrorToast({
  error,
}: {
  error?: { message?: string };
}) {
  return (
    <Flex direction="column" gap={10}>
      <Title level={6}>Failed to load 3D Model</Title>
      <p>{error?.message}</p>
    </Flex>
  );
}
