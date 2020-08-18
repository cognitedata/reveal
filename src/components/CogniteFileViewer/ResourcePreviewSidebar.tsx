import React, { useEffect, useState } from 'react';
import { notification, Modal } from 'antd';
import styled from 'styled-components';
import { CogniteAnnotation } from '@cognite/annotations';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAssets,
  retrieveExternal as retrieveExternalAssets,
} from 'modules/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
  retrieveExternal as retrieveExternalTimeseries,
} from 'modules/timeseries';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
  retrieveExternal as retrieveExternalFiles,
} from 'modules/files';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequences,
  retrieveExternal as retrieveExternalSequences,
} from 'modules/sequences';
import { useSelector, useDispatch } from 'react-redux';
import {
  create as createAnnotations,
  remove as removeAnnotations,
} from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Button, Title, Dropdown, Menu, Icon, Colors } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files/FileSmallPreview';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { ProposedCogniteAnnotation } from 'components/CogniteFileViewer';
import {
  CreateAnnotationForm,
  InfoGrid,
  InfoCell,
  Loader,
} from 'components/Common';
import { ResourceSidebar } from 'containers/ResourceSidebar/ResourceSidebar';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';

const ResourcePreviewWrapper = styled.div<{ hasContent: boolean }>`
  min-width: ${props => (props.hasContent ? '360px' : '0')};
  height: 100%;
  overflow: auto;
  background: #fff;
`;

const CloseButton = styled(Button)`
  float: right;
`;

