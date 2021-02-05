import React, { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Title,
  Body,
  Overline,
  Collapse,
  Pagination,
} from '@cognite/cogs.js';
import {
  useSelectedAnnotations,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import { SpacedRow, Divider, InfoGrid, InfoCell } from 'components';
import { Modal, notification } from 'antd';
import {
  CogniteAnnotation,
  convertAnnotationsToEvents,
  hardDeleteAnnotations,
} from '@cognite/annotations';
import styled from 'styled-components';
import { useResourceSelector } from 'context/ResourceSelectorContext';
import {
  ResourceItemState,
  isModelRunning,
  ResourceType,
  ResourceItem,
  convertResourceType,
} from 'types';
import { useCreate } from 'hooks/sdk';
import { useQueryClient, useMutation } from 'react-query';
import { sleep } from 'utils';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteEvent, EventChange } from '@cognite/sdk';
import {
  useJob,
  useFindObjects,
  useFindSimilarJobId,
  useDeleteFindSimilarJob,
  useDeleteFindObjectsJob,
  useFindObjectsJobId,
} from 'hooks/objectDetection';
import { lightGrey } from 'utils/Colors';
import { ResourcePreviewSidebar } from 'containers';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useFlag } from '@cognite/react-feature-flags';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';
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
  const { data } = useJob(jobId, 'findsimilar');
  const running = !!jobId && isModelRunning(data?.status);

  const { mutate: findSimilarObjects } = useFindObjects();
  return (
    <Button
      variant="outline"
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
  onItemClicked?: (item: ResourceItem) => void;
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ProposedCogniteAnnotation[]>
  >;
};

