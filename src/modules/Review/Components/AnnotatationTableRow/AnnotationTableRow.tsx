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
import { pushMetric } from 'src/utils/pushMetric';

type RowProps = {
  icon?: boolean;
  borderColor?: string;
};

const StyledRow = styled.div<RowProps>`
  display: flex;
  width: 100%;
  padding: 7px 5px 7px ${(props) => (props.icon ? '5px' : '16px')};
  gap: 12px;
  border: ${(props) =>
    props.borderColor ? `1px solid ${props.borderColor}` : 'none'};
  border-radius: 5px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;

const ApproveBtnContainer = styled.div`
  height: 100%;
  flex: 0 1 168px;
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
  iconComponent,
  borderColor,
}: AnnotationTableRowProps) => {
  return (
    <StyledRow
      key={annotation.id}
      onClick={() => onSelect(annotation.id)}
      borderColor={borderColor}
      icon={!!iconComponent}
    >
      <>{!!iconComponent && React.cloneElement(iconComponent)}</>
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
              pushMetric('Vision.Review.Annotation.Verified');
              onApprove(annotation, AnnotationStatus.Verified);
            }
            if (key === 'rejected') {
              pushMetric('Vision.Review.Annotation.Rejected');
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
      <Icon
        type={getIconType(annotation)}
        style={{
          color: annotation.color,
          height: '100%',
          flex: '0 0 16px',
        }}
      />
      <AnnotationLabelContainer>
        <Tooltip className="lbl-tooltip" content={annotation.text}>
          <AnnotationLbl color={annotation.color}>
            {annotation.text}
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

const AnnotationLabelContainer = styled.div`
  flex: 1 1 150px;
  overflow: hidden;

  & span {
    width: 100%;
    height: 100%;
  }
`;

type AnnotationLabelOpts = {
  color?: string;
};
const AnnotationLbl = styled.div<AnnotationLabelOpts>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => props.color || 'inherit'};
`;

const ShowHideIconContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 36px;
  justify-content: center;
`;

const ActionMenuContainer = styled.div`
  flex: 0 1 36px;
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
