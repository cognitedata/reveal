import React, { useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@cognite/cogs.js';
import { message, Dropdown, Menu } from 'antd';
import { checkPermission } from 'modules/app';
import { useAnnotations } from '@cognite/data-exploration';
import sdk from 'sdk-singleton';

import {
  convertEventsToAnnotations,
  linkFileToAssetIds,
} from '@cognite/annotations';

type Props = { file: any; setRenderFeedback: (shouldSet: boolean) => any };

export default function FileActions({
  file,
  setRenderFeedback,
}: Props): JSX.Element {
  const history = useHistory();

  const { tenant, assetsDataKitId, filesDataKitId, optionsId } = useParams<{
    tenant: string;
    filesDataKitId: string;
    assetsDataKitId: string;
    optionsId: string;
  }>();

  const getCanEditFiles = useMemo(
    () => checkPermission('filesAcl', 'WRITE'),
    []
  );

  const jobFinished = file && file.parsingJob && file.parsingJob.jobDone;

  const canEditFiles = useSelector(getCanEditFiles);

  const { data: annotations } = useAnnotations(file.id);

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

  return (
    <>
      <Tooltip
        placement="bottom-end"
        content="Please wait for the file to finish parsing."
        onShow={() => {
          if (jobFinished) {
            return false;
          }
          return undefined;
        }}
      >
        <Button
          icon="ArrowRight"
          onClick={() => {
            if (file) {
              history.push(
                `/${tenant}/pnid_parsing_new/pipeline/${filesDataKitId}/${assetsDataKitId}/${optionsId}/pnid/${file.id}`
              );
            } else {
              message.info(
                'Please wait for the process to finish for this file.'
              );
            }
          }}
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
            <Menu onClick={(e) => onLinkAssetsClick(e)}>
              <Menu.Item key="link" disabled={!annotations?.length}>
                Link assets to P&ID file
              </Menu.Item>
            </Menu>
          </Tooltip>
        }
      >
        <Button
          style={{
            marginLeft: '8px',
            paddingLeft: '8px',
            paddingRight: '8px',
            width: 'auto',
            minWidth: 'auto',
          }}
          disabled={!(file && file.annotations && file.annotations.length > 0)}
          icon="HorizontalEllipsis"
        />
      </Dropdown>
    </>
  );
}