const AnnotationPreviewSidebar = ({
  fileId,
  setPendingAnnotations,
  contextualization,
  onItemClicked,
}: Props) => {
  const cancelFindObjects = useDeleteFindObjectsJob();
  const cancelFindSimilar = useDeleteFindSimilarJob();
  const findObjectsJobId = useFindObjectsJobId(fileId);
  const findSimilarJobId = useFindSimilarJobId(fileId);
  const { data: findObjectsJob } = useJob(findObjectsJobId, 'findobjects');
  const { data: findSimilarJob } = useJob(findSimilarJobId, 'findsimilar');

  const client = useQueryClient();
  const [editing, setEditing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const {
    selectedAnnotations,
    setSelectedAnnotations,
  } = useSelectedAnnotations();

  const selectedAnnotation = selectedAnnotations[currentIndex];

  const extractFromCanvas = useExtractFromCanvas();

  const { openResourceSelector } = useResourceSelector();

  const selectedAnnotationId = selectedAnnotation
    ? selectedAnnotation.id
    : undefined;

  const isPendingAnnotation = typeof selectedAnnotationId === 'string';

  useEffect(() => {
    setEditing(false);
    window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
  }, [selectedAnnotationId]);

  useEffect(() => {
    setCurrentIndex(0);
    window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
  }, [selectedAnnotations.length]);

  let annotationPreview: string | undefined;
  if (selectedAnnotation && extractFromCanvas) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const isEditingMode = isPendingAnnotation || editing;

  const onSuccess = () => {
    const invalidate = () =>
      client.invalidateQueries(['cdf', 'events', 'list']);
    invalidate();
    // The sleep shouldn't be necessary, but await (POST /resource
    // {data}) && await(POST /resource/byids) might not return the
    // newly created item.
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(invalidate);

    setPendingAnnotations(pendingAnnotations =>
      pendingAnnotations.filter(el => el.id !== selectedAnnotation?.id)
    );
    notification.success({
      message: 'Annotation saved!',
    });
  };

  const { mutate: createEvent } = useCreate('events', {
    onSuccess,
  });
  const sdk = useSDK();
  const { mutate: updateEvent } = useMutation(
    (updates: EventChange) => sdk.events.update([updates]),
    {
      onSuccess,
    }
  );

  const { mutate: deleteAnnotations } = useMutation(
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
    setPendingAnnotations(pendingAnnotations => {
      if (pendingAnnotations.find(el => el.id === annotation.id)) {
        return pendingAnnotations.filter(el => el.id !== annotation.id);
      }
      return pendingAnnotations;
    });
    if (findObjectsJob?.annotations?.find(a => a.id === annotation.id)) {
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
          setSelectedAnnotations([]);
        },
        onCancel: () => {},
      });
    }
  };

  const onLinkResource = useCallback(() => {
    openResourceSelector({
      selectionMode: 'single',
      onSelect: item => {
        setSelectedAnnotations([
          {
            ...selectedAnnotation!,
            resourceType: item.type,
            resourceExternalId: item.externalId,
            resourceId: item.id,
          },
        ]);
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
    setSelectedAnnotations,
  ]);

  const Header = ({
    annotation,
  }: {
    annotation: CogniteAnnotation | ProposedCogniteAnnotation;
  }) => {
    const { metadata } = annotation;

    const isBPEnabled = useFlag('BP_FILE_EXPERIMENT', {
      fallback: false,
      forceRerender: true,
    });
    // TODO(CDFUX-000): BP Specific!
    const extraDetails: React.ReactNode[] = [];
    if (isBPEnabled) {
      if (metadata && metadata.BP_PROJECT) {
        extraDetails.push(
          <>
            <Overline level={2} style={{ marginTop: 8 }}>
              PROJECT
            </Overline>
            <Body level={2}>{metadata.BP_PROJECT}</Body>
          </>
        );
      }
      if (metadata && metadata.BP_SHOULD_NOTIFY) {
        extraDetails.push(
          <>
            <Overline level={2} style={{ marginTop: 8 }}>
              INFO
            </Overline>
            <Body level={2}>{metadata.BP_SHOULD_NOTIFY}</Body>
          </>
        );
      }
    }
    if (!isEditingMode) {
      return (
        <>
          <InfoGrid noBorders>
            <InfoCell noBorders>
              <Overline level={2}>LABEL</Overline>
              <Title level={5}>{annotation.label}</Title>
              <Overline level={2} style={{ marginTop: 8 }}>
                DESCRIPTION
              </Overline>
              <Body level={2}>{annotation.description || 'N/A'}</Body>
              {extraDetails}
            </InfoCell>
            {contextualization && (
              <InfoCell noBorders>
                <SpacedRow>
                  <Button
                    icon="Edit"
                    variant="outline"
                    onClick={() => {
                      setEditing(true);
                    }}
                  />
                  <Button
                    variant="outline"
                    type="danger"
                    icon="Delete"
                    onClick={() => onDeleteAnnotation(annotation)}
                  />
                  <FindSimilarButton
                    selectedAnnotation={selectedAnnotation}
                    fileId={fileId}
                  />
                </SpacedRow>
              </InfoCell>
            )}
            <Divider.Horizontal />
          </InfoGrid>
        </>
      );
    }
    return <></>;
  };

  const type = selectedAnnotation?.resourceType as ResourceType;
  const apiType = type ? convertResourceType(type) : 'assets';

  const { resourceExternalId, resourceId } = selectedAnnotation || {};
  const { data: item } = useCdfItem<{ id: number }>(
    apiType,
    resourceExternalId
      ? { externalId: resourceExternalId! }
      : { id: resourceId! },
    { enabled: !!type }
  );

  if (!selectedAnnotation) {
    return null;
  }
  return (
    <div style={{ width: 360, borderLeft: `2px solid ${lightGrey}` }}>
      {selectedAnnotations.length > 1 && (
        <Pagination
          total={selectedAnnotations.length}
          pageSize={1}
          showPrevNextJumpers={false}
          showQuickJumper={false}
          defaultCurrent={currentIndex}
          onChange={i => {
            setCurrentIndex(i - 1);
          }}
        />
      )}
      <ResourcePreviewSidebar
        item={
          item && {
            id: item.id,
            type,
          }
        }
        actions={
          onItemClicked &&
          item && [
            <Button
              icon="ArrowRight"
              iconPlacement="right"
              onClick={() =>
                onItemClicked({
                  id: item.id,
                  type,
                })
              }
            >
              View {type}
            </Button>,
          ]
        }
        header={<Header annotation={selectedAnnotation} />}
        footer={
          <ContextualizationData
            selectedAnnotation={selectedAnnotation}
            extractFromCanvas={extractFromCanvas}
          />
        }
        content={
          isEditingMode ? (
            <CreateAnnotationForm
              annotation={selectedAnnotation}
              updateAnnotation={annotation =>
                setSelectedAnnotations([annotation])
              }
              onLinkResource={onLinkResource}
              onDelete={() => {
                onDeleteAnnotation(selectedAnnotation);
              }}
              onSave={() => {
                if (selectedAnnotation) {
                  onSaveAnnotation(selectedAnnotation);
                }
                setEditing(false);
                if (isPendingAnnotation) {
                  setSelectedAnnotations([]);
                }
              }}
              previewImageSrc={annotationPreview}
              onCancel={
                isPendingAnnotation ? undefined : () => setEditing(false)
              }
            >
              <Divider.Horizontal />
              <SpacedRow>
                <FindSimilarButton fileId={fileId} />
              </SpacedRow>
            </CreateAnnotationForm>
          ) : undefined
        }
        onClose={() => setSelectedAnnotations([])}
      />
    </div>
  );
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
