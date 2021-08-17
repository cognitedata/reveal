import { AnnotationStatus, ModelTypeIconMap } from 'src/utils/AnnotationUtils';
import {
  AllIconTypes,
  Col,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Tooltip,
} from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import styled from 'styled-components';
import { VisionAPIType } from 'src/api/types';
import { AnnotationTableRowProps } from 'src/modules/Review/types';

const StyledRow = styled(Row)`
  width: 100%;
  justify-content: space-around;
  display: flex;
  padding-left: 5px;
  padding-right: 5px;
  gap: 12px !important;
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

const ColContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
      cols={6}
      key={annotation.id}
      onClick={() => onSelect(annotation.id)}
      className={annotation.selected ? 'active' : ''}
    >
      <StyledCol span={2}>
        <ColContainer onClick={(evt) => evt.stopPropagation()}>
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
        </ColContainer>
      </StyledCol>
      <StyledCol span={3}>
        <AnnotationLbl
          style={{
            color: annotation.color,
          }}
        >
          <Tooltip
            content={<span data-testid="text-content">{annotation.text}</span>}
          >
            <Input
              readOnly
              fullWidth
              style={{
                width: `100%`,
                borderColor: annotation.color,
              }}
              value={annotation.text}
              icon={
                <Icon
                  type={getIconType(annotation)}
                  style={{
                    color: annotation.color,
                  }}
                />
              }
              subComponentPlacement="right"
              customSubComponent={
                !annotation.show
                  ? () => {
                      return (
                        <Icon
                          type="EyeHide"
                          style={{ color: '#595959' }}
                          onClick={() => {
                            onVisibilityChange(annotation.id);
                          }}
                        />
                      );
                    }
                  : undefined
              }
            />
          </Tooltip>
        </AnnotationLbl>
      </StyledCol>
      <StyledCol span={1}>
        <div onClick={(evt) => evt.stopPropagation()} aria-hidden="true">
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
        </div>
      </StyledCol>
    </StyledRow>
  );
};

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
