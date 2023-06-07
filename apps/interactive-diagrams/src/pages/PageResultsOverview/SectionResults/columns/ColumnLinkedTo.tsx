import React from 'react';
import { Body, Colors } from '@cognite/cogs.js';
import { useParsingJob } from 'hooks';
import DetectedTags from 'components/DetectedTags';

type Props = { fileId: number };

export default function ColumnLinkedTo({ fileId }: Props): JSX.Element {
  const parsingJob = useParsingJob();

  const { failedFiles } = parsingJob;

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === fileId
  );
  if (didFileFail)
    return (
      <Body level={2} style={{ color: Colors['greyscale-grey6'].hex() }}>
        No links
      </Body>
    );

  return <DetectedTags fileId={fileId} refetch />;
}
