import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { notification, Modal } from 'antd';
import styled from 'styled-components';
import { CogniteAnnotation } from '@cognite/annotations';
import { itemSelector as assetSelector } from 'modules/assets';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as sequenceSelector } from 'modules/sequences';
import { useSelector, useDispatch } from 'react-redux';
import {
  create as createAnnotations,
  remove as removeAnnotations,
} from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Button, Title, Icon, Colors, Body, Overline } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from 'components/CogniteFileViewer';
import {
  CreateAnnotationForm,
  InfoGrid,
  InfoCell,
  ButtonRow,
  Divider,
} from 'components/Common';
import { ResourceSidebar } from 'containers/ResourceSidebar/ResourceSidebar';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import {
  useResourceItemFromAnnotation,
  fetchResourceForAnnotation,
} from './CogniteFileViewerUtils';

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

export const FileViewerPreviewSidebar = ({
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

  const { openPreview, hidePreview } = useResourcePreview();

  const selectedAnnotationId = selectedAnnotation
    ? selectedAnnotation.id
    : undefined;

  const isPendingAnnotation = typeof selectedAnnotationId === 'string';

  useEffect(() => {
    setEditing(false);
  }, [selectedAnnotationId]);

  const selectedResourceItem = useResourceItemFromAnnotation(
    selectedAnnotation
  );

  useEffect(() => {
    if (selectedAnnotation) {
      dispatch(fetchResourceForAnnotation(selectedAnnotation));
    }
  }, [dispatch, selectedAnnotation]);

  const onSaveDetection = useCallback(async () => {
    if (selectedAnnotation) {
      if (typeof selectedAnnotation.id === 'string') {
        trackUsage('FileViewer.CreateAnnotation', {
          annotation: selectedAnnotation,
        });
        const pendingObj = { ...selectedAnnotation };
        // @ts-ignore
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
  }, [
    dispatch,
    file,
    pendingPnidAnnotations,
    selectedAnnotation,
    setPendingPnidAnnotations,
  ]);

  const onDeleteAnnotation = useCallback(async () => {
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
  }, [
    selectedAnnotation,
    deselectAnnotation,
    dispatch,
    file,
    pendingPnidAnnotations,
    setPendingPnidAnnotations,
  ]);

  const footer = useMemo(() => {
    if (selectedAnnotation && 'metadata' in selectedAnnotation) {
      const { score, fromSimilarJob } = selectedAnnotation.metadata!;
      if (fromSimilarJob) {
        return (
          <InfoGrid noBorders>
            <InfoCell noBorders>
              <Divider.Horizontal />
              <Title level={5}>From Similar Object</Title>
              <Body level={2}>
                Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%
              </Body>
            </InfoCell>
          </InfoGrid>
        );
      }
    }
    return undefined;
  }, [selectedAnnotation]);

  let annotationPreview: string | undefined;
  if (selectedAnnotation) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = loadPreview(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const header = useMemo(() => {
    if (selectedAnnotation) {
      return (
        <InfoGrid noBorders>
          <InfoCell noBorders>
            <Overline level={2}>LABEL</Overline>
            <Title level={5}>{selectedAnnotation.label}</Title>
            <Overline level={2} style={{ marginTop: 8 }}>
              DESCRIPTION
            </Overline>
            <Body level={2}>{selectedAnnotation.description || 'N/A'}</Body>
          </InfoCell>
          <InfoCell noBorders>
            <ButtonRow>
              <Button onClick={() => onDeleteAnnotation()}>
                <Icon type="Delete" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  setEditing(true);
                }}
              >
                <Icon type="Edit" />
                Edit
              </Button>
            </ButtonRow>
          </InfoCell>
          <Divider.Horizontal />
        </InfoGrid>
      );
    }
    return undefined;
  }, [selectedAnnotation, onDeleteAnnotation]);

  const content = useMemo(() => {
    if (selectedAnnotation && (isPendingAnnotation || editing)) {
      return (
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
    }
    return undefined;
  }, [
    isPendingAnnotation,
    selectedAnnotation,
    editing,
    annotationPreview,
    deselectAnnotation,
    onDeleteAnnotation,
    onSaveDetection,
    updateAnnotation,
  ]);

  const { id, type } = selectedResourceItem || {};

  useEffect(() => {
    if (selectedAnnotationId) {
      openPreview({
        item: id && type ? { id, type } : undefined,
        header,
        footer,
        content,
        onClose: () => deselectAnnotation(),
      });
    }
  }, [
    openPreview,
    selectedAnnotationId,
    id,
    type,
    header,
    content,
    footer,
    deselectAnnotation,
  ]);

  useEffect(() => {
    if (!selectedAnnotation) {
      hidePreview();
    }
  }, [selectedAnnotation, hidePreview]);

  return (
    <ResourceActionsProvider>
      <ResourceSelectionProvider
        mode="single"
        onSelect={item => {
          let itemExternalId: string | undefined;
          let itemType: CogniteAnnotation['resourceType'];
          switch (item.type) {
            case 'asset': {
              const asset = getAsset(item.id);
              itemType = 'asset';
              if (asset) {
                itemExternalId = asset.externalId;
              }
              break;
            }
            case 'file': {
              const previewFile = getFile(item.id);
              itemType = 'file';
              if (previewFile) {
                itemExternalId = previewFile.externalId;
              }
              break;
            }
            case 'sequence': {
              itemType = 'sequence';
              const sequence = getSequence(item.id);
              if (sequence) {
                itemExternalId = sequence.externalId;
              }
              break;
            }
            case 'timeSeries': {
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
