import React, { useContext, useEffect, useCallback, useState } from 'react';
import {
  Button,
  Title,
  Body,
  Menu,
  toast,
  Modal,
  Detail,
  Flex,
} from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { Divider, InfoCell } from 'components';
import { Dropdown, Pagination, Spin, Breadcrumb } from 'antd';
import {
  AnnotationStatus,
  CogniteAnnotation,
  CogniteAnnotationPatch,
  convertAnnotationsToEvents,
  hardDeleteAnnotations,
  updateAnnotations,
  linkFileToAssetIds,
  AnnotationResourceType,
} from '@cognite/annotations';
import styled from 'styled-components';
import { useResourceSelectorUFV } from 'context/ResourceSelectorContextUFV';
import {
  ResourceItemState,
  ResourceItem,
  convertResourceType,
  ResourceType,
} from 'types';
import { useCreate } from 'hooks/sdk';
import { useQueryClient, useMutation } from 'react-query';
import { sleep, SIDEBAR_RESIZE_EVENT } from 'utils';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteEvent, EventChange, FileInfo } from '@cognite/sdk';
import { ResourcePreviewSidebarUFV } from 'containers';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { AppContext } from 'context/AppContext';
import capitalize from 'lodash/capitalize';
import { useDisclosure } from 'hooks';

import { ContextualizationData } from '../ContextualizationModule';
import { CreateAnnotationForm } from '../CreateAnnotationForm/CreateAnnotationForm';
import ReviewTagBar from '../ReviewTagBar';
import FilePreviewSidebar from './FilePreviewSidebar';
import { CommonLegacyCogniteAnnotation } from './types';

type Props = {
  file?: FileInfo;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ProposedCogniteAnnotation[]>
  >;
  setIsAnnotationsShown: (isAnnotationShown: boolean) => void;
  isAnnotationsShown: boolean;
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  fileIcon?: React.ReactNode;
  reset: () => void;
  selectedAnnotations: CommonLegacyCogniteAnnotation[];
  setSelectedAnnotations: (
    annotations: CommonLegacyCogniteAnnotation[]
  ) => void;
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
  setIsAnnotationsShown,
  isAnnotationsShown,
  setPendingAnnotations,
  contextualization,
  onItemClicked,
  annotations,
  fileIcon,
  reset,
  selectedAnnotations,
  setSelectedAnnotations,
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
  const [currentIndex, setCurrentIndex] = useState<number>(3); // why 3?
  const [viewingAnnotations, setViewingAnnotations] = useState<
    'assets' | 'files' | undefined
  >();

  const selectedAnnotation = selectedAnnotations?.length
    ? selectedAnnotations[currentIndex || 0]
    : undefined;

  const { openResourceSelector } = useResourceSelectorUFV();

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
          if (
            annotation.resourceType === 'asset' &&
            annotation?.resourceId &&
            file
          ) {
            await sdk.files.update([
              {
                id: file.id,
                update: {
                  assetIds: {
                    remove: [annotation.resourceId],
                  },
                },
              },
            ]);
          }
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
            resourceType: item.type as AnnotationResourceType, // added to solve type error!
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
    });
  }, [openResourceSelector, selectedAnnotation, setSelectedAnnotations]);

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
        <>
          <HeaderContainer>
            <BreadcrumbContainer>
              <Button
                icon="ArrowLeft"
                onClick={() => {
                  reset?.();
                  setViewingAnnotations(
                    apiType === 'assets' || apiType === 'files'
                      ? apiType
                      : undefined
                  );
                  onClose();
                }}
                type="ghost"
              />
              <Breadcrumb>
                <Breadcrumb.Item>{capitalize(type)}</Breadcrumb.Item>
                <Breadcrumb.Item>{annotation.label || 'N/A'}</Breadcrumb.Item>
              </Breadcrumb>
            </BreadcrumbContainer>
            <Flex direction="row">
              <Dropdown overlay={menuOptions}>
                <Button icon="EllipsisVertical" type="ghost" />
              </Dropdown>
              <Button
                icon="Close"
                type="ghost"
                onClick={() => {
                  reset?.();
                  onClose();
                }}
              />
            </Flex>
          </HeaderContainer>

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
            <Flex justifyContent="space-between">
              <Title level={5}>{annotation.label} </Title>
            </Flex>
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
        </>
      );
    }
    return <></>;
  };

  if (selectedAnnotation) {
    return (
      <>
        <Modal visible={isOpen} {...annotationModalState}>
          {annotationModalState.content}
        </Modal>
        <ResourcePreviewSidebarUFV
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
              onClose={() => {
                setSelectedAnnotations([]);
                reset?.();
              }}
            />
          }
          footer={
            <>
              <ContextualizationData selectedAnnotation={selectedAnnotation} />
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
                onCancel={
                  isPendingAnnotation ? undefined : () => setEditing(false)
                }
              />
            ) : undefined
          }
          onClose={() => setSelectedAnnotations([])}
        />
      </>
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
      setIsAnnotationsShown={setIsAnnotationsShown}
      isAnnotationsShown={isAnnotationsShown}
      reset={reset}
      setSelectedAnnotations={setSelectedAnnotations}
    />
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  justify-content: space-between;
  width: 100%;
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 1;

  & > nav.ant-breadcrumb {
    margin-top: 8px;
  }
`;

export { AnnotationPreviewSidebar };
