import React, { useEffect, useState } from 'react';
import { message, Modal } from 'antd';
import { IAnnotation, IRectShapeData } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import SplitPane from 'react-split';
import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
  CURRENT_VERSION,
} from '@cognite/annotations';
import { itemSelector as fileSelector } from 'modules/files';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAnnotations,
  hardDeleteAnnotationsForFile,
} from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Button, Menu, Dropdown, Icon, Colors } from '@cognite/cogs.js';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { checkPermission } from 'modules/app';
import { findSimilarObjects } from 'modules/fileContextualization/similarObjectJobs';
import { v4 as uuid } from 'uuid';
import { RootState } from 'reducers';
import {
  FileViewer,
  FilePreviewOverview,
  IAnnotationWithPage,
} from 'components/Common';
import { FilesMetadata, Asset, Sequence } from '@cognite/sdk';
import sdk, { getAuthState } from 'sdk-singleton';
import { useLocation, useHistory } from 'react-router';
import queryString from 'query-string';
import { PNID_ANNOTATION_TYPE } from 'utils/AnnotationUtils';
import { ResourcePreviewSidebar } from 'components/CogniteFileViewer/ResourcePreviewSidebar';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { selectAnnotationColor } from './CogniteFileViewerUtils';

const OverviewWrapper = styled.div`
  height: 100%;
  min-width: 360px;
  display: inline-flex;
  flex-direction: column;
`;

const ButtonRow = styled.div`
  display: flex;
  && > * {
    margin-right: 4px;
  }
  && > *:nth-last-child(1) {
    margin-right: 0px;
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

const Wrapper = styled.div<{ showResourceSidebar: boolean }>`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  && .splitter > div:nth-child(4),
  && .splitter > div:nth-child(5) {
    display: ${props => (props.showResourceSidebar ? 'block' : 'none')};
  }
`;
const SplitWrapper = styled(SplitPane)`
  flex: 1;
  min-height: 200px;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;

  button.cogs-menu-item {
    color: ${Colors.black.hex()};
  }

  .rp-stage {
    display: flex;
    position: relative;
    height: 100%;
    flex: 1;
    overflow: hidden;
  }

  .gutter {
    cursor: col-resize;
  }
`;

type Props = {
  fileId?: number;
  children?: React.ReactNode;
  onFileClicked?: (file: FilesMetadata) => void;
  onAssetClicked?: (asset: Asset) => void;
  onSequenceClicked?: (sequence: Sequence) => void;
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
  onSequenceClicked,
}: Props) => {
  const { search } = useLocation();

  const { page = 1 }: { page?: number } = queryString.parse(search, {
    parseNumbers: true,
  });

  const history = useHistory();
  const dispatch = useDispatch();
  const renderResourceActions = useResourceActionsContext();
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
  const getFile = useSelector(fileSelector);
  const { username } = getAuthState();
  const file = getFile(fileId);
  const pnidAnnotations = useSelector(selectAnnotations)(fileId);
  const [pendingPnidAnnotations, setPendingPnidAnnotations] = useState(
    [] as ProposedCogniteAnnotation[]
  );

  const [initialLoadHack, setHack] = useState(false);

  useEffect(() => {
    setHack(true);
  }, []);

  const [creatable, setCreatable] = useState(false);
  const [similarSearchMode, setSimilarSearchMode] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<
    ProposedCogniteAnnotation | CogniteAnnotation | undefined
  >(undefined);

  const similarObjectJobs = useSelector((state: RootState) =>
    fileId ? state.fileContextualization.similarObjectJobs[fileId] : {}
  );

  const isFindingSimilarObjects = similarObjectJobs
    ? Object.values(similarObjectJobs).some(el => !el.jobDone)
    : false;

  const annotations = pnidAnnotations
    .map(el => {
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
              !!(
                (el.resourceExternalId &&
                  el.resourceExternalId ===
                    selectedAnnotation?.resourceExternalId) ||
                (el.resourceId &&
                  el.resourceId === selectedAnnotation?.resourceId)
              )
          ),
        },
      } as IAnnotation<IRectShapeData>;
    })
    .concat(
      pendingPnidAnnotations.map(
        el =>
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

  const [renderFeedback, setRenderFeedback] = useState(false);
  const canEditEvents = useSelector(checkPermission)('eventsAcl', 'WRITE');

  useEffect(() => {
    const newItems: ProposedCogniteAnnotation[] = [];
    Object.keys(similarObjectJobs || {}).forEach(key => {
      if (!visibleSimilarityJobs[key] && similarObjectJobs[key].annotations) {
        similarObjectJobs[key].annotations!.forEach(el => {
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

  const onUpdateAnnotation = async (
    annotation: IAnnotation<IRectShapeData>
  ) => {
    if (!canEditEvents) {
      setRenderFeedback(true);
      return;
    }

    if (pendingPnidAnnotations.find(el => el.id === annotation.id)) {
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
    } else {
      // message.info('Coming Soon');
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
        .filter(el => el.label.length > 0)
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
              <span>Similar Tag or Object Detection</span>
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
                    await dispatch(hardDeleteAnnotationsForFile(file!));
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
    <Wrapper showResourceSidebar={!!selectedAnnotation}>
      {renderFeedback ? (
        <MissingPermissionFeedback key="eventsAcl" type="WRITE" />
      ) : null}
      <SplitWrapper
        className="splitter"
        minSize={[360, 360, selectedAnnotation ? 360 : 0]}
        sizes={initialLoadHack ? undefined : [0, 100, 0]}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        dragInterval={1}
        cursor="col-resize"
        onDragEnd={() => {
          window.dispatchEvent(new Event('resize'));
        }}
      >
        <OverviewWrapper className="overview">
          {children}
          {file && (
            <FilePreviewOverview
              file={file}
              page={page}
              annotations={pnidAnnotations}
              onAssetClicked={onAssetClicked}
              onFileClicked={onFileClicked}
              onSequenceClicked={onSequenceClicked}
              onPageChange={setPage}
              extras={
                <ButtonRow>
                  {renderResourceActions({ fileId: file.id })}
                  {renderMenuButton()}
                </ButtonRow>
              }
            />
          )}
        </OverviewWrapper>
        <div style={{ flex: 1, position: 'relative' }}>
          {file ? (
            <FileViewer
              file={file}
              sdk={sdk}
              hoverable={false}
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
              onSelect={annotation => {
                if (annotation) {
                  const pnidAnnotation =
                    pnidAnnotations.find(el => `${el.id}` === annotation.id) ||
                    pendingPnidAnnotations.find(el => el.id === annotation.id);
                  if (pnidAnnotation) {
                    setSelectedAnnotation(pnidAnnotation);
                  }
                } else {
                  setSelectedAnnotation(undefined);
                }
              }}
              renderItemPreview={(_, annotation) => {
                const pnidAnnotation =
                  pnidAnnotations.find(el => `${el.id}` === annotation.id) ||
                  pendingPnidAnnotations.find(el => el.id === annotation.id);
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
                }
                return <></>;
              }}
            />
          ) : (
            <CenteredPlaceholder>
              <h1>No File Selected</h1>
              <p>Please search for a File to start viewing.</p>
            </CenteredPlaceholder>
          )}
        </div>
        <ResourcePreviewSidebar
          fileId={fileId}
          deselectAnnotation={() => setSelectedAnnotation(undefined)}
          selectedAnnotation={selectedAnnotation}
          pendingPnidAnnotations={pendingPnidAnnotations}
          setPendingPnidAnnotations={setPendingPnidAnnotations}
        />
      </SplitWrapper>
    </Wrapper>
  );
};
