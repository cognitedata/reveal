import React, { useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message, Dropdown, Menu } from 'antd';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useAnnotations } from '@cognite/data-exploration';
import {
  convertEventsToAnnotations,
  linkFileToAssetIds,
} from '@cognite/annotations';
import { Flex, IconButton } from 'components/Common';
import sdk from 'sdk-singleton';
import { checkPermission } from 'modules/app';
import { diagramPreview } from 'routes/paths';

type Props = { file: any; setRenderFeedback: (shouldSet: boolean) => any };

export default function FileActions({
  file,
  setRenderFeedback,
}: Props): JSX.Element {
  const history = useHistory();
  const { tenant, workflowId } = useParams<{
    tenant: string;
    workflowId: string;
  }>();

  const getCanEditFiles = useMemo(
    () => checkPermission('filesAcl', 'WRITE'),
    []
  );
  const canEditFiles = useSelector(getCanEditFiles);
  const { data: annotations } = useAnnotations(file.id);

  const jobFinished = file && file.parsingJob && file.parsingJob.jobDone;

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
          await linkFileToAssetIds(
            sdk,
            convertEventsToAnnotations(annotations)
          );
        } else {
          setRenderFeedback(true);
        }
    }
  };

  const onFileViewClick = () => {
    if (file) {
      history.push(diagramPreview.path(tenant, workflowId, file.id));
    } else {
      message.info('Please wait for the process to finish for this file.');
    }
  };

  return (
    <Flex row>
      <Tooltip
        placement="bottom-end"
        content="Please wait for the file to finish parsing."
        onShow={onTooltipShow}
      >
        <Button
          icon="ArrowRight"
          onClick={onFileViewClick}
          disabled={!jobFinished}
        >
          View
        </Button>
      </Tooltip>
      <Dropdown
        overlay={
          <Tooltip
            content={
              annotations.length > 0
                ? 'Link all the matched assets to this file.'
                : 'There is no annotations to be linked to this file.'
            }
          >
            <Menu onClick={onLinkAssetsClick}>
              <Menu.Item key="link" disabled={!annotations?.length}>
                Link assets to P&ID file
              </Menu.Item>
            </Menu>
          </Tooltip>
        }
      >
        <IconButton
          disabled={!(file && file.annotations && file.annotations.length > 0)}
          icon="HorizontalEllipsis"
          square
          style={{ marginLeft: '8px' }}
        />
      </Dropdown>
    </Flex>
  );
}
