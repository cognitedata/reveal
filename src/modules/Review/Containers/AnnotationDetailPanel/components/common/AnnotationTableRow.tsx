import { Detail, Icon, SegmentedControl, Tooltip } from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import useColorForLabel from 'src/store/hooks/useColorForLabel';
import styled from 'styled-components';
import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { Status } from 'src/api/annotation/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';
import { AnnotationTableRowAttribute } from './AnnotationTableRowAttribute';

export const AnnotationTableRow = ({
  reviewAnnotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  showColorCircle,
  showEditOptions,
}: AnnotationTableRowProps) => {
  const annotationColor = useColorForLabel(
    getAnnotationLabelOrText(reviewAnnotation.annotation),
    reviewAnnotation.annotation.annotationType
  );

  return (
    <StyledRow
      key={reviewAnnotation.annotation.id}
      onClick={() =>
        onSelect(reviewAnnotation.annotation.id, !reviewAnnotation.selected)
      }
    >
      {showColorCircle && (
        <ColorCircleContainer>
          <ColorCircle color={annotationColor} />
        </ColorCircleContainer>
      )}
      <AnnotationLabelContainer>
        <AnnotationLbl>
          <Tooltip
            className="lbl-tooltip"
            content={getAnnotationLabelOrText(reviewAnnotation.annotation)}
          >
            <> {`${getAnnotationLabelOrText(reviewAnnotation.annotation)}`}</>
          </Tooltip>
        </AnnotationLbl>
      </AnnotationLabelContainer>
      {isImageAssetLinkData(reviewAnnotation.annotation) && (
        <Link
          to={createLink(
            `/explore/asset/${reviewAnnotation.annotation.assetRef.id}`
          )}
          target="_blank"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Icon
            type="ExternalLink"
            style={{
              color: annotationColor,
            }}
          />
        </Link>
      )}
      <ShowHideIconContainer>
        {!reviewAnnotation.show ? (
          <Icon
            type="EyeHide"
            style={{ color: '#595959' }}
            onClick={() => {
              onVisibilityChange(reviewAnnotation.annotation.id);
            }}
          />
        ) : undefined}
      </ShowHideIconContainer>
      {(reviewAnnotation.annotation.attributes !== undefined ||
        reviewAnnotation.annotation?.confidence !== undefined) && (
        <AttributesIconContainer>
          <StyledDetail>
            <Tooltip
              content={
                <AnnotationTableRowAttribute
                  reviewAnnotation={reviewAnnotation}
                />
              }
            >
              <ToolTipIcon type="Info" />
            </Tooltip>
          </StyledDetail>
        </AttributesIconContainer>
      )}
      {showEditOptions && (
        <>
          <ApproveBtnContainer onClick={(evt) => evt.stopPropagation()}>
            <StyledSegmentedControl
              status={reviewAnnotation.annotation.status}
              className="approvalButton"
              currentKey={
                // eslint-disable-next-line no-nested-ternary
                reviewAnnotation.annotation.status === Status.Approved
                  ? 'verified'
                  : reviewAnnotation.annotation.status === Status.Rejected
                  ? 'rejected'
                  : undefined
              }
              onButtonClicked={(key) => {
                if (key === 'verified') {
                  pushMetric('Vision.Review.Annotation.Verified');
                  onApprove(reviewAnnotation.annotation.id, Status.Approved);
                }
                if (key === 'rejected') {
                  pushMetric('Vision.Review.Annotation.Rejected');
                  onApprove(reviewAnnotation.annotation.id, Status.Rejected);
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
              showPolygon={reviewAnnotation.show}
              disableShowPolygon={
                reviewAnnotation.annotation.status === Status.Rejected
              }
              handleVisibility={() => {
                onVisibilityChange(reviewAnnotation.annotation.id);
              }}
              handleAnnotationDelete={() => {
                onDelete(reviewAnnotation.annotation.id);
              }}
            />
          </ActionMenuContainer>
        </>
      )}
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
  padding: 8px 6px;
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

const AttributesIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
`;

const StyledDetail = styled(Detail)`
  color: #595959;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ToolTipIcon = styled(Icon)`
  align-self: center;
  display: flex;
`;

const ActionMenuContainer = styled.div`
  flex: 0 1 30px;
`;

const StyledSegmentedControl = styled(SegmentedControl)<{ status: string }>`
  line-height: 16px;
  .cogs-btn.cogs-btn {
    width: 22px;
    height: 20px;
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
      props.status === Status.Approved
        ? '#ffffff'
        : 'var(--cogs-color-action-secondary)'};
  }
  .approveButton:hover {
    color: ${(props) =>
      props.status !== Status.Approved ? '#059b85' : 'unset'};
    background: ${(props) =>
      props.status !== Status.Approved ? '#d9d9d9' : '#6FCF97'};
  }

  .rejectButton {
    background: ${(props) =>
      props.status === Status.Rejected
        ? '#ffffff'
        : 'var(--cogs-color-action-secondary)'};
  }
  .rejectButton:hover {
    color: ${(props) =>
      props.status !== Status.Rejected ? '#eb5757' : 'unset'};
    background: ${(props) =>
      props.status !== Status.Rejected ? '#d9d9d9' : '#FFCFCF'};
  }
`;
