import React, { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Title,
  Body,
  Overline,
  Collapse,
  Pagination,
  Menu,
  Icon,
} from '@cognite/cogs.js';
import {
  useSelectedAnnotations,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import { Divider, InfoGrid, InfoCell } from 'components';
import { Modal, notification, Dropdown } from 'antd';
import {
  AnnotationStatus,
  CogniteAnnotation,
  CogniteAnnotationPatch,
  convertAnnotationsToEvents,
  hardDeleteAnnotations,
  updateAnnotations,
} from '@cognite/annotations';
import styled from 'styled-components';
import { useResourceSelector } from 'context/ResourceSelectorContext';
import {
  ResourceItemState,
  ResourceItem,
  convertResourceType,
  ResourceType,
} from 'types';
import { useCreate } from 'hooks/sdk';
import { useQueryClient, useMutation } from 'react-query';
import { sleep } from 'utils';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteEvent, EventChange, FileInfo } from '@cognite/sdk';
import { lightGrey } from 'utils/Colors';
import { ResourcePreviewSidebar } from 'containers';
import { useCdfItem, useUserInfo } from '@cognite/sdk-react-query-hooks';

import { useFlag } from '@cognite/react-feature-flags';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';
import InteractiveIcon from 'components/InteractiveIcon';
import { useReviewFile } from '../hooks';
import { ContextualizationData } from './ContextualizationModule';
import { CreateAnnotationForm } from './CreateAnnotationForm/CreateAnnotationForm';
import ReviewTagBar from './ReviewTagBar';
import FileReview from './FileReview';
import DiagramReviewStatus from './DiagramStatus';

type Props = {
  file?: FileInfo;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ProposedCogniteAnnotation[]>
  >;
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
};

