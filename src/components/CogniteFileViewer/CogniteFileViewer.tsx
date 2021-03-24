import React, { useEffect, useState, useMemo } from 'react';
import { message, Modal } from 'antd';
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
  selectAnnotations,
  hardDeleteAnnotationsForFile,
} from 'modules/annotations';
import { Button, Menu, Dropdown, Icon, Colors } from '@cognite/cogs.js';
import { itemSelector as fileSelector } from 'modules/files';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { checkPermission } from 'modules/app';
import { v4 as uuid } from 'uuid';
import { RootState } from 'store';
import { FilePreviewOverview } from 'components/Common';
import { FileInfo, Asset } from '@cognite/sdk';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { useLocation, useHistory } from 'react-router';
import queryString from 'query-string';
import { PNID_ANNOTATION_TYPE } from 'utils/AnnotationUtils';
import { FilePreview as CogniteFilePreview } from '@cognite/data-exploration';
import { createLink } from '@cognite/cdf-utilities';
import sdk from 'sdk-singleton';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';

const OverviewWrapper = styled.div`
  height: 100%;
  width: 360px;
  display: inline-flex;
  flex-direction: column;

  && > * {
    margin-bottom: 24px;
  }
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

export const ContextFileViewer = ({
  fileId,
  children,
  onFileClicked,
  onAssetClicked,
}: Props) => {
  const { search } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

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

  const similarObjectJobs = useSelector((state: RootState) =>
    fileId ? state.fileContextualization.similarObjectJobs[fileId] : {}
  );

  const isFindingSimilarObjects = similarObjectJobs
    ? Object.values(similarObjectJobs).some((el: any) => !el.jobDone)
    : false;

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
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
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
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <CogniteFilePreview
            fileId={fileId!}
            creatable
            contextualization
            onItemClicked={(item) =>
              window.open(createLink(`/explore/${item.type}/${item.id}`))
            }
          />
        </div>
      </Wrapper>
    </CogniteFileViewer.Provider>
  );
};
