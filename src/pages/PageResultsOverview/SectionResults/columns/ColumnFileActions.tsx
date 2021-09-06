import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { message } from 'antd';
import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';
import { Flex, IconButton } from 'components/Common';
import { diagramPreview } from 'routes/paths';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { MenuSingle } from '../DropdownMenu';

type Props = { file: any };

export default function ColumnFileActions({ file }: Props): JSX.Element {
  const history = useHistory();
  const { tenant, workflowId } = useParams<{
    tenant: string;
    workflowId: string;
  }>();

  const { status: parsingJobStatus, failedFiles } = useParsingJob(
    Number(workflowId)
  );

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  const jobFinished = parsingJobStatus === 'Completed';
  const isFileDisabled = !file || Boolean(didFileFail);
  const isButtonDisabled = !jobFinished || Boolean(didFileFail);

  const onTooltipShow = () => {
    if (jobFinished) {
      return false;
    }
    return undefined;
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
          aria-label="Icon-Button"
          icon="EyeShow"
          type="ghost"
          $square
          onClick={onFileViewClick}
          disabled={isButtonDisabled}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      <Dropdown
        content={<MenuSingle file={file} />}
        disabled={isButtonDisabled}
      >
        <Button
          aria-label="Button-More"
          icon="MoreOverflowEllipsisHorizontal"
          type="ghost"
          disabled={isButtonDisabled || isFileDisabled}
        />
      </Dropdown>
    </Flex>
  );
}
