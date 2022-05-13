import React, { useContext, useEffect, useCallback, useState } from 'react';
import {
  Button,
  Title,
  Body,
  Collapse,
  Menu,
  Icon,
  toast,
  Modal,
  Detail,
} from '@cognite/cogs.js';
import {
  useSelectedAnnotations,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import { Divider, InfoGrid, InfoCell } from 'components';
import { Dropdown, Pagination, Spin } from 'antd';
import {
  AnnotationStatus,
  CogniteAnnotation,
  CogniteAnnotationPatch,
  convertAnnotationsToEvents,
  hardDeleteAnnotations,
  updateAnnotations,
  linkFileToAssetIds,
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
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { AppContext } from 'context/AppContext';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import capitalize from 'lodash/capitalize';
import { useDisclosure } from 'hooks';

import { ContextualizationData } from './ContextualizationModule';
import { CreateAnnotationForm } from './CreateAnnotationForm/CreateAnnotationForm';
import ReviewTagBar from './ReviewTagBar';
import FilePreviewSidebar from './FilePreviewSidebar';

type Props = {
  file?: FileInfo;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ProposedCogniteAnnotation[]>
  >;
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  fileIcon?: React.ReactNode;
};

interface AnnotationModalStateProps {
  okText?: string;
  title?: string;
  content: React.ReactElement;
  onOk?: () => void;
  onCancel?: () => void;
}
const AnnotationPreviewSidebar = ({
  file,
  setPendingAnnotations,
  contextualization,
  onItemClicked,
  annotations,
  fileIcon,
}: Props) => {
  const client = useQueryClient();
  const sdk = useSDK();
  const context = useContext(AppContext);
  const email = context?.userInfo?.email || 'UNKNOWN';

  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  const [annotationModalState, setAnnotationModalState] =
    useState<AnnotationModalStateProps>({
      okText: '',
      content: <> </>,
    });

  const [editing, setEditing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(3);
  const [viewingAnnotations, setViewingAnnotations] = useState<
    'assets' | 'files' | undefined
  >();

  const { selectedAnnotations = [], setSelectedAnnotations } =
    useSelectedAnnotations();

  const selectedAnnotation = selectedAnnotations?.length
    ? selectedAnnotations[currentIndex || 0]
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

  const onSuccess = (action: string) => {
    const invalidate = () => {
      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'events',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'labels',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'files',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'files',
        'get',
        'byId',
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
    toast.success(`Tag ${action} successfully`);
  };

  const { mutate: createEvent } = useCreate('events', {
    onSuccess: () => onSuccess('created'),
  });

  const { mutate: updateEvent } = useMutation(
    (updates: EventChange) => sdk.events.update([updates]),
    {
      onSuccess: () => onSuccess('saved'),
    }
  );

  const { mutate: deleteAnnotations } = useMutation(
    (deletedAnnotations: CogniteAnnotation[]) =>
      hardDeleteAnnotations(sdk, deletedAnnotations),
    {
      onSuccess: () => onSuccess('deleted'),
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
      onSuccess: () => onSuccess('updated'),
    }
  );

  const { mutate: approveAnnotations } = useMutation(
    (update: CogniteAnnotationPatch[]) => updateAnnotations(sdk, update),
    {
      onSuccess: () => onSuccess('approved'),
    }
  );

  const onSaveAnnotation = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation,
    savedItem: any
  ) => {
    if (typeof annotation.id === 'string') {
      if (savedItem.name && !annotation.label) {
        annotation.label = savedItem.name;
      }
      if (savedItem.description && !annotation.description) {
        annotation.description = savedItem.description;
      }
      const event = convertAnnotationsToEvents([annotation])[0];
      event.id = undefined;
      createEvent(event);
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
    const okText = isApprove ? 'Approve tag' : 'Reject tag';
    const content = isApprove ? (
      <Body level={2} strong>
        Approve this tag?
      </Body>
    ) : (
      <>
        <Body level={2} strong>
          Reject this tag?
        </Body>
        <Body level={2}>The tag will be removed from the diagram.</Body>
      </>
    );
    setAnnotationModalState({
      okText,
      content,
      onOk: async () => {
        updateAnnotationStatus({ annotation, status });
        await linkFileToAssetIds(sdk, [annotation]);
        setSelectedAnnotations([]);
        onModalClose();
      },
      onCancel: onModalClose,
    });
    onOpen();
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
      setAnnotationModalState({
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
        onCancel: onModalClose,
      });
      onOpen();
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

  const isLinked =
    !!selectedAnnotation?.resourceId ||
    !!selectedAnnotation?.resourceExternalId;
  const type = isLinked
    ? (selectedAnnotation?.resourceType as ResourceType)
    : undefined;
  const apiType = type ? convertResourceType(type) : 'assets';
  const { resourceExternalId, resourceId } = selectedAnnotation || {};

  const { data: item, isLoading } = useCdfItem<{ id: number }>(
    apiType,
    resourceExternalId
      ? { externalId: resourceExternalId! }
      : { id: resourceId! },
    { enabled: !!type }
  );

  const Header = ({
    annotation,
    onClose,
  }: {
    annotation: CogniteAnnotation | ProposedCogniteAnnotation;
    onClose: () => void;
  }) => {
    const menuOptions = () => (
      <Menu>
        <Menu.Item onClick={() => setEditing(true)}> Edit</Menu.Item>
        <Menu.Item onClick={() => onDeleteAnnotation(annotation)}>
          Delete
        </Menu.Item>
      </Menu>
    );
    if (isLoading) {
      return <Spin />;
    }
    if (!isEditingMode) {
      return (
        <InfoGrid>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '20px',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                icon="ArrowLeft"
                onClick={() => {
                  setViewingAnnotations(
                    apiType === 'assets' || apiType === 'files'
                      ? apiType
                      : undefined
                  );
                  onClose();
                }}
                style={{ color: 'black', marginTop: '-7px' }}
                type="ghost"
              />
              <BreadcrumbItem> {capitalize(type)}</BreadcrumbItem>
              <BreadcrumbItem separator={<span />}>
                {annotation.label ?? 'N/A'}
              </BreadcrumbItem>
            </div>
            <div>
              <div>
                <Dropdown overlay={menuOptions}>
                  <Icon type="EllipsisVertical" />
                </Dropdown>
                <Button icon="Close" type="ghost" onClick={onClose} />
              </div>
            </div>
          </div>

          {selectedAnnotations?.length > 1 && (
            <Pagination
              size="small"
              total={selectedAnnotations.length}
              pageSize={1}
              showQuickJumper={false}
              current={currentIndex + 1 || 1}
              onChange={i => {
                setCurrentIndex(i - 1);
              }}
              style={{ marginTop: '10px' }}
            />
          )}

          <InfoCell>
            {selectedAnnotations?.length > 1 ? (
              <Detail>
                {currentIndex + 1} of {selectedAnnotations.length}
              </Detail>
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
            </div>
            <Body level={2}>
              {annotation.description ||
                (item as { description?: string })?.description ||
                'N/A'}
            </Body>
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

  if (selectedAnnotation) {
    return (
      <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
        <Modal visible={isOpen} {...annotationModalState}>
          {annotationModalState.content}
        </Modal>
        <ResourcePreviewSidebar
          hideTitle
          closable={false}
          item={
            item &&
            type && {
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
                  type &&
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
                onSave={(savedItem: any) => {
                  if (selectedAnnotation) {
                    onSaveAnnotation(selectedAnnotation, savedItem);
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
  }
  return (
    <FilePreviewSidebar
      annotations={annotations}
      file={file}
      fileIcon={fileIcon}
      approveAnnotations={approveAnnotations}
      viewingAnnotations={viewingAnnotations}
      setViewingAnnotations={setViewingAnnotations}
    />
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
