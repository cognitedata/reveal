import { AnnotationStatus, ModelTypeIconMap } from 'src/utils/AnnotationUtils';
import {
  AllIconTypes,
  Icon,
  SegmentedControl,
  Tooltip,
} from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import styled from 'styled-components';
import { VisionAPIType } from 'src/api/types';
import { AnnotationTableRowProps } from 'src/modules/Review/types';

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  padding: 7px 5px;
  gap: 12px;
  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
  }
`;

const ApproveBtnContainer = styled.div`
  height: 100%;
  flex: 0 0 fit-content;
`;

const getIconType = (annotation: {
  text: string;
  modelType: VisionAPIType;
}) => {
  return annotation.text === 'person'
    ? 'Personrounded'
    : (ModelTypeIconMap[annotation.modelType] as AllIconTypes);
};

export const AnnotationTableRow = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
}: AnnotationTableRowProps) => {
  return (
    <StyledRow
      key={annotation.id}
      onClick={() => onSelect(annotation.id)}
      className={annotation.selected ? 'active' : ''}
    >
      <ApproveBtnContainer onClick={(evt) => evt.stopPropagation()}>
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
              onApprove(annotation, AnnotationStatus.Verified);
            }
            if (key === 'rejected') {
              onApprove(annotation, AnnotationStatus.Rejected);
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
      </ApproveBtnContainer>
      <AnnotationLabelContainer>
        <Tooltip
          content={<span data-testid="text-content">{annotation.text}</span>}
        >
          <AnnotationLbl
            style={{
              color: annotation.color,
            }}
          >
            <Icon
              type={getIconType(annotation)}
              style={{
                color: annotation.color,
              }}
            />
            <span
              style={{
                padding: '5px 10px',
              }}
            >
              {annotation.text}
            </span>
            {!annotation.show
              ? () => {
                  return (
                    <Icon
                      type="EyeHide"
                      style={{ color: '#595959', padding: 5 }}
                      onClick={() => {
                        onVisibilityChange(annotation.id);
                      }}
                    />
                  );
                }
              : undefined}
          </AnnotationLbl>
        </Tooltip>
      </AnnotationLabelContainer>
      <ShowHideIconContainer>
        {!annotation.show ? (
          <Icon
            type="EyeHide"
            style={{ color: '#595959' }}
            onClick={() => {
              onVisibilityChange(annotation.id);
            }}
          />
        ) : undefined}
      </ShowHideIconContainer>
      <ActionMenuContainer
        onClick={(evt) => evt.stopPropagation()}
        aria-hidden="true"
      >
        <AnnotationActionMenuExtended
          showPolygon={annotation.show}
          disableShowPolygon={annotation.status === AnnotationStatus.Rejected}
          // handleEditLabel={() => {}}
          // handleEditPolygon={() => {}}
          handleVisibility={() => {
            onVisibilityChange(annotation.id);
          }}
          handleAnnotationDelete={() => {
            onDelete(annotation.id);
          }}
        />
      </ActionMenuContainer>
    </StyledRow>
  );
};

const AnnotationLbl = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px;
`;

const ShowHideIconContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 36px;
  justify-content: center;
`;

const AnnotationLabelContainer = styled.div`
  flex: 1 1 auto;
`;

const ActionMenuContainer = styled.div`
  flex: 0 0 36px;
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
