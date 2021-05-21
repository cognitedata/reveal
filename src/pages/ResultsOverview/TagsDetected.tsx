import React from 'react';
import { Spin } from 'antd';
import { Flex, CountTag } from 'components/Common';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { Body, Icon, Tooltip } from '@cognite/cogs.js';

type Props = { workflowId: number; fileId: number };

export default function TagsDetected({
  workflowId,
  fileId,
}: Props): JSX.Element {
  const parsingJob = useParsingJob(workflowId);

  const { failedFiles } = parsingJob;

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === fileId
  );

  const fileAnnotations =
    parsingJob?.annotationCounts && parsingJob?.annotationCounts[fileId];

  if (fileAnnotations) {
    const assetTags =
      fileAnnotations?.existingAssetsAnnotations +
      fileAnnotations?.newAssetAnnotations;
    const filesTags =
      fileAnnotations?.existingFilesAnnotations +
      fileAnnotations?.newFilesAnnotations;
    const hasNewFiles = !!fileAnnotations?.newFilesAnnotations;
    const hasNewAssets = !!fileAnnotations?.newAssetAnnotations;

    return (
      <Flex>
        <CountTag
          type="assets"
          value={assetTags}
          draft={hasNewAssets}
          tooltipContent={
            hasNewAssets ? (
              <Body style={{ color: 'white' }}>
                {fileAnnotations?.newAssetAnnotations} new tags detected.
              </Body>
            ) : undefined
          }
        />
        <CountTag
          type="files"
          value={filesTags}
          draft={hasNewFiles}
          tooltipContent={
            hasNewFiles ? (
              <Body style={{ color: 'white' }}>
                {fileAnnotations?.newFilesAnnotations} new tags detected.
              </Body>
            ) : undefined
          }
        />
      </Flex>
    );
  }

  if (didFileFail) {
    return (
      <Tooltip content={didFileFail.errorMessage} placement="left">
        <Body level={2}>
          <Icon type="ErrorStroked" style={{ verticalAlign: '-0.225em' }} />{' '}
          Failed to parse file
        </Body>
      </Tooltip>
    );
  }

  return <Spin size="small" />;
}