const AnnotationPreviewSidebar = ({
  file,
  setPendingAnnotations,
  contextualization,
  onItemClicked,
  annotations,
}: Props) => {
  const client = useQueryClient();
  const { data: userData } = useUserInfo();
  const { email = 'UNKNOWN' } = userData || {};
  const [editing, setEditing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const { isLoading: isApprovingFile, onApproveFile } = useReviewFile(file?.id);
  const {
    selectedAnnotations = [],
    setSelectedAnnotations,
  } = useSelectedAnnotations();

  const selectedAnnotation = selectedAnnotations?.length
    ? selectedAnnotations[currentIndex]
    : undefined;

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
  }, [selectedAnnotations?.length]);

  let annotationPreview: string | undefined;
  if (selectedAnnotation && extractFromCanvas) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation?.box;
    annotationPreview = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const isEditingMode = isPendingAnnotation || editing;

  const onSuccess = () => {
    const invalidate = () => {
      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'events',
        'list',
      ]);
    };
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
    (deletedAnnotations: CogniteAnnotation[]) =>
      hardDeleteAnnotations(sdk, deletedAnnotations),
    {
      onSuccess,
    }
  );

  const { mutate: updateAnnotationStatus } = useMutation(
    (update: { annotation: CogniteAnnotation; status: AnnotationStatus }) =>
      updateAnnotations(sdk, [
        {
          id: update.annotation.id,
          annotation: update.annotation,
          update: {
            status: {
              set: update.status,
            },
            checkedBy: {
              set: email,
            },
          },
        },
      ]),
    {
      onSuccess,
    }
  );

  const { mutate: approveAnnotations } = useMutation(
    (update: CogniteAnnotationPatch[]) => updateAnnotations(sdk, update),
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

  const onUpdateAnnotationStatus = (
    annotation: CogniteAnnotation,
    status: AnnotationStatus
  ) => {
    const isApprove = status === 'verified';
    Modal.confirm({
      okText: isApprove ? 'Approve tag' : 'Reject tag',
      title: 'Are you sure?',
      content: (
        <span>
          Are you sure you want to {isApprove ? 'approve' : 'reject'} this tag
          for this file? Changes will be saved to CDF.
        </span>
      ),
      onOk: async () => {
        updateAnnotationStatus({ annotation, status });
        setSelectedAnnotations([]);
      },
      onCancel: () => {},
      okButtonProps: {
        loading: isApprovingFile,
      },
    });
  };

  const onApproveAllAnnotations = () => {
    Modal.confirm({
      okText: 'Approve tags',
      title: 'Are you sure?',
      content: (
        <span>
          Are you sure you want to approve all tags for this file? Changes will
          be saved to CDF.
        </span>
      ),
      onOk: async () => {
        const unhandedAnnotations = annotations.filter(
          a => a.status === 'unhandled'
        ) as Array<CogniteAnnotation>;
        const updatePatch = unhandedAnnotations.map(annotation => ({
          id: Number(annotation.id),
          annotation,
          update: {
            status: {
              set: 'verified' as AnnotationStatus,
            },
            checkedBy: {
              set: email,
            },
          },
        }));
        approveAnnotations(updatePatch);
        await onApproveFile();
        setSelectedAnnotations([]);
      },
      onCancel: () => {},
    });
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
    if (Number.isFinite(annotation.id)) {
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
    onClose,
  }: {
    annotation: CogniteAnnotation | ProposedCogniteAnnotation;
    onClose: () => void;
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

    const menuOptions = () => (
      <Menu>
        <Menu.Item onClick={() => setEditing(true)}> Edit</Menu.Item>
        <Menu.Item onClick={() => onDeleteAnnotation(annotation)}>
          Delete
        </Menu.Item>
      </Menu>
    );

    if (!isEditingMode) {
      return (
        <InfoGrid>
          {selectedAnnotations?.length > 1 && (
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

          <InfoCell>
            {selectedAnnotations?.length > 1 ? (
              <InfoCell>
                <Body level={3}>
                  {currentIndex + 1} of {selectedAnnotations.length}
                </Body>
              </InfoCell>
            ) : (
              ''
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Title level={5}>{annotation.label} </Title>
              <div>
                <Dropdown overlay={menuOptions}>
                  <Icon type="MoreOverflowEllipsisVertical" />
                </Dropdown>
                <Button icon="Close" variant="ghost" onClick={onClose} />
              </div>
            </div>
            <Body level={2}>{annotation.description || 'N/A'}</Body>
            {extraDetails}
          </InfoCell>
          {contextualization && (
            <InfoCell noBorders>
              <ReviewTagBar
                annotation={annotation}
                onApprove={curAnnotation =>
                  onUpdateAnnotationStatus(
                    curAnnotation as CogniteAnnotation,
                    'verified'
                  )
                }
                onReject={curAnnotation =>
                  onUpdateAnnotationStatus(
                    curAnnotation as CogniteAnnotation,
                    'deleted'
                  )
                }
              />
            </InfoCell>
          )}
          <Divider.Horizontal />
        </InfoGrid>
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

  if (!selectedAnnotation || !selectedAnnotations?.length) {
    return (
      <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
        <ResourcePreviewSidebar
          hideTitle
          closable={false}
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
          header={
            <TitleWrapper>
              <InteractiveIcon />
              <Title level={4}>{file?.name} </Title>
              <DiagramReviewStatus file={file} />
              <FileReview
                annotations={annotations}
                onApprove={onApproveAllAnnotations}
              />
            </TitleWrapper>
          }
          onClose={() => setSelectedAnnotations([])}
        />
      </div>
    );
  }
  return (
    <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
      <ResourcePreviewSidebar
        hideTitle
        closable={false}
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
        header={
          <Header
            annotation={selectedAnnotation}
            onClose={() => setSelectedAnnotations([])}
          />
        }
        footer={
          <>
            <ContextualizationData
              selectedAnnotation={selectedAnnotation}
              extractFromCanvas={extractFromCanvas}
            />
          </>
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
            />
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

const TitleWrapper = styled.div`
  padding: 20px 10px;
`;
export { AnnotationPreviewSidebar };
