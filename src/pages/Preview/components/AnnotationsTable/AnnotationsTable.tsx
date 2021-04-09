import {
  AllIconTypes,
  Button,
  Checkbox,
  Col,
  Input,
  Row,
} from '@cognite/cogs.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import {
  annotationApproval,
  deselectAnnotation,
  selectAnnotation,
  toggleAnnotationVisibility,
  VisionAnnotationState,
} from 'src/store/previewSlice';
import {
  AnnotationStatus,
  ModelTypeIconMap,
  ModelTypeStyleMap,
} from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { HandleFileAssetLinksByAnnotationId } from 'src/store/thunks/HandleFileAssetLinksByAnnotationId';
import { DeleteAnnotationsAndRemoveLinkedAssets } from 'src/store/thunks/DeleteAnnotationsAndRemoveLinkedAssets';

const TableContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: 45px auto;
  grid-gap: 10px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  width: 100%;
`;

const Body = styled.div`
  width: 100%;
`;

const StyledRow = styled(Row)`
  padding: 8px;

  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
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

interface ApproveButtonProps {
  status: AnnotationStatus;
}

const AcceptBtn = styled(Button)<ApproveButtonProps>`
  color: ${(props) =>
    props.status === AnnotationStatus.Verified ? '#EDFFF4' : '#059B85'};
  background: ${(props) =>
    props.status === AnnotationStatus.Verified ? '#6FCF97' : '#EDFFF4'};
`;

const RejectBtn = styled(Button)<ApproveButtonProps>`
  color: ${(props) =>
    props.status === AnnotationStatus.Rejected ? '#fbe9ed' : '#eb5757'};
  background: ${(props) =>
    props.status === AnnotationStatus.Rejected ? '#EB5757' : '#fbe9ed'};
`;

// const MenuContent = (
//   <Menu>
//      <Menu.Header>Component menu</Menu.Header>
//      <Menu.Item>Option 1</Menu.Item>
//      <Menu.Divider />
//   </Menu>
// );

interface ShowHideButtonProps {
  color?: string;
  background?: string;
  disablestyle?: string;
}

const ShowHideBtn = styled(Button)<ShowHideButtonProps>`
  height: 28px;
  width: 28px;
  padding: 4px;
  color: ${(props) => props.color || 'black'};
  background: ${(props) => props.background || 'black'};
  cursor: ${(props) => props.disablestyle === 'true' && 'default'};
  opacity: ${(props) => props.disablestyle === 'true' && 0.4};
  border: 1px solid ${(props) => props.color || 'black'};
  border-radius: 5px;
`;

