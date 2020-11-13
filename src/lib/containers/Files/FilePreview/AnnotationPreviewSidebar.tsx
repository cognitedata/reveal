import React, { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Icon,
  Title,
  Body,
  Overline,
  Collapse,
} from '@cognite/cogs.js';
import {
  useSelectedAnnotation,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import { SpacedRow, Divider, InfoGrid, InfoCell } from 'lib/components';
import { Modal, notification } from 'antd';
import {
  CogniteAnnotation,
  convertAnnotationsToEvents,
  hardDeleteAnnotations,
} from '@cognite/annotations';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import styled from 'styled-components';
import { useResourceSelector } from 'lib/context/ResourceSelectorContext';
import { ResourceItemState, isModelRunning } from 'lib/types';
import { useCreate } from 'lib/hooks/sdk';
import { useQueryCache, useMutation } from 'react-query';
import { sleep } from 'lib/utils';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteEvent, EventChange } from '@cognite/sdk';
import {
  useJob,
  useFindObjects,
  useFindSimilarJobId,
  useDeleteFindSimilarJob,
  useDeleteFindObjectsJob,
  useFindObjectsJobId,
} from 'lib/hooks/objectDetection';
import { lightGrey } from 'lib/utils/Colors';
import { ContextualizationData } from './ContextualizationModule';
import { CreateAnnotationForm } from './CreateAnnotationForm/CreateAnnotationForm';

const FindSimilarButton = ({
  fileId,
  selectedAnnotation,
}: {
  fileId: number;
  selectedAnnotation?: CogniteAnnotation | ProposedCogniteAnnotation;
}) => {
  const jobId = useFindSimilarJobId(fileId);
  const { data } = useJob(jobId);
  const running = !!jobId && isModelRunning(data?.status);

  const [findSimilarObjects] = useFindObjects();
  return (
    <Button
      loading={running}
      icon="Search"
      onClick={() => {
        if (
          (!jobId || !running) &&
          selectedAnnotation &&
          selectedAnnotation.box
        ) {
          findSimilarObjects({ fileId, boundingBox: selectedAnnotation.box });
        }
      }}
    >
      Find similar
    </Button>
  );
};

