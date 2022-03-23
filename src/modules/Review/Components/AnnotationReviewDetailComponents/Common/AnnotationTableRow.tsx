import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { Icon, SegmentedControl, Tooltip } from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import styled from 'styled-components';
import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';

export const AnnotationTableRow = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  showColorCircle,
}: AnnotationTableRowProps) => {
  return (
    <StyledRow
      key={annotation.id}
      onClick={() => onSelect(annotation.id, !annotation.selected)}
    >
      {showColorCircle && (
        <ColorCircleContainer>
          <ColorCircle color={annotation.color} />
        </ColorCircleContainer>
      )}
      <AnnotationLabelContainer>
        <AnnotationLbl>
          <Tooltip className="lbl-tooltip" content={annotation.text}>
            <> {`${annotation.text}`}</>
          </Tooltip>
        </AnnotationLbl>
      </AnnotationLabelContainer>
      {annotation.linkedResourceId && (
        <Link
          to={createLink(`/explore/asset/${annotation.linkedResourceId}`)}
          target="_blank"
        >
          <Icon
            type="ExternalLink"
            style={{
              color: annotation.color,
            }}
          />
        </Link>
      )}
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
              onApprove(annotation.id, AnnotationStatus.Verified);
            }
            if (key === 'rejected') {
              pushMetric('Vision.Review.Annotation.Rejected');
              onApprove(annotation.id, AnnotationStatus.Rejected);
            }
          }}
        >
          <SegmentedControl.Button
            type="primary"
            size="small"
            key="verified"
            aria-label="verify annotation"
            className="approveButton"
          >
            TRUE
          </SegmentedControl.Button>
          <SegmentedControl.Button
            type="primary"
            size="small"
            key="rejected"
            aria-label="reject annotation"
            className="rejectButton"
          >
            FALSE
          </SegmentedControl.Button>
        </StyledSegmentedControl>
      </ApproveBtnContainer>
      <ActionMenuContainer
        onClick={(evt) => evt.stopPropagation()}
        aria-hidden="true"
      >
        <AnnotationActionMenuExtended
          showPolygon={annotation.show}
          disableShowPolygon={annotation.status === AnnotationStatus.Rejected}
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

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: 12px;
  border-radius: 5px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;
type Color = {
  color: string;
};
const ColorCircleContainer = styled.div`
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ColorCircle = styled.span<Color>`
  height: 10px;
  width: 10px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
`;

const ApproveBtnContainer = styled.div`
  flex: 0 1 70px;
`;

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
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
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
  flex: 0 1 30px;
`;

const StyledSegmentedControl = styled(SegmentedControl)<{ status: string }>`
  line-height: 16px;
  .cogs-btn.cogs-btn {
    width: 22px;
    height: 16px;
    padding: 8px 16px;
  }
  button {
    font-weight: 500;
    font-size: 8px;
    line-height: 14px;
    border-radius: 4px;
  }

  & > span.elevated {
    border-radius: initial;
    box-shadow: none;
  }
  .approveButton {
    background: ${(props) =>
      props.status === AnnotationStatus.Verified
        ? '#ffffff'
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
        ? '#ffffff'
        : 'var(--cogs-color-action-secondary)'};
  }
  .rejectButton:hover {
    color: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#eb5757' : 'unset'};
    background: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#d9d9d9' : '#FFCFCF'};
  }
`;