export const VisibilityButton = (props: {
  show: boolean;
  color: string;
  background: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  if (props.disabled) {
    return (
      <ShowHideBtn
        disablestyle="true"
        color={props.color}
        background={props.background}
        type="tertiary"
        icon="EyeHide"
        iconPlacement="right"
        aria-label="show/hide annotation"
      />
    );
  }

  return (
    <ShowHideBtn
      color={props.color}
      background={props.background}
      type="tertiary"
      icon={props.show ? 'EyeShow' : 'EyeHide'}
      iconPlacement="right"
      onClick={props.onClick}
      aria-label="show/hide annotation"
    />
  );
};

export const AnnotationsTable = ({
  annotations,
  selectedAnnotationIds,
  mode,
}: {
  selectedAnnotationIds: string[];
  annotations: VisionAnnotationState[];
  mode: number;
}) => {
  const dispatch = useDispatch();

  const handleOnAnnotationSelect = (id: string, nextState: boolean) => {
    if (nextState) {
      dispatch(
        selectAnnotation({ id, asset: mode === DetectionModelType.Tag })
      );
    } else {
      dispatch(
        deselectAnnotation({ id, asset: mode === DetectionModelType.Tag })
      );
    }
  };

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
    dispatch(HandleFileAssetLinksByAnnotationId(annotation.id));
  };

  const handleDeleteAnnotations = () => {
    dispatch(DeleteAnnotationsAndRemoveLinkedAssets(selectedAnnotationIds));
  };

  return (
    <TableContainer>
      <Header>
        <TitleRow>
          <div>
            {mode === DetectionModelType.Tag ? 'Asset tags' : 'Annotations'}
          </div>
          <DeleteButton
            type="ghost-danger"
            icon="Delete"
            disabled={!selectedAnnotationIds.length}
            onClick={handleDeleteAnnotations}
          >
            Delete Selected
          </DeleteButton>
        </TitleRow>
      </Header>
      <Body>
        {annotationsAvailable &&
          checkableAnnotations.map((annotation) => {
            return (
              <StyledRow
                cols={21}
                key={annotation.id}
                className={annotation.checked ? 'active' : ''}
              >
                <StyledCol span={2}>
                  <Checkbox
                    name={annotation.id}
                    value={annotation.checked}
                    onChange={(nextState) =>
                      handleOnAnnotationSelect(annotation.id, nextState)
                    }
                  />
                </StyledCol>
                <StyledCol span={6}>
                  <ColContainer>
                    <VerticalLine />
                    <AcceptBtn
                      type="primary"
                      icon="Check"
                      status={annotation.status}
                      aria-label="verify annotation"
                      onClick={() => {
                        handleApprovalState(
                          annotation,
                          AnnotationStatus.Verified
                        );
                      }}
                    />
                    <RejectBtn
                      type="primary"
                      icon="Close"
                      status={annotation.status}
                      aria-label="reject annotation"
                      onClick={() => {
                        handleApprovalState(
                          annotation,
                          AnnotationStatus.Rejected
                        );
                      }}
                    />
                    <VerticalLine />
                  </ColContainer>
                </StyledCol>
                <StyledCol span={10}>
                  <AnnotationLbl>
                    <Input
                      icon={
                        ModelTypeIconMap[annotation.modelType] as AllIconTypes
                      }
                      readOnly
                      fullWidth
                      style={{
                        width: `100%`,
                        backgroundColor:
                          (annotation.status === AnnotationStatus.Verified &&
                            '#EDFFF4') ||
                          (annotation.status === AnnotationStatus.Rejected &&
                            '#fbe9ed') ||
                          'white',
                        color: '#595959',
                      }}
                      value={annotation.text}
                    />
                  </AnnotationLbl>
                </StyledCol>
                <StyledCol span={3}>
                  <ColContainer>
                    <VerticalLine />
                    <VisibilityButton
                      show={annotation.show}
                      color={ModelTypeStyleMap[annotation.modelType].color}
                      background={
                        ModelTypeStyleMap[annotation.modelType].backgroundColor
                      }
                      disabled={
                        !annotation.box ||
                        annotation.status === AnnotationStatus.Rejected
                      }
                      aria-label="show / hide-annotation"
                      onClick={() => {
                        dispatch(
                          toggleAnnotationVisibility({
                            annotationId: annotation.id,
                          })
                        );
                      }}
                    />
                    {/* <VerticalLine /> */}
                  </ColContainer>
                </StyledCol>
                {/* <StyledCol span={3}> */}
                {/*  <Dropdown> */}
                {/*    <Button */}
                {/*      icon="MoreOverflowEllipsisHorizontal" */}
                {/*      iconPlacement="left" */}
                {/*    /> */}
                {/*  </Dropdown> */}
                {/* </StyledCol> */}
              </StyledRow>
            );
          })}
        {!annotationsAvailable && (
          <EmptyPlaceHolderContainer>
            <span>
              {mode === DetectionModelType.Tag
                ? 'No assets linked to file'
                : 'No annotations detected'}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  color: #8c8c8c;
`;

const DeleteButton = styled(Button)`
  margin: 10px;
  color: #8c8c8c;
`;

const VerticalLine = styled.div`
  width: 0px;
  height: 20px;
  border-left: 1px solid #e8e8e8;
`;

const ColContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
