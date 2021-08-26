import React from 'react';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { Body } from '@cognite/cogs.js';
import DetectedTags from 'components/DetectedTags';

type Props = { workflowId: number; fileId: number };

export default function ColumnLinkedTo({
  workflowId,
  fileId,
}: Props): JSX.Element {
  const parsingJob = useParsingJob(workflowId);

  const { failedFiles } = parsingJob;

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === fileId
  );
  if (didFileFail) return <Body level={2}>No detected tags</Body>;

  return <DetectedTags fileId={fileId} />;
}
