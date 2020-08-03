import React from 'react';
import { ids } from 'cogs-variables';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import {
  FileMetadataPreview,
  TimeseriesMetadataPreview,
  AssetMetadataPreview,
  SequenceMetadataPreview,
} from 'containers/ResourceSidebar';
import queryString from 'query-string';
import { Drawer } from 'antd';
import { onResourceSelected } from 'modules/app';
import { useDispatch } from 'react-redux';

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
        <FileMetadataPreview
          fileId={previewFileId as number}
          extraActions={extraActions}
        />
      );
    }
    if (previewTimeseriesId && Number.isInteger(Number(previewTimeseriesId))) {
      return (
        <TimeseriesMetadataPreview
          timeseriesId={previewTimeseriesId as number}
          extraActions={extraActions}
        />
      );
    }
    if (previewAssetId && Number.isInteger(Number(previewAssetId))) {
      return (
        <AssetMetadataPreview
          assetId={previewAssetId as number}
          extraActions={extraActions}
        />
      );
    }
    if (previewSequenceId && Number.isInteger(Number(previewSequenceId))) {
      return (
        <SequenceMetadataPreview
          sequenceId={previewSequenceId as number}
          extraActions={extraActions}
        />
      );
    }
    return (
      <>
        <p>Start by searching for an asset or file</p>
      </>
    );
  };

  return (
    <Drawer
      getContainer={() =>
        document.getElementsByClassName(ids.styleScope).item(0)! as HTMLElement
      }
      width="80%"
      onClose={() =>
        dispatch(
          onResourceSelected(
            {
              showSidebar: false,
            },
            history
          )
        )
      }
      zIndex={1001}
      destroyOnClose
      className="pnid-sidebar"
      visible={showSidebar}
    >
      <DetailsWrapper>{renderResourceDetails()}</DetailsWrapper>
    </Drawer>
  );
};
