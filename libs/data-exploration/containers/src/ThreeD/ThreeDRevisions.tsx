import React, { useMemo } from 'react';

import { HighlightCell } from '@data-exploration/components';
import { DASH } from '@data-exploration-lib/core';
import { use3DRevisionsQuery } from '@data-exploration-lib/domain-layer';
export const ThreeDRevisions = ({
  modelId,
  is360Image,
}: {
  modelId: number;
  is360Image: boolean;
}) => {
  const { data: revisions = [] } = use3DRevisionsQuery(modelId, {
    enabled: !is360Image,
  });

  const revisionNumber = useMemo(() => {
    return is360Image ? DASH : revisions.length.toString();
  }, [revisions, is360Image]);
  return <HighlightCell text={revisionNumber} lines={1} />;
};
