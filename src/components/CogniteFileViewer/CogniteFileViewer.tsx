import React, { useEffect, useState, useMemo } from 'react';
import { message, Modal } from 'antd';
import { IAnnotation, IRectShapeData } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
  CURRENT_VERSION,
} from '@cognite/annotations';
import {
  retrieveItemsById as retrieveAssets,
  retrieveItemsByExternalId as retrieveExternalAssets,
} from 'modules/assets';
import { useSelector, useDispatch } from 'react-redux';
import {
  createAnnotations,
  deleteAnnotations,
  selectAnnotations,
  hardDeleteAnnotationsForFile,
} from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Button, Menu, Dropdown, Icon, Colors, Title } from '@cognite/cogs.js';
import { itemSelector as fileSelector } from 'modules/files';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { checkPermission } from 'modules/app';
import { findSimilarObjects } from 'modules/contextualization/similarObjectJobs';
import { v4 as uuid } from 'uuid';
import { RootState } from 'store';
import {
  SmallTitle,
  FileViewer,
  FilePreviewOverview,
  IAnnotationWithPage,
} from 'components/Common';
import { FileInfo, Asset } from '@cognite/sdk';
import sdk, { getAuthState } from 'sdk-singleton';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { useLocation, useHistory } from 'react-router';
import queryString from 'query-string';
import { PNID_ANNOTATION_TYPE } from 'utils/AnnotationUtils';
import {
  CogniteFileViewerEditor,
  ExtraEditorOption,
} from './CogniteFileViewerEditor';
import { selectAnnotationColor } from './CogniteFileViewerUtils';

const OverviewWrapper = styled.div`
  height: 100%;
  width: 360px;
  display: inline-flex;
  flex-direction: column;

  && > * {
    margin-bottom: 24px;
  }
`;

const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;

const Wrapper = styled.div`
  flex: 1;
  min-height: 200px;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;

  button.cogs-menu-item {
    color: ${Colors.black.hex()};
  }
`;

type Props = {
  fileId?: number;
  children?: React.ReactNode;
  onFileClicked?: (file: FileInfo) => void;
  onAssetClicked?: (asset: Asset) => void;
  renderResourceActions?: RenderResourceActionsFunction;
};

export interface ProposedCogniteAnnotation extends PendingCogniteAnnotation {
  id: string;
}

const visibleSimilarityJobs: { [key: string]: boolean } = {};