type Props = {
  fileId?: number;
  selectedAnnotation: ProposedCogniteAnnotation | CogniteAnnotation | undefined;
  pendingPnidAnnotations: ProposedCogniteAnnotation[];
  setPendingPnidAnnotations: (annotations: ProposedCogniteAnnotation[]) => void;
  deselectAnnotation: () => void;
  updateAnnotation: (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => void;
  loadPreview: (
    x: number,
    y: number,
    w: number,
    h: number
  ) => string | undefined;
};

export const ResourcePreviewSidebar = ({
  fileId,
  selectedAnnotation,
  pendingPnidAnnotations,
  setPendingPnidAnnotations,
  deselectAnnotation,
  updateAnnotation,
  loadPreview,
}: Props) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [showLinkResource, setShowLinkResource] = useState<boolean>(false);
  const dispatch = useDispatch();
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  const file = getFile(fileId);

  const selectedAnnotationId = selectedAnnotation
    ? selectedAnnotation.id
    : undefined;

  const isPendingAnnotation = typeof selectedAnnotationId === 'string';

  useEffect(() => {
    setEditing(false);
  }, [selectedAnnotationId]);

  useEffect(() => {
    if (selectedAnnotation) {
      const { resourceId, resourceExternalId } = selectedAnnotation;
      switch (selectedAnnotation.resourceType) {
        case 'asset': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalAssets([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveAssets([{ id: resourceId! }]));
          }
          break;
        }
        case 'timeSeries': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalTimeseries([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveTimeseries([{ id: resourceId! }]));
          }
          break;
        }
        case 'file': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalFiles([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveFiles([{ id: resourceId! }]));
          }
          break;
        }
        case 'sequence': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalSequences([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveSequences([{ id: resourceId! }]));
          }
          break;
        }
      }
    }
    window.dispatchEvent(new Event('resize'));
  }, [dispatch, selectedAnnotation]);

  const onSaveDetection = async () => {
    if (selectedAnnotation) {
      if (typeof selectedAnnotation.id === 'string') {
        trackUsage('FileViewer.CreateAnnotation', {
          annotation: selectedAnnotation,
        });
        const pendingObj = { ...selectedAnnotation };
        delete pendingObj.id;
        delete pendingObj.metadata;
        dispatch(createAnnotations(file!, [pendingObj]));
        setPendingPnidAnnotations(
          pendingPnidAnnotations.filter(el => el.id !== selectedAnnotation.id)
        );
      } else {
        notification.info({ message: 'Coming Soon' });
      }
    }
  };

  const onDeleteAnnotation = async () => {
    if (selectedAnnotation) {
      if (pendingPnidAnnotations.find(el => el.id === selectedAnnotation.id)) {
        setPendingPnidAnnotations(
          pendingPnidAnnotations.filter(el => el.id !== selectedAnnotation.id)
        );
      } else {
        trackUsage('FileViewer.DeleteAnnotation', {
          annotation: selectedAnnotation,
        });
        Modal.confirm({
          title: 'Are you sure?',
          content: (
            <span>
              This annotations will be deleted. However, you can always
              re-contextualize the file.
            </span>
          ),
          onOk: async () => {
            dispatch(
              removeAnnotations(file!, [
                selectedAnnotation as CogniteAnnotation,
              ])
            );
            deselectAnnotation();
          },
          onCancel: () => {},
        });
      }
    }
  };

  const renderExtraContent = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ): React.ReactNode => {
    if ('metadata' in annotation) {
      const { score, fromSimilarJob } = annotation.metadata!;
      if (fromSimilarJob) {
        return (
          <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <Title level={5}>From Similar Object</Title>
            <p>Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%</p>
          </div>
        );
      }
    }
    return null;
  };
  let content: React.ReactNode = null;
  let annotationPreview: string | undefined;

  if (selectedAnnotation) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = loadPreview(xMin, yMin, xMax - xMin, yMax - yMin);
    const extraButton = (
      <Dropdown
        key="extras"
        content={
          <Menu>
            <Menu.Item onClick={() => onDeleteAnnotation()}>
              <Icon type="Delete" />
              Delete
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setEditing(true);
              }}
            >
              <Icon type="Edit" />
              Edit
            </Menu.Item>
          </Menu>
        }
      >
        <Button icon="VerticalEllipsis" />
      </Dropdown>
    );
    if (isPendingAnnotation || editing) {
      content = (
        <CreateAnnotationForm
          annotation={selectedAnnotation}
          updateAnnotation={updateAnnotation}
          onLinkResource={() => setShowLinkResource(true)}
          onDelete={() => {
            onDeleteAnnotation();
            deselectAnnotation();
            setEditing(false);
          }}
          onSave={() => {
            onSaveDetection();
            setEditing(false);
            if (isPendingAnnotation) {
              deselectAnnotation();
            }
          }}
          previewImageSrc={annotationPreview}
          onCancel={isPendingAnnotation ? undefined : () => setEditing(false)}
        />
      );
    } else {
      content = <Loader />;
      switch (selectedAnnotation.resourceType) {
        case 'asset': {
          const asset = getAsset(
            selectedAnnotation.resourceExternalId ||
              selectedAnnotation.resourceId
          );
          if (asset) {
            content = (
              <AssetSmallPreview assetId={asset.id} extras={[extraButton]}>
                {renderExtraContent(selectedAnnotation)}
              </AssetSmallPreview>
            );
          }
          break;
        }
        case 'file': {
          const previewFile = getFile(
            selectedAnnotation.resourceExternalId ||
              selectedAnnotation.resourceId
          );
          if (previewFile) {
            content = (
              <FileSmallPreview fileId={previewFile.id} extras={[extraButton]}>
                {renderExtraContent(selectedAnnotation)}
              </FileSmallPreview>
            );
          }
          break;
        }
        case 'sequence': {
          const sequence = getSequence(
            selectedAnnotation.resourceExternalId ||
              selectedAnnotation.resourceId
          );
          if (sequence) {
            content = (
              <SequenceSmallPreview
                sequenceId={sequence.id}
                extras={[extraButton]}
              >
                {renderExtraContent(selectedAnnotation)}
              </SequenceSmallPreview>
            );
          }
          break;
        }
        case 'timeSeries': {
          const timeseries = getTimeseries(
            selectedAnnotation.resourceExternalId ||
              selectedAnnotation.resourceId
          );
          if (timeseries) {
            content = (
              <TimeseriesSmallPreview
                timeseriesId={timeseries.id}
                extras={[extraButton]}
              >
                {renderExtraContent(selectedAnnotation)}
              </TimeseriesSmallPreview>
            );
          }
          break;
        }
        case undefined: {
          content = (
            <InfoGrid noBorders>
              <InfoCell noBorders>
                <Title level={5}>{selectedAnnotation.label}</Title>
                <p>{selectedAnnotation.description}</p>
                <div style={{ position: 'absolute', top: 8, right: 12 }}>
                  {extraButton}
                </div>
              </InfoCell>
            </InfoGrid>
          );
        }
      }
    }
  }
  return (
    <>
      <ResourcePreviewWrapper hasContent={!!content}>
        {content && (
          <CloseButton
            icon="Close"
            variant="ghost"
            onClick={() => deselectAnnotation()}
          />
        )}
        {content}
      </ResourcePreviewWrapper>
      <ResourceActionsProvider>
        <ResourceSelectionProvider
          mode="single"
          onSelect={item => {
            let itemExternalId: string | undefined;
            let itemType: CogniteAnnotation['resourceType'];
            switch (item.type) {
              case 'assets': {
                const asset = getAsset(item.id);
                itemType = 'asset';
                if (asset) {
                  itemExternalId = asset.externalId;
                }
                break;
              }
              case 'files': {
                const previewFile = getFile(item.id);
                itemType = 'file';
                if (previewFile) {
                  itemExternalId = previewFile.externalId;
                }
                break;
              }
              case 'sequences': {
                itemType = 'sequence';
                const sequence = getSequence(item.id);
                if (sequence) {
                  itemExternalId = sequence.externalId;
                }
                break;
              }
              case 'timeseries': {
                itemType = 'timeSeries';
                const timeseries = getTimeseries(item.id);
                if (timeseries) {
                  itemExternalId = timeseries.externalId;
                }
                break;
              }
            }
            updateAnnotation({
              ...selectedAnnotation!,
              resourceType: itemType,
              resourceExternalId: itemExternalId,
              resourceId: item.id,
            });
            setShowLinkResource(false);
          }}
        >
          <ResourceSidebar
            onClose={() => setShowLinkResource(false)}
            visible={showLinkResource}
          >
            {annotationPreview && (
              <PreviewImage src={annotationPreview} alt="preview" />
            )}
          </ResourceSidebar>
        </ResourceSelectionProvider>
      </ResourceActionsProvider>
    </>
  );
};

const PreviewImage = styled.img`
  max-height: 200px;
  padding: 12px;
  background: ${Colors['greyscale-grey3'].hex()};
  width: auto;
  object-fit: contain;
  display: block;
  align-self: flex-start;
  margin-bottom: 16px;
`;
