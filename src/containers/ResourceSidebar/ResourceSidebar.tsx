import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import queryString from 'query-string';
import { onResourceSelected } from 'modules/app';
import { useDispatch } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import { FileSmallPreview } from 'containers/Files';
import { AssetSmallPreview } from 'containers/Assets';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';

const Drawer = styled.div`
  width: 360px;
  height: 100%;
`;

const CloseButton = styled(Button)`
  float: right;
`;

const DetailsWrapper = styled.div`
  pointer-events: all;
  overflow: auto;
  padding: 12px;
  margin-top: 12px;
  padding-top: 6px;
  border-radius: 4px;
  margin-right: 12px;
  flex: 1;
  overflow: auto;
  width: 100%;
  background: #fff;
`;

export const ResourceSidebar = ({
  extraButtons,
}: {
  extraButtons?:
    | React.ReactNode[]
    | ((props: {
        assetId?: number;
        fileId?: number;
        timeseriesId?: number;
        sequenceId?: number;
      }) => React.ReactNode[]);
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { search } = history.location;
  const {
    showSidebar: showSidebarString,
    assetId: previewAssetId,
    fileId: previewFileId,
    timeseriesId: previewTimeseriesId,
    sequenceId: previewSequenceId,
  }: {
    showSidebar?: string;
    assetId?: number;
    fileId?: number;
    timeseriesId?: number;
    sequenceId?: number;
  } = queryString.parse(search, {
    parseNumbers: true,
  });

  const showSidebar = showSidebarString === 'true';

  let extraActions = [] as React.ReactNode[];

  if (extraButtons) {
    extraActions =
      typeof extraButtons === 'function'
        ? extraButtons({
            assetId: previewAssetId,
            fileId: previewFileId,
            timeseriesId: previewTimeseriesId,
          })
        : (extraButtons as React.ReactNode[]);
  }

  const renderResourceDetails = () => {
    if (previewFileId && Number.isInteger(Number(previewFileId))) {
      return (
        <FileSmallPreview
          fileId={previewFileId as number}
          extras={extraActions}
        />
      );
    }
    if (previewTimeseriesId && Number.isInteger(Number(previewTimeseriesId))) {
      return (
        <TimeseriesSmallPreview
          timeseriesId={previewTimeseriesId as number}
          extras={extraActions}
        />
      );
    }
    if (previewAssetId && Number.isInteger(Number(previewAssetId))) {
      return (
        <AssetSmallPreview
          assetId={previewAssetId as number}
          extras={extraActions}
        />
      );
    }
    if (previewSequenceId && Number.isInteger(Number(previewSequenceId))) {
      return (
        <SequenceSmallPreview
          sequenceId={previewSequenceId as number}
          extras={extraActions}
        />
      );
    }
    return (
      <>
        <p>Start by searching for an asset or file</p>
      </>
    );
  };
  if (showSidebar) {
    return (
      <Drawer>
        <CloseButton
          icon="Close"
          variant="ghost"
          onClick={() =>
            dispatch(onResourceSelected({ showSidebar: false }, history))
          }
        />
        <DetailsWrapper>{renderResourceDetails()}</DetailsWrapper>
      </Drawer>
    );
  }
  return null;
};
