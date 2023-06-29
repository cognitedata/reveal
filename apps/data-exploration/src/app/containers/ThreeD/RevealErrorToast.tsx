import React from 'react';

import { Flex, Title } from '@cognite/cogs.js';

import { TFunction } from '@data-exploration-lib/core';

export default function RevealErrorToast({
  error,
  t,
}: {
  error?: { message?: string };
  t: TFunction;
}) {
  return (
    <Flex direction="column" gap={10}>
      <Title level={6}>
        {t('FAILED_TO_LOAD_3D_DATA', 'Failed to load 3D Data')}
      </Title>
      <p>{error?.message}</p>
    </Flex>
  );
}
