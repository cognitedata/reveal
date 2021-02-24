import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Spin, message, Dropdown, Menu, Row, Col, Popover } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { Button, Icon, Colors, Tooltip, Badge } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import queryString from 'query-string';
import { RootState } from 'reducers/index';
import {
  CURRENT_VERSION,
  PendingCogniteAnnotation,
} from '@cognite/annotations';
import {
  startConvertFileToSvgJob,
  UploadJobState,
} from 'modules/fileContextualization/uploadJobs';
import {
  linkFileWithAssetsFromAnnotations,
  selectAnnotationsForSource,
  selectAnnotations,
} from 'modules/annotations';
import { dataKitItemsSelectorFactory } from 'modules/selection';
import { checkPermission } from 'modules/app';
import { startPnidParsingPipeline } from 'modules/pnidPipeline';
import { ParsingJobState } from 'modules/parsingJobs';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import {
  getPnIdAnnotationCategories,
  selectAnnotationColor,
} from 'components/CogniteFileViewer/CogniteFileViewerUtils';
import { Loader } from 'components/Common';
import { canDeploySelectedFiles } from 'utils/FilesUtils';
import LoadResources from './LoadResources';

const isPnidEnabled = true;

const Indicator = styled(Badge)`
  width: 12px;
  height: 12px;
  align-self: center;
  && {
    padding: 0;
  }
`;

const stubAnnotation = {
  label: 'sample',
  source: 'job:0',
  version: CURRENT_VERSION,
  status: 'unhandled',
  box: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
} as PendingCogniteAnnotation;

