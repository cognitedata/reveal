import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import {
  FileMetadataPreview,
  AssetMetadataPreview,
} from 'containers/ResourceSidebar';
import queryString from 'query-string';
import { Drawer } from 'antd';
import { onResourceSelected } from 'modules/app';
import Layers from 'utils/zindex';
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
    | ((props: { assetId?: number; fileId?: number }) => React.ReactNode[]);
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { search } = history.location;
  const {
    showSidebar: showSidebarString,
    assetId: previewAssetId,
    fileId: previewFileId,
  }: {
    showSidebar?: string;
    assetId?: number;
    fileId?: number;
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
    if (previewAssetId && Number.isInteger(Number(previewAssetId))) {
      return (
        <AssetMetadataPreview
          assetId={previewAssetId as number}
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
      zIndex={Layers.SIDEBAR}
      destroyOnClose
      className="pnid-sidebar"
      visible={showSidebar}
    >
      <DetailsWrapper className="search-content">
        {renderResourceDetails()}
      </DetailsWrapper>
    </Drawer>
  );
};
