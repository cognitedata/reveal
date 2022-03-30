import React from 'react';
import {
  AnnotationTableItem,
  AnnotationTableRowProps,
} from 'src/modules/Review/types';
import { Col, Collapse, Row } from '@cognite/cogs.js';
import styled from 'styled-components';
import { KeypointVertex } from 'src/utils/AnnotationUtils';
import { KeyboardShortCutExpandChildSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { KeypointAnnotationReviewCollapseHeader } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/KeypointAnnotationReviewHeaderRow';
import { ExpandIconComponent } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/ExpandIconComponent';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';

const KeypointRow = ({
  keypoint,
  remaining = false,
}: {
  keypoint: KeypointVertex;
  remaining?: boolean;
}) => (
  <StyledRow cols={12}>
    <StyledCol span={1}>
      <ColorBox
        color={remaining ? '#F5F5F5' : (keypoint as KeypointVertex).color}
      />
    </StyledCol>
    <StyledCol span={1}>
      <div style={{ color: remaining ? '#8C8C8C' : undefined }}>
        {(keypoint as KeypointVertex).order}
      </div>
    </StyledCol>
    <StyledCol span={10} className="label">
      <AnnotationTextContainer>
        <AnnotationText style={{ color: remaining ? '#8C8C8C' : undefined }}>
          {(keypoint as KeypointVertex).caption}
        </AnnotationText>
      </AnnotationTextContainer>
    </StyledCol>
  </StyledRow>
);

export const CollapsibleAnnotationTableRow = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  onKeyPointSelect,
  expandByDefault,
}: AnnotationTableRowProps & {
  onKeyPointSelect?: (id: string) => void;
}) => {
  const onChange = (ann: AnnotationTableItem, key: string) => {
    if (+key === 1) {
      onSelect(ann.id, true);
    } else {
      onSelect(ann.id, false);
    }
  };
  if (
    annotation.region?.shape === 'points' &&
    annotation.region.vertices.length
  ) {
    const expanded =
      expandByDefault ||
      annotation.selected ||
      annotation.region.vertices.some(
        (vertex) => (vertex as KeypointVertex).selected
      );
    let options: any = {
      accordion: true,
      collapsible: undefined,
    };
    if (expanded) options = { ...options, activeKey: 1 };
    else options = { ...options, activeKey: 0 };

    return (
      <StyledCollapse
        expandIcon={ExpandIconComponent}
        {...options}
        onChange={(nextKey) => onChange(annotation, nextKey)}
      >
        <StyledCollapsePanel
          header={
            <KeypointAnnotationReviewCollapseHeader
              annotation={annotation}
              onSelect={onSelect}
              onDelete={onDelete}
              onApprove={onApprove}
              onVisibilityChange={onVisibilityChange}
              showColorCircle={false}
            />
          }
          key={1}
          className={annotation.selected ? 'active' : ''}
        >
          {annotation.region.vertices.map((keypoint) => (
            <KeyboardShortCutExpandChildSelectable
              id={(keypoint as KeypointVertex).id}
              selected={(keypoint as KeypointVertex).selected}
              key={(keypoint as KeypointVertex).id}
            >
              <SidePanelRow>
                <CollapseRowContainer
                  onClick={() => {
                    if (onKeyPointSelect) {
                      onKeyPointSelect((keypoint as KeypointVertex).id);
                    }
                  }}
                >
                  <KeypointRow keypoint={keypoint as KeypointVertex} />
                </CollapseRowContainer>
              </SidePanelRow>
            </KeyboardShortCutExpandChildSelectable>
          ))}
          {
            // Remaining Keypoints
            annotation.remainingKeypoints &&
              annotation.remainingKeypoints.map((keypoint) => (
                <SidePanelRow>
                  <CollapseRowContainer
                    id={`annotation-table-row-${
                      (keypoint as KeypointVertex).id
                    }`}
                    key={(keypoint as KeypointVertex).id}
                  >
                    <KeypointRow
                      keypoint={keypoint as KeypointVertex}
                      remaining
                    />
                  </CollapseRowContainer>
                </SidePanelRow>
              ))
          }
        </StyledCollapsePanel>
      </StyledCollapse>
    );
  }
  return (
    <SidePanelRow>
      <AnnotationTableRow
        annotation={annotation}
        onSelect={onSelect}
        onDelete={onDelete}
        onApprove={onApprove}
        onVisibilityChange={onVisibilityChange}
        showColorCircle
      />
    </SidePanelRow>
  );
};

const StyledCollapse = styled(Collapse)`
  background: inherit;

  & > .rc-collapse-item-active > .rc-collapse-header {
    background: inherit;
  }
`;

const CollapseRowContainer = styled.div`
  padding: 0 30px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  & > .rc-collapse-header {
    background: #ffffff;
    padding: 0 0 0 38px;
  }

  & > .rc-collapse-content {
    padding: 0;
  }

  & > .rc-collapse-content > .rc-collapse-content-box {
    margin: 0;
    width: 100%;
  }
`;

const StyledRow = styled(Row)`
  width: 100%;
  padding-left: 5px;
  padding-right: 5px;
  gap: 8px !important;
`;

const StyledCol = styled(Col)`
  align-self: center;
  justify-self: center;

  &.label {
    align-self: center;
    justify-self: self-start;
  }
`;

const AnnotationTextContainer = styled.div`
  padding: 7px;
  box-sizing: content-box;
`;

const AnnotationText = styled.div`
  padding: 0 10px;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
  border: 0.5px solid rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  border-radius: 2px;
`;