type Props = {
  fileId: number;
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
  const cancelFindObjects = useDeleteFindObjectsJob();
  const cancelFindSimilar = useDeleteFindSimilarJob();
  const findObjectsJobId = useFindObjectsJobId(fileId);
  const findSimilarJobId = useFindSimilarJobId(fileId);
  const { data: findObjectsJob } = useJob(findObjectsJobId);
  const { data: findSimilarJob } = useJob(findSimilarJobId);

  const queryCache = useQueryCache();
  const [editing, setEditing] = useState<boolean>(false);

  const { selectedAnnotation, setSelectedAnnotation } = useSelectedAnnotation();

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

  let annotationPreview: string | undefined;
  if (selectedAnnotation && extractFromCanvas) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const isEditingMode = isPendingAnnotation || editing;

  const onSuccess = () => {
    const invalidate = () =>
      queryCache.invalidateQueries(['cdf', 'events', 'list']);
    invalidate();
    // The sleep shouldn't be necessary, but await (POST /resource
    // {data}) && await(POST /resource/byids) might not return the
    // newly created item.
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(invalidate);

    hidePreview();
    setPendingAnnotations(
      pendingAnnotations.filter(el => el.id !== selectedAnnotation?.id)
    );
    notification.success({
      message: 'Annotation saved!',
    });
  };

  const [createEvent] = useCreate('events', {
    onSuccess,
  });
  const sdk = useSDK();
  const [updateEvent] = useMutation(
    (updates: EventChange) => sdk.events.update([updates]),
    {
      onSuccess,
    }
  );

  const [deleteAnnotations] = useMutation(
    (annotations: CogniteAnnotation[]) =>
      hardDeleteAnnotations(sdk, annotations),
    {
      onSuccess,
    }
  );

  const onSaveAnnotation = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => {
    if (typeof annotation.id === 'string') {
      const item = convertAnnotationsToEvents([annotation])[0];
      item.id = undefined;
      createEvent(item);
    } else {
      const event = convertAnnotationsToEvents([annotation])[0] as CogniteEvent;
      const update: EventChange = {
        id: event.id,
        update: {},
      };
      if (event.description) {
        update.update.description = { set: event.description };
      }
      if (event.metadata) {
        update.update.metadata = {
          set: event.metadata,
        };
      }

      if (Object.keys(update.update).length > 0) {
        updateEvent(update);
      }
    }
  };

  const onDeleteAnnotation = (
    annotation: CogniteAnnotation | ProposedCogniteAnnotation
  ) => {
    if (pendingAnnotations.find(el => el.id === annotation.id)) {
      setPendingAnnotations(
        pendingAnnotations.filter(el => el.id !== annotation.id)
      );
    } else if (findObjectsJob?.annotations?.find(a => a.id === annotation.id)) {
      cancelFindObjects(fileId);
    } else if (findSimilarJob?.annotations?.find(a => a.id === annotation.id)) {
      cancelFindSimilar(fileId);
    } else if (Number.isFinite(annotation.id)) {
      Modal.confirm({
        title: 'Are you sure?',
        content: (
          <span>
            This annotations will be deleted. However, you can always
            re-contextualize the file.
          </span>
        ),
        onOk: async () => {
          deleteAnnotations([annotation as CogniteAnnotation]);
          setSelectedAnnotation(undefined);
        },
        onCancel: () => {},
      });
    }
  };

  const onLinkResource = useCallback(() => {
    openResourceSelector({
      selectionMode: 'single',
      onSelect: item => {
        setSelectedAnnotation({
          ...selectedAnnotation!,
          resourceType: item.type,
          resourceExternalId: item.externalId,
          resourceId: item.id,
        });
      },
      initialItemState: selectedAnnotation
        ? [
            {
              type: selectedAnnotation.resourceType,
              id: selectedAnnotation.resourceId,
              state: 'selected',
            } as ResourceItemState,
          ]
        : undefined,
      header: annotationPreview && (
        <Collapse defaultActiveKey={[]}>
          <Collapse.Panel key="preview" header="Annotation Preview">
            <PreviewImage src={annotationPreview} alt="preview" />
          </Collapse.Panel>
        </Collapse>
      ),
    });
  }, [
    openResourceSelector,
    selectedAnnotation,
    annotationPreview,
    setSelectedAnnotation,
  ]);

  const Header = ({
    annotation,
  }: {
    annotation: CogniteAnnotation | ProposedCogniteAnnotation;
  }) => (
    <InfoGrid noBorders>
      <InfoCell noBorders>
        <Overline level={2}>LABEL</Overline>
        <Title level={5}>{annotation.label}</Title>
        <Overline level={2} style={{ marginTop: 8 }}>
          DESCRIPTION
        </Overline>
        <Body level={2}>{annotation.description || 'N/A'}</Body>
      </InfoCell>
      {contextualization && (
        <InfoCell noBorders>
          <SpacedRow>
            <Button onClick={() => onDeleteAnnotation(annotation)}>
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
            <FindSimilarButton
              selectedAnnotation={selectedAnnotation}
              fileId={fileId}
            />
          </SpacedRow>
        </InfoCell>
      )}
      <Divider.Horizontal />
    </InfoGrid>
  );

  const Content = ({
    annotation,
  }: {
    annotation: ProposedCogniteAnnotation | CogniteAnnotation;
  }) => (
    <CreateAnnotationForm
      annotation={annotation}
      updateAnnotation={setSelectedAnnotation}
      onLinkResource={onLinkResource}
      onDelete={() => {
        onDeleteAnnotation(annotation);
      }}
      onSave={() => {
        if (annotation) {
          onSaveAnnotation(annotation);
        }
        setEditing(false);
        if (isPendingAnnotation) {
          setSelectedAnnotation(undefined);
        }
      }}
      previewImageSrc={annotationPreview}
      onCancel={isPendingAnnotation ? undefined : () => setEditing(false)}
    >
      <Divider.Horizontal />
      <SpacedRow>
        <FindSimilarButton fileId={fileId} />
      </SpacedRow>
    </CreateAnnotationForm>
  );

  const type = selectedAnnotation?.resourceType;
  const id =
    selectedAnnotation?.resourceExternalId || selectedAnnotation?.resourceId;

  useEffect(() => {
    if (selectedAnnotation) {
      openPreview({
        // @ts-ignore
        item: id && type ? { id, type } : undefined,
        header: <Header annotation={selectedAnnotation} />,
        footer: (
          <ContextualizationData
            selectedAnnotation={selectedAnnotation}
            extractFromCanvas={extractFromCanvas}
          />
        ),
        content: isEditingMode ? (
          <Content annotation={selectedAnnotation} />
        ) : undefined,
        onClose: () => setSelectedAnnotation(undefined),
      });
    }
  }, [
    extractFromCanvas,
    id,
    isEditingMode,
    openPreview,
    selectedAnnotation,
    setSelectedAnnotation,
    type,
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
  background: ${lightGrey};
  width: auto;
  object-fit: contain;
  display: block;
  align-self: flex-start;
  margin-bottom: 16px;
`;

export { AnnotationPreviewSidebar };