export default function PnidParsing() {
  const { tenant, assetsDataKitId, filesDataKitId, optionsId } = useParams<{
    tenant: string;
    filesDataKitId: string;
    assetsDataKitId: string;
    optionsId: string;
  }>();

  const history = useHistory();
  const { search } = history.location;

  const { page } = queryString.parse(search, { parseNumbers: true });

  const dispatch = useDispatch();

  const annotationBySourceMap = useSelector(selectAnnotationsForSource);
  const annotationsMap = useSelector(selectAnnotations);

  const [assetDataKit, fileDataKit] = useSelector((state: RootState) => [
    state.selection.items[assetsDataKitId],
    state.selection.items[filesDataKitId],
  ]);

  useEffect(() => {
    if (!assetDataKit || !fileDataKit) {
      message.error('Invalid Data Selections...');
      history.push(`/${tenant}/pnid_parsing`);
    }
  }, [history, tenant, assetDataKit, fileDataKit]);

  const getFiles = useMemo(
    () => dataKitItemsSelectorFactory(filesDataKitId, true),
    [filesDataKitId]
  );
  const files = useSelector(getFiles) as FileInfo[];

  const annotationsByFileId = useSelector(
    (state: RootState) => state.annotations.byFileId
  );
  const { partialMatch, grayscale } = useSelector(
    (state: RootState) => state.fileContextualization.pnidOption
  );

  const { parsingJobs, uploadJobs } = useSelector(
    (state: RootState) => state.fileContextualization
  );

  const isLoading = Object.values(uploadJobs).some((job) => !job.jobDone);

  const [selectedKeys, setSelectedKeys] = useState([] as number[]);

  const getCanEditFiles = useMemo(
    () => checkPermission('filesAcl', 'WRITE'),
    []
  );
  const getCanReadFiles = useMemo(
    () => checkPermission('filesAcl', 'READ'),
    []
  );

  const canEditFiles = useSelector(getCanEditFiles);
  const canReadFiles = useSelector(getCanReadFiles);

  useEffect(() => {
    if (canEditFiles && canReadFiles) {
      dispatch(startPnidParsingPipeline(filesDataKitId, assetsDataKitId));
    } else {
      setRenderFeedback(true);
    }
  }, [
    assetsDataKitId,
    canEditFiles,
    canReadFiles,
    dispatch,
    filesDataKitId,
    grayscale,
    partialMatch,
  ]);

  const handleMenuClick = (e: ClickParam, file: FileInfo) => {
    switch (e.key) {
      case 'link':
        if (canEditFiles) {
          dispatch(linkFileWithAssetsFromAnnotations(file.id));
        } else {
          setRenderFeedback(true);
        }
    }
  };

  const startUploadJob = () => {
    if (canEditFiles) {
      selectedKeys.forEach((key) => {
        if (annotationsByFileId[key].annotations) {
          dispatch(
            startConvertFileToSvgJob(key, annotationsByFileId[key].annotations)
          );
        } else {
          const file = files.find((el) => el.id === key);
          if (file) {
            message.error(`${file.name} has no annotations`);
          } else {
            message.error(`we are still loading file ${key}`);
          }
        }
      });
    } else {
      setRenderFeedback(true);
    }
  };

  const rows = files
    .filter((el) => !!el)
    .map((file) => {
      return {
        ...file,
        parsingJob: parsingJobs[file.id],
        uploadJob: uploadJobs[file.id],
      } as FileInfo & {
        parsingJob?: ParsingJobState;
        uploadJob?: UploadJobState;
      };
    });

  const [renderFeedback, setRenderFeedback] = useState(false);

  if (isPnidEnabled) {
    return (
      <>
        {renderFeedback && (
          <>
            <MissingPermissionFeedback
              key="eventsAcl"
              acl="eventsAcl"
              type="WRITE"
            />
            <MissingPermissionFeedback
              key="filesAcl"
              acl="filesAcl"
              type="WRITE"
            />
          </>
        )}
        <Row type="flex" align="middle" justify="space-between">
          <Col>
            <h1>Contextualize P&IDs</h1>
          </Col>
          <Col>
            <Tooltip
              placement="left"
              content="This will create or update an interactive SVG linked to the assets for the selected files."
            >
              <Icon
                type="Help"
                style={{
                  marginRight: '24px',
                  fontSize: '18px',
                  display: 'inline-block',
                }}
              />
            </Tooltip>
            <Button
              type="primary"
              disabled={!canDeploySelectedFiles(rows, selectedKeys)}
              title={
                !canDeploySelectedFiles(rows, selectedKeys) &&
                selectedKeys.length !== 0
                  ? 'Not all selected files can be deployed to CDF. This might be caused by them still being in "Pending" state or the parsing job failed. Please check if all selected files finished parsing with success.'
                  : ''
              }
              onClick={startUploadJob}
              loading={isLoading}
            >
              {`Deploy ${selectedKeys.length} files to CDF`}
            </Button>
          </Col>
        </Row>
        <Row gutter={[0, 20]}>
          <Col span={24}>
            <LoadResources
              assetDataKitId={assetsDataKitId}
              fileDataKitId={filesDataKitId}
            />
          </Col>
        </Row>
        <Row gutter={[0, 20]}>
          <Col span={24}>
            <Table
              rowSelection={{
                onSelectAll: (selectAll) =>
                  setSelectedKeys(
                    selectAll ? rows.map((el) => el.id) : ([] as number[])
                  ),
                onChange: (keys) => setSelectedKeys(keys as number[]),
                selectedRowKeys: selectedKeys,
              }}
              columns={[
                { dataIndex: 'name', title: 'Name', key: 'name' },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, file) => {
                    const { uploadJob, parsingJob } = file;

                    // Error states
                    if (uploadJob && uploadJob.jobError) {
                      return (
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <Indicator
                            background={Colors.danger.hex()}
                            text=""
                            className="cogs-badge"
                          />
                          <span>Failed to upload</span>
                        </div>
                      );
                    }
                    if (parsingJob && parsingJob.jobError) {
                      return (
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <Indicator
                            background={Colors.danger.hex()}
                            text=""
                            className="cogs-badge"
                          />
                          <span>Failed</span>
                        </div>
                      );
                    }

                    // Regular statuses
                    if (uploadJob) {
                      if (uploadJob.jobDone) {
                        return (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <Indicator
                              background={Colors.success.hex()}
                              text=""
                              className="cogs-badge"
                            />
                            <span>Completed</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <Indicator
                            background={Colors.midblue.hex()}
                            text=""
                            className="cogs-badge"
                          />
                          <span>Uploading</span>
                        </div>
                      );
                    }
                    if (parsingJob) {
                      if (parsingJob.jobDone) {
                        return (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <Indicator
                              background={Colors.success.hex()}
                              text=""
                              className="cogs-badge"
                            />
                            <span>Finished</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                          }}
                        >
                          <Indicator
                            background={Colors.warning.hex()}
                            text=""
                            className="cogs-badge"
                          />
                          <span>Parsing P&ID...</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <Indicator
                          background={Colors['text-color-secondary'].hex()}
                          text=""
                          className="cogs-badge"
                        />
                        <span>Pending</span>
                      </div>
                    );
                  },
                },
                {
                  title: 'New detected tags',
                  key: 'annotations_new',
                  render: (_, file) => {
                    const { parsingJob } = file;
                    if (!parsingJob || !parsingJob.jobDone) {
                      return <Spin size="small" />;
                    }
                    const annotations = annotationBySourceMap(
                      file.id,
                      `job:${parsingJob.jobId}`
                    );

                    const newAssets = annotations.filter(
                      (el) => el.resourceType === 'asset'
                    ).length;
                    const newFiles = annotations.filter(
                      (el) => el.resourceType === 'file'
                    ).length;

                    const leftOver = annotations.length - newAssets - newFiles;

                    return (
                      <Popover
                        title="New detected tags"
                        placement="bottomLeft"
                        content={
                          <>
                            <p>
                              <Badge
                                background={selectAnnotationColor({
                                  resourceType: 'file',
                                  ...stubAnnotation,
                                })}
                                size={14}
                                text={`${newFiles}`}
                              />{' '}
                              File tags
                            </p>
                            <p>
                              <Badge
                                background={selectAnnotationColor({
                                  resourceType: 'asset',
                                  ...stubAnnotation,
                                })}
                                size={14}
                                text={`${newAssets}`}
                              />{' '}
                              Asset tags
                            </p>
                            <p>
                              <Badge
                                background={selectAnnotationColor({
                                  ...stubAnnotation,
                                })}
                                size={14}
                                text={`${leftOver}`}
                              />{' '}
                              Unclassified tags
                            </p>
                          </>
                        }
                      >
                        <span>
                          <Badge
                            background={Colors.midblue.hex()}
                            text={`${annotations.length}`}
                            size={14}
                          />{' '}
                          New Tags
                        </span>
                      </Popover>
                    );
                  },
                },
                {
                  title: 'Total detected tags',
                  key: 'annotations',
                  render: (file: FileInfo) => {
                    const annotations = annotationsMap(file.id);
                    if (!annotations) {
                      return <Spin size="small" />;
                    }

                    const annotationDetails = getPnIdAnnotationCategories(
                      annotations
                    );

                    const {
                      Asset: { count: assetCount },
                      File: { count: fileCount },
                      Unclassified: { count: unclassifiedCount },
                    } = annotationDetails;

                    return (
                      <Popover
                        title="Total Detected Linked Tags"
                        placement="bottomLeft"
                        content={
                          <>
                            {Object.keys(annotationDetails).map((key) => {
                              const { count, items } = annotationDetails[key];
                              return (
                                <div key={key} style={{ marginBottom: '12px' }}>
                                  <strong>
                                    {count} {key} Linked Tags
                                  </strong>
                                  {Object.keys(items).map((subKey) => (
                                    <Row
                                      key={subKey}
                                      type="flex"
                                      align="middle"
                                      style={{ marginBottom: '4px' }}
                                    >
                                      <Col span={16}>{subKey}</Col>
                                      <Col
                                        span={8}
                                        style={{
                                          float: 'right',
                                          display: 'inline-flex',
                                          justifyContent: 'flex-end',
                                        }}
                                      >
                                        <Badge
                                          background={selectAnnotationColor(
                                            items[subKey][0]
                                          )}
                                          size={14}
                                          text={`${items[subKey].length}`}
                                        />
                                      </Col>
                                    </Row>
                                  ))}
                                </div>
                              );
                            })}
                          </>
                        }
                      >
                        <div>
                          <span>
                            <Badge
                              background={selectAnnotationColor({
                                resourceType: 'file',
                                ...stubAnnotation,
                              })}
                              size={14}
                              text={`${fileCount}`}
                            />{' '}
                            File tags
                          </span>
                          <span style={{ marginLeft: '12px' }}>
                            <Badge
                              background={selectAnnotationColor({
                                resourceType: 'asset',
                                ...stubAnnotation,
                              })}
                              size={14}
                              text={`${assetCount}`}
                            />{' '}
                            Asset tags
                          </span>
                          <span style={{ marginLeft: '12px' }}>
                            <Badge
                              background={selectAnnotationColor({
                                ...stubAnnotation,
                              })}
                              size={14}
                              text={`${unclassifiedCount}`}
                            />{' '}
                            Unclassified tags
                          </span>
                        </div>
                      </Popover>
                    );
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (file) => {
                    const jobFinished =
                      file && file.parsingJob && file.parsingJob.jobDone;
                    const annotations = annotationsMap(file.id);
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
                                  `/${tenant}/pnid_parsing/${filesDataKitId}/${assetsDataKitId}/${optionsId}/pnid/${file.id}`
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
                            annotations.length > 0 ? (
                              <Menu onClick={(e) => handleMenuClick(e, file)}>
                                <Menu.Item key="link">
                                  Link assets to P&ID file
                                </Menu.Item>
                              </Menu>
                            ) : (
                              <Tooltip content="There is no annotations to be linked to this file.">
                                <Menu onClick={(e) => handleMenuClick(e, file)}>
                                  <Menu.Item key="link" disabled>
                                    Link assets to P&ID file
                                  </Menu.Item>
                                </Menu>
                              </Tooltip>
                            )
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
                            disabled={
                              !(
                                file &&
                                file.annotations &&
                                file.annotations.length > 0
                              )
                            }
                            icon="HorizontalEllipsis"
                          />
                        </Dropdown>
                      </>
                    );
                  },
                },
              ]}
              dataSource={rows}
              rowKey="id"
              pagination={{
                onChange: (newPage) => {
                  history.push({
                    search: queryString.stringify({
                      ...queryString.parse(search),
                      page: newPage,
                    }),
                  });
                },
                current: (page || 0) as number,
              }}
            />
          </Col>
        </Row>
      </>
    );
  }
  return <Loader />;
}
