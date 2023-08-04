import React from 'react';

import { TimeDisplay } from '@data-exploration/components';

import { Body } from '@cognite/cogs.js';

import { DASH } from '@data-exploration-lib/core';
import { use3DRevisionsQuery } from '@data-exploration-lib/domain-layer';

export const ThreeDModelLastUpdated = ({
  modelId,
  lastUpdatedTime,
}: {
  modelId: number;
  lastUpdatedTime?: Date;
}) => {
  const { data: lastUpdatedRevision } = use3DRevisionsQuery(modelId, {
    enabled: !lastUpdatedTime,
    select: (revisionArr = []) =>
      revisionArr.length > 0
        ? revisionArr.reduce((prev, current) =>
            prev.createdTime > current.createdTime ? prev : current
          )
        : undefined,
  });

  return (
    <Body level={2}>
      {lastUpdatedTime || lastUpdatedRevision?.createdTime ? (
        <TimeDisplay
          value={lastUpdatedTime ?? lastUpdatedRevision?.createdTime}
        />
      ) : (
        DASH
      )}
    </Body>
  );
};
