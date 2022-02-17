import { AnnotationStatus, AnnotationUtils } from 'src/utils/AnnotationUtils';
import {
  Collapse,
  Detail,
  Icon,
  SegmentedControl,
  Tooltip,
} from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import styled from 'styled-components';
import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';

type RowProps = {
  icon?: boolean;
  borderColor?: string;
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
  const annotationLabelContent = () => {
    return annotation.linkedResourceId ? (
      <TooltipContainer>
        <div className="text">
          <Tooltip className="lbl-tooltip" content={annotation.text}>
            <>{annotation.text}</>
          </Tooltip>
        </div>
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
      </TooltipContainer>
    ) : (
      <div className="text">{annotation.text}</div>
    );
  };
  return (
    <StyledRow
      key={annotation.id}
      onClick={() => onSelect(annotation.id, !annotation.selected)}
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
            key="verified"
            aria-label="verify annotation"
            className="approveButton"
          >
            True
          </SegmentedControl.Button>
          <SegmentedControl.Button
            type="primary"
            key="rejected"
            aria-label="reject annotation"
            className="rejectButton"
          >
            False
          </SegmentedControl.Button>
        </StyledSegmentedControl>
      </ApproveBtnContainer>
      <Icon
        type={AnnotationUtils.getIconType(annotation)}
        style={{
          color: annotation.color,
          height: '100%',
          flex: '0 0 16px',
        }}
      />
      <AnnotationLabelContainer>
        {annotation.linkedResourceId ? (
          <StyledCollapse
            accordion
            expandIcon={({ isActive }) =>
              isActive ? (
                <Icon type="ChevronDownCompact" />
              ) : (
                <Icon type="ChevronUpCompact" />
              )
            }
          >
            <StyledCollapsePanel
              header={
                <AnnotationLbl
                  color={annotation.color}
                  style={{ paddingLeft: '8px' }}
                >
                  {annotationLabelContent()}
                </AnnotationLbl>
              }
              key={1}
            >
              <>
                <AnnotationLbl color={annotation.color}>
                  <Detail style={{ color: 'inherit' }}>
                    {`ID: ${annotation.linkedResourceId}`}
                  </Detail>
                </AnnotationLbl>
                {annotation.linkedResourceExternalId && (
                  <AnnotationLbl color={annotation.color}>
                    <Detail style={{ color: 'inherit' }}>
                      {`External ID: ${annotation.linkedResourceExternalId}`}
                    </Detail>
                  </AnnotationLbl>
                )}
              </>
            </StyledCollapsePanel>
          </StyledCollapse>
        ) : (
          <AnnotationLbl color={annotation.color}>
            <Tooltip className="lbl-tooltip" content={annotation.text}>
              <> {`${annotation.text}`}</>
            </Tooltip>
          </AnnotationLbl>
        )}
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
  align-items: baseline;
`;

const ApproveBtnContainer = styled.div`
  height: 100%;
  flex: 0 1 168px;
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

const StyledCollapsePanel = styled(Collapse.Panel)`
  background: transparent;

  .rc-collapse-header {
    padding: 0;
  }

  .rc-collapse-content {
    padding: 0;
    background: transparent;
  }
`;

const StyledCollapse = styled(Collapse)`
  background: transparent;
`;

const TooltipContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 5px;

  .text {
    overflow-x: hidden;
    width: 100px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
