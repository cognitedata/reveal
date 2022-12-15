import React, { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Title,
  Body,
  Menu,
  toast,
  Detail,
  Flex,
} from '@cognite/cogs.js';
import { Divider, InfoCell } from 'components';
import { Dropdown, Pagination, Spin, Breadcrumb, Modal } from 'antd';
import styled from 'styled-components';
import { useResourceSelectorUFV } from 'context/ResourceSelectorContextUFV';
import { ResourceItem, convertResourceType } from 'types';
import { useQueryClient } from 'react-query';
import { sleep, SIDEBAR_RESIZE_EVENT } from 'utils';
import { FileInfo, AnnotationStatus } from '@cognite/sdk';
import { ResourcePreviewSidebarUFV } from 'containers';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import capitalize from 'lodash/capitalize';
import { useDisclosure } from 'hooks';
import { ContextualizationData } from './ContextualizationModule';
import { CreateAnnotationForm } from './CreateAnnotationForm/CreateAnnotationForm';
import {
  useCreateAnnotation,
  useDeleteAnnotation,
  useUpdateAnnotations,
} from 'domain/annotations';
import {
  getExtendedAnnotationDescription,
  getExtendedAnnotationLabel,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceItemStateFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  isExtendedLocalAnnotation,
  setExtendedAnnotationResource,
  setExtendedAnnotationStatus,
} from './migration/utils';
import ReviewTagBar from './ReviewTagBar';
import FilePreviewSidebar from './FilePreviewSidebar';
import { ExtendedAnnotation } from './types';

type Props = {
  file?: FileInfo;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ExtendedAnnotation[]>
  >;
  setIsAnnotationsShown: (isAnnotationShown: boolean) => void;
  isAnnotationsShown: boolean;
  annotations: ExtendedAnnotation[];
  fileIcon?: React.ReactNode;
  reset: () => void;
  selectedAnnotations: ExtendedAnnotation[];
  setSelectedAnnotations: (annotations: ExtendedAnnotation[]) => void;
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

  const isPendingAnnotation =
    selectedAnnotation !== undefined &&
    isExtendedLocalAnnotation(selectedAnnotation);

  useEffect(() => {
    setEditing(false);
    window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
  }, [selectedAnnotation?.id]);

  useEffect(() => {
    setCurrentIndex(0);
    window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT));
  }, [selectedAnnotations?.length]);

  const isEditingMode = isPendingAnnotation || editing;

  const onSuccess = (action: string) => {
    const invalidate = () => {
      if (file !== undefined) {
        client.invalidateQueries(`annotations-file-${file.id}`);
      }

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

  const createAnnotation = useCreateAnnotation({
    onSuccess: () => onSuccess('created'),
  });

  const updateAnnotations = useUpdateAnnotations({
    onSuccess: () => onSuccess('saved'),
  });

  const approveAnnotations = useUpdateAnnotations({
    onSuccess: () => onSuccess('approved'),
  });

  const deleteAnnotation = useDeleteAnnotation({
    onSuccess: () => onSuccess('deleted'),
  });

  const onSaveAnnotation = (annotation: ExtendedAnnotation) => {
    if (isExtendedLocalAnnotation(annotation)) {
      return createAnnotation(annotation);
    }

    return updateAnnotations([annotation]);
  };

  const handleSave = () => {
    if (selectedAnnotation) {
      onSaveAnnotation(selectedAnnotation);
    }
    setEditing(false);
    if (isPendingAnnotation) {
      setSelectedAnnotations([]);
    }
  };

  const onUpdateAnnotationStatus = (
    annotation: ExtendedAnnotation,
    status: AnnotationStatus
  ) => {
    const isApprove = status === 'approved';
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
        updateAnnotations([setExtendedAnnotationStatus(annotation, status)]);
        setSelectedAnnotations([]);
        onModalClose();
      },
      onCancel: onModalClose,
    });
    onOpen();
  };

  const onDeleteAnnotation = (annotation: ExtendedAnnotation) => {
    setPendingAnnotations(pendingAnnotations => {
      if (pendingAnnotations.find(el => el.id === annotation.id)) {
        return pendingAnnotations.filter(el => el.id !== annotation.id);
      }
      return pendingAnnotations;
    });
    if (isExtendedLocalAnnotation(annotation)) {
      // If this is a local annotation, just deselect it
      setSelectedAnnotations(
        selectedAnnotations.filter(el => el.id !== annotation.id)
      );
    } else {
      // Otherwise, the annotation may be deleted using the SDK
      setAnnotationModalState({
        title: 'Are you sure?',
        content: (
          <span>
            These annotations will be deleted. However, you can always
            re-contextualize the file.
          </span>
        ),
        onOk: async () => {
          deleteAnnotation(annotation);
          setPendingAnnotations([]);
          setSelectedAnnotations([]);
          onModalClose();
        },
        onCancel: onModalClose,
      });
      onOpen();
    }
  };

  const onLinkResource = useCallback(() => {
    const resourceItemState =
      selectedAnnotation !== undefined &&
      getResourceItemStateFromExtendedAnnotation(selectedAnnotation, 'selected')
        ? getResourceItemStateFromExtendedAnnotation(
            selectedAnnotation,
            'selected'
          )
        : undefined;

    openResourceSelector({
      resourceTypes: ['asset', 'file'],
      selectionMode: 'single',
      onSelect: item => {
        if (selectedAnnotation === undefined) {
          return;
        }

        setSelectedAnnotations([
          setExtendedAnnotationResource(selectedAnnotation, item),
        ]);
      },
      initialItemState:
        resourceItemState !== undefined ? [resourceItemState] : undefined,
    });
  }, [openResourceSelector, selectedAnnotation, setSelectedAnnotations]);

  const isLinked =
    selectedAnnotation !== undefined &&
    (getResourceIdFromExtendedAnnotation(selectedAnnotation) !== undefined ||
      getResourceExternalIdFromExtendedAnnotation(selectedAnnotation) !==
        undefined);
  const type = isLinked
    ? getResourceTypeFromExtendedAnnotation(selectedAnnotation)
    : undefined;
  const apiType = type ? convertResourceType(type) : 'assets';
  const resourceId =
    selectedAnnotation !== undefined
      ? getResourceIdFromExtendedAnnotation(selectedAnnotation)
      : undefined;
  const resourceExternalId =
    selectedAnnotation !== undefined
      ? getResourceExternalIdFromExtendedAnnotation(selectedAnnotation)
      : undefined;

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
    annotation: ExtendedAnnotation;
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
                <Breadcrumb.Item>
                  {getExtendedAnnotationLabel(annotation) || 'N/A'}
                </Breadcrumb.Item>
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
              <Title level={5}>
                {getExtendedAnnotationLabel(annotation) || 'N/A'}
              </Title>
            </Flex>
            <Body level={2}>
              {getExtendedAnnotationDescription(annotation)}
            </Body>
          </InfoCell>
          {contextualization && (
            <InfoCell noBorders>
              <ReviewTagBar
                annotation={annotation}
                onApprove={curAnnotation =>
                  onUpdateAnnotationStatus(curAnnotation, 'approved')
                }
                onReject={curAnnotation =>
                  onUpdateAnnotationStatus(curAnnotation, 'rejected')
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
                onSave={handleSave}
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
      approveAnnotations={(annotations: ExtendedAnnotation[]) =>
        approveAnnotations(
          annotations.map(annotation =>
            setExtendedAnnotationStatus(annotation, 'approved')
          )
        )
      }
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
