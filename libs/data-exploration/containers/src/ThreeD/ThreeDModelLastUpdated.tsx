import { use3DRevisionsQuery } from '@data-exploration-lib/domain-layer';
import React from 'react';
import { TimeDisplay } from '@data-exploration/components';
import { DASH } from '@data-exploration-lib/core';
import { Body } from '@cognite/cogs.js';
export const ThreeDModelLastUpdated = ({
  modelId,
  is360Image,
}: {
  modelId: number;
  is360Image: boolean;
}) => {
  const { data: lastUpdatedRevision } = use3DRevisionsQuery(modelId, {
    enabled: !is360Image,
    select: (revisionArr = []) =>
      revisionArr.length > 0
        ? revisionArr.reduce((prev, current) =>
            prev.createdTime > current.createdTime ? prev : current
          )
        : undefined,
  });

  return (
    <Body level={2}>
      {lastUpdatedRevision ? (
        <TimeDisplay value={lastUpdatedRevision.createdTime} />
      ) : (
        DASH
      )}
    </Body>
  );
};
