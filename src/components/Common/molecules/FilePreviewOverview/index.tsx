import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import collapseStyles from 'rc-collapse/assets/index.css';
import {
  Input,
  Collapse,
  Title,
  Badge,
  Icon,
  Colors,
  Button,
} from '@cognite/cogs.js';
import {
  CogniteAnnotation,
  AnnotationResourceType,
} from '@cognite/annotations';
import { FileInfo, Asset } from '@cognite/sdk';
import { useDispatch, useSelector } from 'react-redux';
import {
  itemSelector as fileSelector,
  retrieveItemsById as retrieveFile,
  retrieveItemsByExternalId as retrieveExternalFile,
} from 'modules/files';
import {
  itemSelector as assetSelector,
  retrieveItemsById as retrieveAsset,
  retrieveItemsByExternalId as retrieveExternalAsset,
} from 'modules/assets';
import { DetailsItem, InfoGrid, FileDetailsAbstract } from 'components/Common';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import Layers from 'utils/zindex';
import { AssetItem, FileItem } from './FilePreviewOverviewItems';

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px 16px;
  box-sizing: border-box;
  border-radius: 8px;
  box-shadow: 0px 0px 16px ${Colors['greyscale-grey3'].hex()};
  z-index: ${Layers.MINIMUM};
  background: #fff;
  width: 100%;
  height: 100%;
  margin-right: 20px;
  overflow: auto;
  h1 {
    margin-bottom: 0px;
    flex: 1;
  }
  .input-wrapper {
    width: 100%;
  }
  .content {
    flex: 1;
    overflow: auto;
    width: 100%;
  }
  &&& .rc-collapse,
  &&& .rc-collapse > .rc-collapse-item {
    border: none;
    width: 100%;
    background: #fff;
  }
  &&& .rc-collapse-header {
    background: #fff;
    outline: none;
  }
  &&& .rc-collapse-content > .rc-collapse-content-box {
    margin-top: 0px;
  }
`;
const SidebarHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-bottom: 16px;
`;

const CollapseHeader = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  flex-direction: row;
  width: 100%;
  .resource-icon {
    margin-right: 4px;
  }
  .spacer {
    flex: 1;
  }
  .cogs-badge {
    padding: 4px 8px !important;
    color: #4e4f60 !important;
    font-weight: 800;
  }
`;

const Tabs = styled.div`
  margin-top: 12px;
  margin-bottom: 16px;
  margin-left: -6px;
  && > * {
    padding-left: 6px;
    padding-right: 6px;
    margin-right: 24px;
  }
