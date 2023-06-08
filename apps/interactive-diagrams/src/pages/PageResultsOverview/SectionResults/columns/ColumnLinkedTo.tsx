import React from 'react';

import DetectedTags from '@interactive-diagrams-app/components/DetectedTags';
import { useParsingJob } from '@interactive-diagrams-app/hooks';

import { Body, Colors } from '@cognite/cogs.js';

type Props = { fileId: number };

export default function ColumnLinkedTo({ fileId }: Props): JSX.Element {
  const parsingJob = useParsingJob();

  const { failedFiles } = parsingJob;

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === fileId
  );
  if (didFileFail)
    return (
      <Body level={2} style={{ color: Colors['decorative--grayscale--600'] }}>
        No links
      </Body>
    );

  return <DetectedTags fileId={fileId} refetch />;
}
