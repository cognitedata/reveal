import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { message, Dropdown, Menu } from 'antd';
import { Tooltip } from '@cognite/cogs.js';
import { useAnnotations } from '@cognite/data-exploration';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import {
  convertEventsToAnnotations,
  linkFileToAssetIds,
} from '@cognite/annotations';
import { Flex, IconButton } from 'components/Common';
import sdk from 'sdk-singleton';
import { diagramPreview } from 'routes/paths';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

type Props = { file: any };

export default function ColumnFileActions({ file }: Props): JSX.Element {
  const history = useHistory();
  const { tenant, workflowId } = useParams<{
    tenant: string;
    workflowId: string;
  }>();

  const canEditFiles = usePermissions('filesAcl', 'WRITE');
  const { data: annotations } = useAnnotations(file.id);

  const { status: parsingJobStatus, failedFiles } = useParsingJob(
    Number(workflowId)
  );

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  const jobFinished = parsingJobStatus === 'Completed';

  const onTooltipShow = () => {
    if (jobFinished) {
      return false;
    }
    return undefined;
  };

  const onLinkAssetsClick = async (e: any) => {
    switch (e.key) {
      case 'link':
        if (canEditFiles) {
          trackUsage(PNID_METRICS.results.linkToAssets, {
            fileId: file?.id,
          });
          await linkFileToAssetIds(
            sdk,
            convertEventsToAnnotations(annotations)
          );
        }
    }
  };

  const onFileViewClick = () => {
    if (file) {
      history.push(diagramPreview.path(tenant, workflowId, file.id));
    } else {
      message.info('Please wait for the process to finish for this diagram.');
    }
  };

  const viewButtonLabel = () => {
    if (!jobFinished) return 'Please wait for the diagram to finish parsing.';
    if (didFileFail) return 'You cannot preview this diagram';
    return undefined;
  };

  return (
    <Flex row>
      <Tooltip
        placement="bottom-end"
        content={viewButtonLabel()}
        onShow={onTooltipShow}
      >
        <IconButton
          icon="ExpandMax"
          variant="ghost"
          $square
          onClick={onFileViewClick}
          disabled={!jobFinished || Boolean(didFileFail)}
        />
      </Tooltip>
      <Dropdown
        overlay={
          <Tooltip
            content={
              annotations.length > 0
                ? 'Link all the matched assets to this diagram.'
                : 'There is no annotations to be linked to this diagram.'
            }
          >
            <Menu onClick={onLinkAssetsClick}>
              <Menu.Item key="link" disabled={!annotations?.length}>
                Link assets to diagrams
              </Menu.Item>
            </Menu>
          </Tooltip>
        }
      >
        <IconButton
          icon="HorizontalEllipsis"
          variant="ghost"
          $square
          disabled={!(file && file.annotations && file.annotations.length > 0)}
        />
      </Dropdown>
    </Flex>
  );
}