`;

type FilePreviewOverviewProps = {
  file: FileInfo;
  annotations: CogniteAnnotation[];
  extras?: React.ReactNode;
  page?: number;
  onPageChange: (page: number) => void;
  onAssetClicked?: (item: Asset) => void;
  onFileClicked?: (item: FileInfo) => void;
};

type CategorizedAnnotations = {
  [key in AnnotationResourceType]: {
    annotations: CogniteAnnotation[];
    ids: Set<number | string>;
  };
};

export const FilePreviewOverview = ({
  file,
  page,
  extras,
  annotations,
  onPageChange,
  onAssetClicked,
  onFileClicked,
}: FilePreviewOverviewProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [currentTab, setTab] = useState('resources');
  const [open, setOpen] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');
  const [retrievingAssets, setRetrievingAssets] = useState(false);
  const [retrievingFiles, setRetrievingFiles] = useState(false);

  useEffect(() => {
    collapseStyles.use();
    return () => {
      collapseStyles.unuse();
    };
  });

  const onAssetClickedCallback =
    onAssetClicked ||
    ((item) => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            assetId: item.id,
          },
          history
        )
      );
    });
  const onFileClickedCallback =
    onFileClicked ||
    ((item) => {
      dispatch(
        onResourceSelected(
          {
            showSidebar: true,
            fileId: item.id,
          },
          history
        )
      );
    });
  const categorizedAnnotations: CategorizedAnnotations = {
    file: { annotations: [], ids: new Set() },
    asset: { annotations: [], ids: new Set() },
    sequence: { annotations: [], ids: new Set() },
    timeSeries: { annotations: [], ids: new Set() },
    event: { annotations: [], ids: new Set() },
    threeD: { annotations: [], ids: new Set() },
    threeDRevision: { annotations: [], ids: new Set() },
  };

  annotations.forEach((annotation) => {
    if (
      annotation.resourceType &&
      categorizedAnnotations[annotation.resourceType] &&
      (annotation.resourceExternalId || annotation.resourceId)
    ) {
      categorizedAnnotations[annotation.resourceType].annotations.push(
        annotation
      );
      categorizedAnnotations[annotation.resourceType].ids.add(
        annotation.resourceExternalId || annotation.resourceId!
      );
    }
  });

  const fileIds = Array.from(categorizedAnnotations.file.ids);
  const assetIds = Array.from(categorizedAnnotations.asset.ids);

  useEffect(() => {
    if (retrievingFiles) return;
    const ids = {
      ids: (
        fileIds.filter(
          (id: number | string) => typeof id === 'number'
        ) as number[]
      ).map((id: number) => ({
        id,
      })),
    };
    const externalIds = {
      ids: (
        fileIds.filter(
          (id: number | string) => typeof id === 'string'
        ) as string[]
      ).map((externalId: string) => ({
        externalId,
      })),
    };
    dispatch(retrieveFile(ids));
    dispatch(retrieveExternalFile(externalIds));
    setRetrievingFiles(true);
  }, [dispatch, fileIds, retrievingFiles]);

  useEffect(() => {
    if (retrievingAssets) return;
    const ids = {
      ids: (
        assetIds.filter(
          (id: number | string) => typeof id === 'number'
        ) as number[]
      ).map((id: number) => ({
        id,
      })),
    };
    const externalIds = {
      ids: (
        assetIds.filter(
          (id: number | string) => typeof id === 'string'
        ) as string[]
      ).map((externalId: string) => ({
        externalId,
      })),
    };
    dispatch(retrieveAsset(ids));
    dispatch(retrieveExternalAsset(externalIds));
    setRetrievingAssets(true);
  }, [dispatch, assetIds, retrievingAssets]);

  const uniqueResources = (resourceList: any): string => {
    return [
      ...new Set(
        resourceList.annotations.map(
          (annotation: CogniteAnnotation) => annotation.resourceExternalId
        )
      ),
    ].length.toString();
  };

  const getAsset: any = useSelector(assetSelector);
  const getFile: any = useSelector(fileSelector);

  const renderDetectedResources = () => {
    return (
      <>
        <Input
          style={{ width: '100%' }}
          containerStyle={{ width: '100%', marginBottom: 16 }}
          variant="noBorder"
          icon="Search"
          placeholder="Search for resource in file..."
          onChange={(ev) => setQuery(ev.target.value)}
          value={query}
        />
        <Collapse
          // @ts-ignore
          onChange={(key?: string[]) => setOpen(key || [])}
          activeKey={open}
        >
          {/** Assets */}
          <Collapse.Panel
            showArrow={false}
            key="assets"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Assets" />
                <Title level={5}>Assets</Title>
                <div className="spacer" />
                <Badge
                  text={uniqueResources(categorizedAnnotations.asset)}
                  background={Colors['purple-5'].hex()}
                />
                <Icon
                  type={open.includes('assets') ? 'ChevronUp' : 'ChevronDown'}
                />
              </CollapseHeader>
            }
          >
            <div>
              {assetIds.map((id) => {
                const asset = getAsset(id);
                if (asset && query.length > 0) {
                  if (
                    `${asset.name}${asset.description}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.AssetItem
                    onItemClick={() => asset && onAssetClickedCallback(asset)}
                    key={id}
                    asset={asset}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.asset.annotations.filter(
                      (el) =>
                        asset &&
                        ((el.resourceId && el.resourceId === asset.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === asset.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>

          {/** Files */}
          <Collapse.Panel
            showArrow={false}
            key="files"
            header={
              <CollapseHeader>
                <Icon className="cogs-icon resource-icon" type="Document" />
                <Title level={5}>Files</Title>
                <div className="spacer" />
                <Badge
                  text={uniqueResources(categorizedAnnotations.file)}
                  background={Colors['midorange-5'].hex()}
                />
                <Icon
                  type={open.includes('files') ? 'ChevronUp' : 'ChevronDown'}
                />
              </CollapseHeader>
            }
          >
            <div>
              {fileIds.map((id) => {
                const linkedFile = getFile(id);
                if (file && query.length > 0) {
                  if (
                    `${file!.name}`
                      .toLocaleLowerCase()
                      .indexOf(query.toLocaleLowerCase()) === -1
                  ) {
                    return null;
                  }
                }
                return (
                  <FilePreviewOverview.FileItem
                    onItemClick={() => file && onFileClickedCallback(file)}
                    key={id}
                    file={linkedFile}
                    currentPage={page}
                    query={query}
                    annotations={categorizedAnnotations.file.annotations.filter(
                      (el) =>
                        linkedFile &&
                        ((el.resourceId && el.resourceId === linkedFile.id) ||
                          (el.resourceExternalId &&
                            el.resourceExternalId === linkedFile.externalId))
                    )}
                    selectPage={onPageChange}
                  />
                );
              })}
            </div>
          </Collapse.Panel>
        </Collapse>
      </>
    );
  };

  const renderFileDetails = () => {
    return (
      <>
        <FileDetailsAbstract.FileInfoGrid file={file} />
        {file && file!.metadata && (
          <InfoGrid noBorders>
            {Object.keys(file!.metadata).map((key) => (
              <DetailsItem name={key} value={file!.metadata![key]} />
            ))}
          </InfoGrid>
        )}
      </>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Title
          level="3"
          style={{ flex: 1, wordBreak: 'break-all', marginRight: 6 }}
        >
          {file.name}
        </Title>
      </SidebarHeader>
      {extras}
      <Tabs>
        <Button type="ghost" onClick={() => setTab('resources')}>
          <Title
            level={5}
            style={{
              color:
                currentTab === 'resources' ? Colors.midblue.hex() : 'inherit',
            }}
          >
            Detected resources
          </Title>
        </Button>
        <Button type="ghost" onClick={() => setTab('fileInfo')}>
          <Title
            level={5}
            style={{
              color:
                currentTab !== 'resources' ? Colors.midblue.hex() : 'inherit',
            }}
          >
            File info
          </Title>
        </Button>
      </Tabs>
      <div className="content">
        {currentTab === 'resources'
          ? renderDetectedResources()
          : renderFileDetails()}
      </div>
    </Sidebar>
  );
};

FilePreviewOverview.AssetItem = AssetItem;
FilePreviewOverview.FileItem = FileItem;