export const CogniteFileViewer = ({
  fileId,
  children,
  onFileClicked,
  onAssetClicked,
  renderResourceActions,
}: Props) => {
  const { search } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { username } = getAuthState();
  const { page = 1 }: { page?: number } = queryString.parse(search, {
    parseNumbers: true,
  });
  const [fetching, setFetching] = useState(false);

  const filesMap: any = useSelector(fileSelector);
  const file = filesMap(fileId);
  const pnidAnnotations = useSelector(selectAnnotations)(fileId);
  const [pendingPnidAnnotations, setPendingPnidAnnotations] = useState(
    [] as ProposedCogniteAnnotation[]
  );

  useEffect(() => setPendingPnidAnnotations([]), [fileId]);

  const [creatable, setCreatable] = useState(false);
  const [similarSearchMode, setSimilarSearchMode] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<
    ProposedCogniteAnnotation | CogniteAnnotation | undefined
  >(undefined);

  const similarObjectJobs = useSelector((state: RootState) =>
    fileId ? state.fileContextualization.similarObjectJobs[fileId] : {}
  );

  const isFindingSimilarObjects = similarObjectJobs
    ? Object.values(similarObjectJobs).some((el: any) => !el.jobDone)
    : false;

  const annotations = pnidAnnotations
    .map((el: any) => {
      return {
        id: `${el.id}`,
        comment: el.label || 'No Label',
        page: el.page,
        mark: {
          type: 'RECT',
          x: el.box.xMin,
          y: el.box.yMin,
          width: el.box.xMax - el.box.xMin,
          height: el.box.yMax - el.box.yMin,
          strokeWidth: 2,
          strokeColor: selectAnnotationColor(
            el,
            el.resourceType === selectedAnnotation?.resourceType &&
              (el.resourceExternalId ===
                selectedAnnotation?.resourceExternalId ||
                el.resourceId === selectedAnnotation?.resourceId)
          ),
        },
      } as IAnnotation<IRectShapeData>;
    })
    .concat(
      pendingPnidAnnotations.map(
        (el) =>
          ({
            id: el.id,
            comment: el.label || 'Pending Annotation',
            page: el.page,
            mark: {
              type: 'RECT',
              x: el.box.xMin,
              y: el.box.yMin,
              width: el.box.xMax - el.box.xMin,
              height: el.box.yMax - el.box.yMin,
              strokeColor: 'yellow',
            },
          } as IAnnotation<IRectShapeData>)
      )
    );

  useEffect(() => {
    if (fetching) return;
    const assetExternalIds = pnidAnnotations.reduce(
      (prev: Set<string>, el: CogniteAnnotation) => {
        if (el.resourceType === 'asset' && el.resourceExternalId) {
          prev.add(el.resourceExternalId);
        }
        return prev;
      },
      new Set<string>()
    );
    const assetIds = pnidAnnotations.reduce(
      (prev: Set<number>, el: CogniteAnnotation) => {
        if (el.resourceType === 'asset' && el.resourceId) {
          prev.add(el.resourceId);
        }
        return prev;
      },
      new Set<number>()
    );
    const assetsToRetrieveById = [...[...assetIds].map((id) => ({ id }))];
    const assetsToRetrieveByExternalId = [
      ...[...assetExternalIds].map((id) => ({ externalId: id })),
    ];
    dispatch(retrieveAssets({ ids: assetsToRetrieveById }));
    dispatch(retrieveExternalAssets({ ids: assetsToRetrieveByExternalId }));
    setFetching(true);
  }, [dispatch, pnidAnnotations, fetching]);

  const [renderFeedback, setRenderFeedback] = useState(false);

  const getPermission = useMemo(
    () => checkPermission('eventsAcl', 'WRITE'),
    []
  );
  const canEditEvents = useSelector(getPermission);

  useEffect(() => {
    const newItems: ProposedCogniteAnnotation[] = [];
    Object.keys(similarObjectJobs || {}).forEach((key) => {
      if (!visibleSimilarityJobs[key] && similarObjectJobs[key].annotations) {
        similarObjectJobs[key].annotations!.forEach((el) => {
          newItems.push({
            id: uuid(),
            box: el.boundingBox,
            version: CURRENT_VERSION,
            fileId,
            type: PNID_ANNOTATION_TYPE,
            label: '',
            source: `job:${key}`,
            status: 'unhandled',
            metadata: {
              fromSimilarObject: 'true',
              score: `${el.score}`,
              originalBoxJson: key,
            },
          });
        });
        visibleSimilarityJobs[key] = true;
      }
    });
    if (newItems.length > 0) {
      setPendingPnidAnnotations([...pendingPnidAnnotations, ...newItems]);
    }
  }, [similarObjectJobs, fileId, pendingPnidAnnotations]);

  const onSaveDetection = async (
    pendingAnnotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => {
    if (!canEditEvents) {
      setRenderFeedback(true);
      return;
    }

    if (pendingPnidAnnotations.find((el) => el.id === pendingAnnotation.id)) {
      trackUsage('Contextualization.PnidViewer.CreateAnnotation', {
        annotation: pendingAnnotation,
      });
      const pendingObj: any = { ...pendingAnnotation };
      delete pendingObj.id;
      delete pendingObj.metadata;
      dispatch(
        createAnnotations.action({ file, pendingAnnotations: [pendingObj] })
      );
      setPendingPnidAnnotations(
        pendingPnidAnnotations.filter((el) => el.id !== pendingAnnotation.id)
      );
    } else {
      message.info('Coming Soon');
    }

    // load missing asset information
    if (
      pendingAnnotation.resourceType === 'asset' &&
      (pendingAnnotation.resourceExternalId || pendingAnnotation.resourceId)
    ) {
      const action = pendingAnnotation.resourceExternalId
        ? retrieveExternalAssets({
            ids: [{ externalId: pendingAnnotation.resourceExternalId! }],
          })
        : retrieveAssets({ ids: [{ id: pendingAnnotation.resourceId! }] });
      dispatch(action);
    }
  };

  const onDeleteAnnotation = async (annotation: IAnnotation) => {
    if (!canEditEvents) {
      setRenderFeedback(true);
      return;
    }

    if (pendingPnidAnnotations.find((el) => el.id === annotation.id)) {
      setPendingPnidAnnotations(
        pendingPnidAnnotations.filter((el) => el.id !== annotation.id)
      );
    } else {
      trackUsage('Contextualization.PnidViewer.DeleteAnnotation', {
        annotation,
      });
      const pnidIndex = pnidAnnotations.findIndex(
        (el: any) => `${el.id}` === annotation.id
      );
      if (pnidIndex > -1) {
        dispatch(
          deleteAnnotations.action({
            file,
            annotations: [pnidAnnotations[pnidIndex]],
          })
        );
      }
    }
  };

  const onUpdateAnnotation = async (
    annotation: IAnnotation<IRectShapeData>
  ) => {
    if (!canEditEvents) {
      setRenderFeedback(true);
      return;
    }

    if (pendingPnidAnnotations.find((el) => el.id === annotation.id)) {
      setPendingPnidAnnotations(
        pendingPnidAnnotations.reduce(
          (prev: ProposedCogniteAnnotation[], el) => {
            if (el.id !== annotation.id) {
              prev.push(el);
            } else {
              prev.push({
                ...el,
                page: el.page,
                box: {
                  xMin: annotation.mark.x,
                  yMin: annotation.mark.y,
                  xMax: annotation.mark.x + annotation.mark.width,
                  yMax: annotation.mark.y + annotation.mark.height,
                },
              });
            }
            return prev;
          },
          [] as ProposedCogniteAnnotation[]
        )
      );
    }
  };

  const onCreateAnnotation = async (annotation: IAnnotationWithPage) => {
    if (!canEditEvents || !fileId) {
      setRenderFeedback(true);
      return;
    }
    trackUsage('Contextualization.PnidViewer.LocalCreateAnnotation', {
      annotation,
    });
    setPendingPnidAnnotations(
      pendingPnidAnnotations
        .filter((el) => el.label.length > 0)
        .concat([
          {
            id: annotation.id,
            status: 'verified',
            ...(file!.externalId
              ? { fileExternalId: file!.externalId }
              : { fileId: file!.id }),
            version: CURRENT_VERSION,
            source: `email:${username}`,
            label: '',
            type: PNID_ANNOTATION_TYPE,
            page: annotation.page,
            box: {
              xMin: annotation.mark.x,
              yMin: annotation.mark.y,
              xMax: annotation.mark.x + annotation.mark.width,
              yMax: annotation.mark.y + annotation.mark.height,
            },
          },
        ])
    );
  };

  const setPage = async (newPage: number) => {
    if (fileId) {
      const currentSearch = queryString.parse(search);
      history.replace({
        search: queryString.stringify({
          ...currentSearch,
          page: newPage,
        }),
      });
    }
  };

  const getExtraActions = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ): ExtraEditorOption[] => {
    return [
      {
        key: 'find-similar-button',
        icon: isFindingSimilarObjects ? 'Loading' : 'Scan',
        onClick: async () => {
          if (fileId && !isFindingSimilarObjects) {
            dispatch(findSimilarObjects(fileId, annotation.box));
          }
        },
        action: 'Find Similar Tags',
      },
    ];
  };
  const renderExtraContent = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => {
    if ('metadata' in annotation) {
      const { score, fromSimilarJob } = annotation.metadata!;
      if (fromSimilarJob) {
        return (
          <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <SmallTitle>From Similar Object</SmallTitle>
            <p>Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%</p>
          </div>
        );
      }
    }
    return null;
  };
  const renderMenuButton = () => {
    if (similarSearchMode) {
      return (
        <div>
          <Button
            type="primary"
            icon={isFindingSimilarObjects ? 'Loading' : 'Close'}
            disabled={isFindingSimilarObjects}
            onClick={() => {
              setSimilarSearchMode(false);
              setPendingPnidAnnotations([]);
            }}
          >
            {isFindingSimilarObjects ? 'Finding Objects...' : 'Exit Mode'}
          </Button>
        </div>
      );
    }
    if (creatable) {
      return (
        <div>
          <Button
            type="primary"
            icon="Check"
            onClick={() => {
              if (!canEditEvents) {
                setRenderFeedback(true);
                return;
              }
              if (pendingPnidAnnotations.length > 0) {
                Modal.confirm({
                  title: 'Are you sure?',
                  content: (
                    <span>
                      Do you want to stop editing? You have pending changes,
                      which will be <strong>deleted</strong> if you leave the
                      editing mode now. Of course, any changes you have already
                      written to CDF have been saved.
                    </span>
                  ),
                  onOk: () => {
                    setCreatable(false);
                    setPendingPnidAnnotations([]);
                  },
                  onCancel: () => {},
                });
              } else {
                setCreatable(false);
              }
            }}
          >
            Finish Adding
          </Button>
        </div>
      );
    }

    return (
      <Dropdown
        content={
          <Menu style={{ marginTop: 4 }}>
            <Menu.Header>Contextualization</Menu.Header>
            <Menu.Item
              onClick={() => {
                setSimilarSearchMode(true);
              }}
            >
              <Icon type="Scan" />
              <span>Find similar tags or objects</span>
            </Menu.Item>
            <Menu.Header>File</Menu.Header>
            <Menu.Item onClick={() => setCreatable(true)}>
              <Icon type="Plus" />
              <span>Add New Tags</span>
            </Menu.Item>
            {pendingPnidAnnotations.length !== 0 && (
              <Menu.Item onClick={() => setPendingPnidAnnotations([])}>
                <Icon type="Delete" />
                <span>Clear Pending Tags</span>
              </Menu.Item>
            )}
            <Menu.Item
              onClick={() =>
                Modal.confirm({
                  title: 'Are you sure?',
                  content: (
                    <span>
                      All annotations will be deleted . However, you can always
                      re-contextualize the file.
                    </span>
                  ),
                  onOk: async () => {
                    setCreatable(false);
                    dispatch(hardDeleteAnnotationsForFile.action({ file }));
                    message.success(
                      `Successfully cleared annotation for ${file!.name}`
                    );
                  },
                  onCancel: () => {},
                })
              }
            >
              <Icon type="Close" style={{ width: 16 }} />
              <span>Clear Tags</span>
            </Menu.Item>
          </Menu>
        }
        placement="bottom-end"
      >
        <Button icon="CaretDown" iconPlacement="right" type="primary">
          Actions
        </Button>
      </Dropdown>
    );
  };
  return (
    <Wrapper>
      {renderFeedback && (
        <MissingPermissionFeedback
          key="eventsAcl"
          acl="eventsAcl"
          type="WRITE"
        />
      )}
      <OverviewWrapper className="overview">
        {children}
        {file && (
          <FilePreviewOverview
            file={file}
            page={page}
            annotations={pnidAnnotations}
            onAssetClicked={onAssetClicked}
            onFileClicked={onFileClicked}
            onPageChange={setPage}
            extras={renderMenuButton()}
          />
        )}
      </OverviewWrapper>
      <div style={{ flex: 1, position: 'relative' }}>
        {file ? (
          <FileViewer
            file={file}
            sdk={sdk}
            page={page}
            setPage={setPage}
            annotations={annotations}
            drawLabel={false}
            editCallbacks={{
              onDelete: () => {},
              onCreate: onCreateAnnotation,
              onUpdate: onUpdateAnnotation,
            }}
            creatable={similarSearchMode || creatable}
            onSelect={(annotation) => {
              if (annotation) {
                const pnidAnnotation =
                  pnidAnnotations.find(
                    (el: any) => `${el.id}` === annotation.id
                  ) ||
                  pendingPnidAnnotations.find((el) => el.id === annotation.id);
                if (pnidAnnotation) {
                  setSelectedAnnotation(pnidAnnotation);
                }
              } else {
                setSelectedAnnotation(undefined);
              }
            }}
            renderItemPreview={(
              _,
              annotation,
              onLabelChange,
              onDelete,
              height
            ) => {
              const pnidAnnotation =
                pnidAnnotations.find(
                  (el: any) => `${el.id}` === annotation.id
                ) ||
                pendingPnidAnnotations.find((el) => el.id === annotation.id);
              if (pnidAnnotation) {
                if (similarSearchMode) {
                  return (
                    <Button
                      disabled={isFindingSimilarObjects}
                      type="primary"
                      onClick={async () => {
                        if (fileId && !isFindingSimilarObjects) {
                          await dispatch(
                            findSimilarObjects(fileId, pnidAnnotation.box)
                          );
                          setSimilarSearchMode(false);
                        }
                      }}
                      icon={isFindingSimilarObjects ? 'Loading' : 'Scan'}
                    >
                      Find Similar Tags
                    </Button>
                  );
                }
                return (
                  <CogniteFileViewerEditor
                    height={height}
                    onFileClicked={onFileClicked}
                    onAssetClicked={onAssetClicked}
                    annotation={pnidAnnotation}
                    onUpdateDetection={async (newAnnotation) => {
                      onLabelChange(newAnnotation.label || 'No Label');
                      await onSaveDetection(newAnnotation);
                    }}
                    renderResourceActions={renderResourceActions}
                    onDeleteDetection={() => {
                      Modal.confirm({
                        title: 'Are you sure?',
                        content:
                          'Are you sure you want to delete this linkage?',
                        onOk: () => {
                          onDelete();
                          onDeleteAnnotation(annotation);
                        },
                      });
                    }}
                    extraActions={getExtraActions(pnidAnnotation)}
                  >
                    {renderExtraContent(pnidAnnotation)}
                  </CogniteFileViewerEditor>
                );
              }
              return <></>;
            }}
          />
        ) : (
          <CenteredPlaceholder>
            <Title level={2}>No P&ID Selected</Title>
            <p>Please search for a P&ID to start viewing.</p>
          </CenteredPlaceholder>
        )}
      </div>
    </Wrapper>
  );
};
