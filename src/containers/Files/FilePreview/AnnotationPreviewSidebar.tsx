/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import { itemSelector as fileSelector } from '@cognite/cdf-resources-store/dist/files';
import { itemSelector as assetSelector } from '@cognite/cdf-resources-store/dist/assets';
import { itemSelector as timeseriesSelector } from '@cognite/cdf-resources-store/dist/timeseries';
import { itemSelector as sequenceSelector } from '@cognite/cdf-resources-store/dist/sequences';
import { itemSelector as eventSelector } from '@cognite/cdf-resources-store/dist/events';
import {
  Button,
  Icon,
  Title,
  Body,
  Overline,
  Colors,
  Collapse,
} from '@cognite/cogs.js';
import {
  create as createAnnotations,
  remove as removeAnnotations,
} from 'modules/annotations';
import {
  useSelectedAnnotation,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import {
  SpacedRow,
  Divider,
  InfoGrid,
  InfoCell,
  CreateAnnotationForm,
} from 'components/Common';
import { Modal, message } from 'antd';
import { trackUsage } from 'utils/Metrics';
import { CogniteAnnotation } from '@cognite/annotations';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import styled from 'styled-components';
import {
  findSimilarObjects,
  selectObjectStatus,
} from 'modules/fileContextualization/similarObjectJobs';
import { useResourceItemFromAnnotation } from 'utils/AnnotationUtils';
import { useResourceSelector } from 'context/ResourceSelectorContext';
import { ResourceItemState } from 'context/ResourceSelectionContext';
import { ContextualizationData } from './ContextualizationModule';

type Props = {
  fileId?: number;
  contextualization: boolean;
  pendingAnnotations: ProposedCogniteAnnotation[];
  setPendingAnnotations: (annos: ProposedCogniteAnnotation[]) => void;
};

const AnnotationPreviewSidebar = ({
  fileId,
  pendingAnnotations,
  setPendingAnnotations,
  contextualization,
}: Props) => {
  const { selectedAnnotation, setSelectedAnnotation } = useSelectedAnnotation();
  const dispatch = useResourcesDispatch();
  const getFile = useResourcesSelector(fileSelector);
  const getAsset = useResourcesSelector(assetSelector);
  const getTimeseries = useResourcesSelector(timeseriesSelector);
  const getSequence = useResourcesSelector(sequenceSelector);
  const getEvent = useResourcesSelector(eventSelector);
  const file = getFile(fileId);

  const [editing, setEditing] = useState<boolean>(false);

  const extractFromCanvas = useExtractFromCanvas();

  const { openPreview, hidePreview } = useResourcePreview();
  const { openResourceSelector } = useResourceSelector();

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

  const isFindingSimilarObjects = useResourcesSelector(selectObjectStatus)(
    fileId
  );

  let annotationPreview: string | undefined;
  if (selectedAnnotation && extractFromCanvas) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const isEditingMode = isPendingAnnotation || editing;

  const similarButton = useMemo(() => {
    if (selectedAnnotation) {
      return (
        <Button
          loading={isFindingSimilarObjects}
          icon="Search"
          onClick={() => {
            if (fileId) {
              dispatch(findSimilarObjects(fileId, selectedAnnotation.box));
            }
          }}
        >
          Find Similar
        </Button>
      );
    }
    return null;
  }, [dispatch, selectedAnnotation, isFindingSimilarObjects, fileId]);

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
        setPendingAnnotations(
          pendingAnnotations.filter(el => el.id !== selectedAnnotation.id)
        );
      } else {
        message.info('Coming Soon');
      }
    }
  }, [
    dispatch,
    file,
    pendingAnnotations,
    selectedAnnotation,
    setPendingAnnotations,
  ]);

  const onLinkResource = useCallback(() => {
    openResourceSelector({
      onSelect: item => {
        let externalId: string | undefined;
        switch (item.type) {
          case 'asset': {
            const asset = getAsset(item.id);
            externalId = asset?.externalId;
            break;
          }
          case 'file': {
            const previewFile = getFile(item.id);
            externalId = previewFile?.externalId;
            break;
          }
          case 'sequence': {
            const sequence = getSequence(item.id);
            externalId = sequence?.externalId;
            break;
          }
          case 'timeSeries': {
            const timeseries = getTimeseries(item.id);
            externalId = timeseries?.externalId;
            break;
          }
          case 'event': {
            const event = getEvent(item.id);
            externalId = event?.externalId;
            break;
          }
        }
        setSelectedAnnotation({
          ...selectedAnnotation!,
          resourceType: item.type,
          resourceExternalId: externalId,
          resourceId: item.id,
        });
      },
      resourcesState: selectedAnnotation
        ? [
            {
              type: selectedAnnotation.resourceType,
              id: selectedAnnotation.resourceId,
              state: 'selected',
            } as ResourceItemState,
          ]
        : undefined,
      children: annotationPreview && (
        <Collapse defaultActiveKey={[]}>
          <Collapse.Panel key="preview" header="Annotation Preview">
            <PreviewImage src={annotationPreview} alt="preview" />
          </Collapse.Panel>
        </Collapse>
      ),
    });
  }, [
    openResourceSelector,
    getAsset,
    getFile,
    getSequence,
    getTimeseries,
    getEvent,
    selectedAnnotation,
    annotationPreview,
    setSelectedAnnotation,
  ]);

  const onDeleteAnnotation = useCallback(async () => {
    if (selectedAnnotation) {
      if (pendingAnnotations.find(el => el.id === selectedAnnotation.id)) {
        setPendingAnnotations(
          pendingAnnotations.filter(el => el.id !== selectedAnnotation.id)
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
            setSelectedAnnotation(undefined);
          },
          onCancel: () => {},
        });
      }
    }
  }, [
    selectedAnnotation,
    setSelectedAnnotation,
    dispatch,
    file,
    pendingAnnotations,
    setPendingAnnotations,
  ]);

  const footer = useMemo(() => {
    return (
      <ContextualizationData
        selectedAnnotation={selectedAnnotation}
        extractFromCanvas={extractFromCanvas}
      />
    );
  }, [selectedAnnotation, extractFromCanvas]);

  const header = useMemo(() => {
    if (selectedAnnotation && !isEditingMode) {
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
          {contextualization && (
            <InfoCell noBorders>
              <SpacedRow>
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
                {similarButton}
              </SpacedRow>
            </InfoCell>
          )}
          <Divider.Horizontal />
        </InfoGrid>
      );
    }
    return undefined;
  }, [
    selectedAnnotation,
    onDeleteAnnotation,
    isEditingMode,
    contextualization,
    similarButton,
  ]);

  const content = useMemo(() => {
    if (selectedAnnotation && isEditingMode) {
      return (
        <CreateAnnotationForm
          annotation={selectedAnnotation}
          updateAnnotation={setSelectedAnnotation}
          onLinkResource={onLinkResource}
          onDelete={() => {
            onDeleteAnnotation();
            setSelectedAnnotation(undefined);
            setEditing(false);
          }}
          onSave={() => {
            onSaveDetection();
            setEditing(false);
            if (isPendingAnnotation) {
              setSelectedAnnotation(undefined);
            }
          }}
          previewImageSrc={annotationPreview}
          onCancel={isPendingAnnotation ? undefined : () => setEditing(false)}
        >
          <Divider.Horizontal />
          <SpacedRow>{similarButton}</SpacedRow>
        </CreateAnnotationForm>
      );
    }
    return undefined;
  }, [
    isPendingAnnotation,
    selectedAnnotation,
    isEditingMode,
    annotationPreview,
    setSelectedAnnotation,
    onDeleteAnnotation,
    onSaveDetection,
    similarButton,
    onLinkResource,
  ]);

  const { id, type } = selectedResourceItem || {};

  useEffect(() => {
    if (selectedAnnotationId) {
      openPreview({
        item: id && type ? { id, type } : undefined,
        header,
        footer,
        content,
        onClose: () => setSelectedAnnotation(undefined),
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
    setSelectedAnnotation,
  ]);

  useEffect(() => {
    if (!selectedAnnotation) {
      hidePreview();
    }
  }, [selectedAnnotation, hidePreview]);

  return <></>;
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

export { AnnotationPreviewSidebar };
