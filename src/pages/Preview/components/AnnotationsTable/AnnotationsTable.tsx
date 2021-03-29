import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Input,
  Menu,
  Row,
} from '@cognite/cogs.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Divider } from '@cognite/data-exploration';
import { useDispatch } from 'react-redux';
import {
  annotationApproval,
  deselectAnnotation,
  selectAnnotation,
  toggleAnnotationVisibility,
  VisionAnnotationState,
} from 'src/store/previewSlice';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { LinkFileAssetsByAnnotationId } from 'src/store/thunks/LinkFileAssetsByAnnotationId';

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

const StyledHeaderRow = styled(Row)`
  padding: 8px;
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
`;

const AnnotationLbl = styled.div`
  width: 100%;
  padding-right: 10px;
  box-sizing: content-box;
`;

const AcceptBtn = styled(Button)`
  background: #6fcf97;
`;

const RejectBtn = styled(Button)`
  margin-left: 10px;
  background: #eb5757;
`;

const MenuContent = (
  <Menu>
    <Menu.Header>Component menu</Menu.Header>
    <Menu.Item>Option 1</Menu.Item>
    <Menu.Item appendIcon="ThreeD">
      <span>Option 2</span>
    </Menu.Item>

    <Menu.Item>Option 3</Menu.Item>
    <Menu.Divider />
  </Menu>
);

const ApproveButtons = (props: {
  onApprove: (status: AnnotationStatus) => void;
  approveStatus: AnnotationStatus;
}) => {
  if (props.approveStatus === AnnotationStatus.Unhandled) {
    return (
      <>
        <AcceptBtn
          type="primary"
          icon="Check"
          aria-label="verify annotation"
          onClick={() => {
            props.onApprove(AnnotationStatus.Verified);
          }}
        />
        <RejectBtn
          type="primary"
          icon="Close"
          aria-label="reject annotation"
          onClick={() => {
            props.onApprove(AnnotationStatus.Rejected);
          }}
        />
      </>
    );
  }
  if (props.approveStatus === AnnotationStatus.Verified) {
    return (
      <Dropdown content={MenuContent}>
        <Button icon="MoreOverflowEllipsisHorizontal" iconPlacement="left" />
      </Dropdown>
    );
  }
  return null;
};

interface ButtonProps {
  color?: string;
  disablestyle?: string;
}

const ShowHideBtn = styled(Button)<ButtonProps>`
  padding: 4px;
  color: ${(props) => props.color || 'black'};
  cursor: ${(props) => props.disablestyle === 'true' && 'default'};
`;

interface BadgeProps {
  backgroundColor: string;
}

const AnnotationBadge = styled.div<BadgeProps>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DisabledLine = styled.div`
  height: 40px;
  border-left: 2px solid #595959;
  transform: translate(-15px, 0) rotate(45deg);
`;

export const VisibilityButton = (props: {
  show: boolean;
  color: string;
  value: number;
  disabled: boolean;
  onClick: () => void;
}) => {
  if (props.disabled) {
    return (
      <ShowHideBtn
        color="#BFBFBF"
        type="tertiary"
        icon="EyeShow"
        iconPlacement="right"
        disablestyle="true"
      >
        <AnnotationBadge backgroundColor="#E8E8E8">
          {props.value}
        </AnnotationBadge>
        <DisabledLine />
      </ShowHideBtn>
    );
  }

  return (
    <ShowHideBtn
      type="tertiary"
      icon={props.show ? 'EyeShow' : 'EyeHide'}
      iconPlacement="right"
      onClick={props.onClick}
    >
      <AnnotationBadge backgroundColor={props.color}>
        {props.value}
      </AnnotationBadge>
    </ShowHideBtn>
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
      dispatch(selectAnnotation(id));
    } else {
      dispatch(deselectAnnotation(id));
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
    dispatch(LinkFileAssetsByAnnotationId(annotation.id));
  };

  return (
    <TableContainer>
      <Header>
        <StyledHeaderRow>
          <StyledCol span={2}> </StyledCol>
          <StyledCol span={5}>Action</StyledCol>
          <StyledCol span={12}>
            {mode === DetectionModelType.Tag ? 'Asset tag' : 'Annotations'}
          </StyledCol>
          <StyledCol span={5}>Polygon</StyledCol>
        </StyledHeaderRow>
        <Divider.Horizontal />
      </Header>
      <Body>
        {annotationsAvailable &&
          checkableAnnotations.map((annotation, index) => {
            return (
              <StyledRow
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
                <StyledCol span={5}>
                  <ApproveButtons
                    approveStatus={annotation.status}
                    onApprove={(status: AnnotationStatus) =>
                      handleApprovalState(annotation, status)
                    }
                  />
                </StyledCol>
                <StyledCol span={12}>
                  <AnnotationLbl>
                    <Input
                      icon={
                        mode === DetectionModelType.Tag
                          ? 'ResourceAssets'
                          : undefined
                      }
                      readOnly
                      fullWidth
                      style={{ width: `100%` }}
                      value={annotation.description}
                    />
                  </AnnotationLbl>
                </StyledCol>
                <StyledCol span={5}>
                  <VisibilityButton
                    show={annotation.show}
                    color={annotation.color}
                    value={index}
                    disabled={!annotation.box}
                    aria-label="show / hide-annotation"
                    onClick={() => {
                      dispatch(
                        toggleAnnotationVisibility({
                          annotationId: annotation.id,
                        })
                      );
                    }}
                  />
                </StyledCol>
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
