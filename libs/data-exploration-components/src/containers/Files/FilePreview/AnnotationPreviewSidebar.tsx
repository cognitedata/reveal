import React, { useEffect, useCallback, useState } from 'react';

import styled from 'styled-components';

import {
  ResourceSelectorDetails,
  ResourceSelectorDrawer,
} from '@data-exploration/containers';
import { useQueryClient } from '@tanstack/react-query';
import { Dropdown, Pagination, Spin, Breadcrumb, Modal } from 'antd';
import capitalize from 'lodash/capitalize';

import {
  Button,
  Title,
  Body,
  Menu,
  toast,
  Detail,
  Flex,
} from '@cognite/cogs.js';
import { FileInfo, AnnotationStatus } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  ExtendedAnnotation,
  SIDEBAR_RESIZE_EVENT,
  sleep,
  useDialog,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useCreateAnnotation,
  useDeleteAnnotation,
  useUpdateAnnotations,
} from '@data-exploration-lib/domain-layer';

import { Divider, InfoCell } from '../../../components';
import { ResourceItem, convertResourceType } from '../../../types';

import { CreateAnnotationForm } from './CreateAnnotationForm/CreateAnnotationForm';
import FilePreviewSidebar from './FilePreviewSidebar';
import {
  getExtendedAnnotationDescription,
  getExtendedAnnotationLabel,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  isExtendedLocalAnnotation,
  setExtendedAnnotationResource,
  setExtendedAnnotationStatus,
} from './migration';
import ReviewTagBar from './ReviewTagBar';

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
  isDocumentsApiEnabled?: boolean;
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
  isDocumentsApiEnabled = true,
}: Props) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const { isOpen, open, close: modalClose } = useDialog();
  const {
    isOpen: visible,
    close: resourceSelectorClose,
    open: openResourceSelector,
  } = useDialog();

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
        client.invalidateQueries([`annotations-file-${file.id}`]);
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

    setPendingAnnotations((pendingAnnotations) =>
      pendingAnnotations.filter((el) => el.id !== selectedAnnotation?.id)
    );
    toast.success(
      t('ANNOTATION_TAG_ACTION_TEXT_SUCCESS', `Tag ${action} successfully`, {
        action,
      })
    );
  };

  const createAnnotation = useCreateAnnotation({
    onSuccess: () => onSuccess(t('ANNOTATION_TAG_ACTION_CREATED', 'created')),
  });

  const updateAnnotations = useUpdateAnnotations({
    onSuccess: () => onSuccess(t('ANNOTATION_TAG_ACTION_SAVED', 'saved')),
  });

  const approveAnnotations = useUpdateAnnotations({
    onSuccess: () => onSuccess(t('ANNOTATION_TAG_ACTION_APPROVED', 'approved')),
  });

  const deleteAnnotation = useDeleteAnnotation({
    onSuccess: () => onSuccess(t('ANNOTATION_TAG_ACTION_DELETED', 'deleted')),
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
    const okText = isApprove
      ? t('APPROVE_TAG_TEXT', 'Approve tag')
      : t('REJECT_TAG_TEXT', 'Reject tag');
    const content = isApprove ? (
      <Body level={2} strong>
        {t('APPROVE_TAG_CONFIRMATION_TEXT', 'Approve this tag?')}
      </Body>
    ) : (
      <>
        <Body level={2} strong>
          {t('REJECT_TAG_CONFIRMATION_TEXT', 'Reject this tag?')}
        </Body>
        <Body level={2}>
          {t(
            'REMOVE_TAG_WARNING_TEXT',
            'The tag will be removed from the diagram.'
          )}
        </Body>
      </>
    );
    setAnnotationModalState({
      okText,
      content,
      onOk: async () => {
        updateAnnotations([setExtendedAnnotationStatus(annotation, status)]);
        setSelectedAnnotations([]);
        modalClose();
      },
      onCancel: modalClose,
    });
    open();
  };

  const onDeleteAnnotation = (annotation: ExtendedAnnotation) => {
    setPendingAnnotations((pendingAnnotations) => {
      if (pendingAnnotations.find((el) => el.id === annotation.id)) {
        return pendingAnnotations.filter((el) => el.id !== annotation.id);
      }
      return pendingAnnotations;
    });
    if (isExtendedLocalAnnotation(annotation)) {
      // If this is a local annotation, just deselect it
      setSelectedAnnotations(
        selectedAnnotations.filter((el) => el.id !== annotation.id)
      );
    } else {
      // Otherwise, the annotation may be deleted using the SDK
      setAnnotationModalState({
        title: t('ARE_YOU_SURE', 'Are you sure?'),
        content: (
          <span>
            {t(
              'DELETE_TAG_WARNING_TEXT',
              'These annotations will be deleted. However, you can always re-contextualize the file.'
            )}
          </span>
        ),
        onOk: async () => {
          deleteAnnotation(annotation);
          setPendingAnnotations([]);
          setSelectedAnnotations([]);
          modalClose();
        },
        onCancel: modalClose,
      });
      open();
    }
  };

  const onLinkResource = useCallback(() => {
    openResourceSelector();
    //TODO Don't know what this does need to confirm with Industry canvas
    // const resourceItemState =
    //   selectedAnnotation !== undefined &&
    //   getResourceItemStateFromExtendedAnnotation(selectedAnnotation, 'selected')
    //     ? getResourceItemStateFromExtendedAnnotation(
    //         selectedAnnotation,
    //         'selected'
    //       )
    //     : undefined;
  }, [openResourceSelector, selectedAnnotation, visible]);

  const onSelectResources = (item: ResourceItem) => {
    if (selectedAnnotation === undefined) {
      return;
    }

    setSelectedAnnotations([
      setExtendedAnnotationResource(selectedAnnotation, item),
    ]);
    resourceSelectorClose();
  };

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

  const detailsOverlay = document.getElementById('details-overlay');
  const resourceSelectorInitialWidth = detailsOverlay
    ? detailsOverlay.clientWidth - 50
    : '30%';

  const Header = ({
    annotation,
    onClose,
  }: {
    annotation: ExtendedAnnotation;
    onClose: () => void;
  }) => {
    const menuOptions = () => (
      <Menu>
        <Menu.Item onClick={() => setEditing(true)}>
          {t('EDIT', 'Edit')}
        </Menu.Item>
        <Menu.Item onClick={() => onDeleteAnnotation(annotation)}>
          {t('DELETE', 'Delete')}
        </Menu.Item>
      </Menu>
    );
    if (!!type && isLoading) {
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
              onChange={(i) => {
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
                onApprove={(curAnnotation) =>
                  onUpdateAnnotationStatus(curAnnotation, 'approved')
                }
                onReject={(curAnnotation) =>
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
        <ResourceSelectorDetails
          hideTitle
          closable={false}
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          visibleResources={['timeSeries']} // to show timeseries panel in annotation sidebar
          showSelectButton={false}
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
                {t('VIEW', 'View')} {type}
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
          content={
            isEditingMode ? (
              <CreateAnnotationForm
                annotation={selectedAnnotation}
                updateAnnotation={(annotation) =>
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
        <ResourceSelectorDrawer
          initialWidth={resourceSelectorInitialWidth}
          visibleResourceTabs={['asset', 'file']}
          visible={visible}
          selectionMode="single"
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          onClose={resourceSelectorClose}
          onSelect={onSelectResources}
        />
      </>
    );
  }
  return (
    <>
      <FilePreviewSidebar
        annotations={annotations}
        file={file}
        fileIcon={fileIcon}
        approveAnnotations={(annotations: ExtendedAnnotation[]) =>
          approveAnnotations(
            annotations.map((annotation) =>
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
    </>
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
