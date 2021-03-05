import {
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  Radio,
  Row,
} from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { Divider } from '@cognite/data-exploration';
import { useDispatch } from 'react-redux';
import {
  annotationApproval,
  toggleAnnotationVisibility,
  VisionAnnotationState,
} from 'src/store/previewSlice';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

const Container = styled.div`
  width: 100%;
`;
const StyledRow = styled(Row)`
  margin-bottom: 8px;
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

const ShowHideBtn = styled(Button)`
  padding: 4px;
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
  id: string;
  approveStatus: AnnotationStatus;
}) => {
  const dispatch = useDispatch();

  if (props.approveStatus === AnnotationStatus.Unhandled) {
    return (
      <>
        <AcceptBtn
          type="primary"
          icon="Check"
          onClick={() => {
            dispatch(
              annotationApproval({
                annotationId: props.id,
                status: AnnotationStatus.Verified,
              })
            );
          }}
        />
        <RejectBtn
          type="primary"
          icon="Close"
          onClick={() => {
            dispatch(
              annotationApproval({
                annotationId: props.id,
                status: AnnotationStatus.Deleted,
              })
            );
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

export const AnnotationsTable = (props: {
  annotations: VisionAnnotationState[];
}) => {
  const dispatch = useDispatch();
  return (
    <Container>
      <StyledRow>
        <StyledCol span={2}> </StyledCol>
        <StyledCol span={5}>Action</StyledCol>
        <StyledCol span={12}>Annotations</StyledCol>
        <StyledCol span={5}>Polygon</StyledCol>
      </StyledRow>
      <Divider.Horizontal />
      {props.annotations.map((annotation) => {
        return (
          <StyledRow key={annotation.id}>
            <StyledCol span={2}>
              <Radio id="example7" name="example" value="Option 1" />
            </StyledCol>
            <StyledCol span={5}>
              <ApproveButtons
                approveStatus={annotation.status}
                id={annotation.id}
              />
            </StyledCol>
            <StyledCol span={12}>
              <AnnotationLbl>
                <Input
                  disabled
                  style={{ width: `100%` }}
                  value={annotation.description}
                />
              </AnnotationLbl>
            </StyledCol>
            <StyledCol span={5}>
              <ShowHideBtn
                type="secondary"
                variant="outline"
                icon={annotation.show ? 'EyeShow' : 'EyeHide'}
                iconPlacement="right"
                onClick={() =>
                  dispatch(
                    toggleAnnotationVisibility({ annotationId: annotation.id })
                  )
                }
              >
                <AnnotationBadge backgroundColor={annotation.color}>
                  {annotation.displayId}
                </AnnotationBadge>
              </ShowHideBtn>
            </StyledCol>
          </StyledRow>
        );
      })}
    </Container>
  );
};
