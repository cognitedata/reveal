import {
  AllIconTypes,
  Col,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import {
  annotationApproval,
  toggleAnnotationVisibility,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import {
  AnnotationStatus,
  ModelTypeIconMap,
  ModelTypeStyleMap,
} from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { HandleFileAssetLinksByAnnotationId } from 'src/store/thunks/HandleFileAssetLinksByAnnotationId';
import { DeleteAnnotationsAndRemoveLinkedAssets } from 'src/store/thunks/DeleteAnnotationsAndRemoveLinkedAssets';
import { UpdateAnnotationsById } from 'src/store/thunks/UpdateAnnotationsById';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';

export const AnnotationsTable = ({
  annotations,
  selectedAnnotationIds,
  mode,
}: {
  selectedAnnotationIds: number[];
  annotations: VisionAnnotationState[];
  mode: number;
}) => {
  const dispatch = useDispatch();

  const checkableAnnotations = useMemo(() => {
    const annotationIdsSet = new Set(selectedAnnotationIds);
    return annotations.map((ann) => ({
      ...ann,
      checked: annotationIdsSet.has(ann.id),
    }));
  }, [annotations, selectedAnnotationIds]);

  const annotationsAvailable = annotations.length > 0;

  const handleApprovalState = (
    annotation: VisionAnnotationState,
    status: AnnotationStatus
  ) => {
    dispatch(annotationApproval(annotation.id, status));
    dispatch(UpdateAnnotationsById([annotation.id]));
    dispatch(HandleFileAssetLinksByAnnotationId(annotation.id));
  };

  const handleVisibility = (id: number) => {
    dispatch(
      toggleAnnotationVisibility({
        annotationId: id,
      })
    );
  };

  const handleDeleteAnnotations = (id: number) => {
    dispatch(DeleteAnnotationsAndRemoveLinkedAssets([id]));
  };

  const getColor = (annotation: { text: string; modelType: VisionAPIType }) => {
    return annotation.text === 'person'
      ? '#1AA3C1'
      : ModelTypeStyleMap[annotation.modelType].color;
  };

  const getIconType = (annotation: {
    text: string;
    modelType: VisionAPIType;
  }) => {
    return annotation.text === 'person'
      ? 'Personrounded'
      : (ModelTypeIconMap[annotation.modelType] as AllIconTypes);
  };

  return (
    <TableContainer>
      <TitleRow>
        <Title level={5}>
          {mode === VisionAPIType.TagDetection
            ? 'Asset tags in image'
            : 'Text and objects in image '}
        </Title>
      </TitleRow>
      <Body>
        {annotationsAvailable &&
          checkableAnnotations.map((annotation) => {
            return (
              <StyledRow cols={8} key={annotation.id}>
                <StyledCol span={2}>
                  <ColContainer>
                    <StyledSegmentedControl
                      status={annotation.status}
                      className="approvalButton"
                      currentKey={
                        // eslint-disable-next-line no-nested-ternary
                        annotation.status === AnnotationStatus.Verified
                          ? 'verified'
                          : annotation.status === AnnotationStatus.Rejected
                          ? 'rejected'
                          : undefined
                      }
                      onButtonClicked={(key) => {
                        if (key === 'verified') {
                          handleApprovalState(
                            annotation,
                            AnnotationStatus.Verified
                          );
                        }
                        if (key === 'rejected') {
                          handleApprovalState(
                            annotation,
                            AnnotationStatus.Rejected
                          );
                        }
                      }}
                    >
                      <SegmentedControl.Button
                        type="primary"
                        icon="ThumbsUp"
                        key="verified"
                        aria-label="verify annotation"
                        className="approveButton"
                      >
                        True
                      </SegmentedControl.Button>
                      <SegmentedControl.Button
                        type="primary"
                        icon="ThumbsDown"
                        key="rejected"
                        aria-label="reject annotation"
                        className="rejectButton"
                      >
                        False
                      </SegmentedControl.Button>
                    </StyledSegmentedControl>
                  </ColContainer>
                </StyledCol>
                <StyledCol span={3}>
                  <AnnotationLbl
                    style={{
                      color: getColor(annotation),
                    }}
                  >
                    <Tooltip
                      content={
                        <span data-testid="text-content">
                          {annotation.text}
                        </span>
                      }
                    >
                      <Input
                        readOnly
                        fullWidth
                        style={{
                          width: `100%`,
                          borderColor: getColor(annotation),
                        }}
                        value={annotation.text}
                        icon={
                          <Icon
                            type={getIconType(annotation)}
                            style={{
                              color: getColor(annotation),
                            }}
                          />
                        }
                      />
                    </Tooltip>
                  </AnnotationLbl>
                </StyledCol>
                <StyledCol span={1}>
                  <AnnotationActionMenuExtended
                    showPolygon={annotation.show}
                    disableShowPolygon={
                      annotation.status === AnnotationStatus.Rejected
                    }
                    // handleEditLabel={() => {}}
                    // handleEditPolygon={() => {}}
                    handleVisibility={() => {
                      handleVisibility(annotation.id);
                    }}
                    handleAnnotationDelete={() => {
                      handleDeleteAnnotations(annotation.id);
                    }}
                  />
                </StyledCol>
              </StyledRow>
            );
          })}
        {!annotationsAvailable && (
          <EmptyPlaceHolderContainer>
            <span>
              {mode === VisionAPIType.TagDetection
                ? 'No assets detected or manually added'
                : 'No text or objects detected or manually added'}
            </span>
          </EmptyPlaceHolderContainer>
        )}
      </Body>
    </TableContainer>
  );
};

const EmptyPlaceHolderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8c8c8c;
`;

const ColContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TableContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: 45px auto;
  grid-gap: 10px;
  margin-bottom: 20px;
`;

const Body = styled.div`
  width: 100%;
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
  border-radius: 5px;
`;

const StyledRow = styled(Row)`
  justify-content: space-around;
  display: flex;
  padding-left: 5px;
  padding-right: 5px;
  gap: 12px !important;
  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &:active {
    background: var(--cogs-midblue-6);
  }
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnnotationLbl = styled.div`
  width: 100%;
  padding: 10px 10px;
  box-sizing: content-box;
`;

const StyledSegmentedControl = styled(SegmentedControl)<{ status: string }>`
  .approveButton {
    background: ${(props) =>
      props.status === AnnotationStatus.Verified
        ? '#6FCF97'
        : 'var(--cogs-color-action-secondary)'};
  }
  .approveButton:hover {
    color: ${(props) =>
      props.status !== AnnotationStatus.Verified ? '#059b85' : 'unset'};
    background: ${(props) =>
      props.status !== AnnotationStatus.Verified ? '#d9d9d9' : '#6FCF97'};
  }

  .rejectButton {
    background: ${(props) =>
      props.status === AnnotationStatus.Rejected
        ? '#FFCFCF'
        : 'var(--cogs-color-action-secondary)'};
  }
  .rejectButton:hover {
    color: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#eb5757' : 'unset'};
    background: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#d9d9d9' : '#FFCFCF'};
  }
`;
