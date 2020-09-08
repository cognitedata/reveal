/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as assetSelector } from 'modules/assets';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as sequenceSelector } from 'modules/sequences';
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
  ButtonRow,
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
import { findSimilarObjects } from 'modules/fileContextualization/similarObjectJobs';
import { useResourceItemFromAnnotation } from 'utils/AnnotationUtils';
import {
  ResourceSelectorProvider,
  useResourceSelector,
} from 'context/ResourceSelectorContext';
import { ResourceItemState } from 'context/ResourceSelectionContext';
import {
  findingObjectStatus,
  ContextualizationData,
} from './ContextualizationModule';

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
  const dispatch = useDispatch();
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  const file = getFile(fileId);

  const [editing, setEditing] = useState<boolean>(false);

  const extractFromCanvas = useExtractFromCanvas();

  const { openPreview, hidePreview } = useResourcePreview();
  const { openResourceSelector, hideResourceSelector } = useResourceSelector();

  const selectedAnnotationId = selectedAnnotation
    ? selectedAnnotation.id
    : undefined;

  const isPendingAnnotation = typeof selectedAnnotationId === 'string';

  useEffect(() => {
    setEditing(false);
    hideResourceSelector();
  }, [selectedAnnotationId, hideResourceSelector]);

  const selectedResourceItem = useResourceItemFromAnnotation(
    selectedAnnotation
  );

  const isFindingSimilarObjects = useSelector(findingObjectStatus)(fileId);

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
        let itemType: CogniteAnnotation['resourceType'];
        let externalId: string | undefined;
        switch (item.type) {
          case 'asset': {
            itemType = 'asset';
            const asset = getAsset(item.id);
            externalId = asset?.externalId;
            break;
          }
          case 'file': {
            itemType = 'file';
            const previewFile = getFile(item.id);
            externalId = previewFile?.externalId;
            break;
          }
          case 'sequence': {
            itemType = 'sequence';
            const sequence = getSequence(item.id);
            externalId = sequence?.externalId;
            break;
          }
          case 'timeSeries': {
            itemType = 'timeSeries';
            const timeseries = getTimeseries(item.id);
            externalId = timeseries?.externalId;
            break;
          }
        }
        setSelectedAnnotation({
          ...selectedAnnotation!,
          resourceType: itemType,
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
                {similarButton}
              </ButtonRow>
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
          <ButtonRow>{similarButton}</ButtonRow>
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

  return null;
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

const WrappedAnnotationPreviewSidebar = (props: Props) => {
  return (
    <ResourceSelectorProvider>
      <AnnotationPreviewSidebar {...props} />
    </ResourceSelectorProvider>
  );
};

export { WrappedAnnotationPreviewSidebar as AnnotationPreviewSidebar };
