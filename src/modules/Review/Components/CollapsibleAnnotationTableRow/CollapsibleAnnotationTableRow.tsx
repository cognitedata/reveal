import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotatationTableRow/AnnotationTableRow';
import React from 'react';
import { Col, Collapse, Row } from '@cognite/cogs.js';
import styled from 'styled-components';
import { KeypointVertex } from 'src/utils/AnnotationUtils';

const StyledRow = styled(Row)`
  width: 100%;
  padding-left: 5px;
  padding-right: 5px;
  gap: 12px !important;
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
  padding: 10px 10px;
  box-sizing: content-box;
`;

const AnnotationText = styled.div`
  padding: 0 10px;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
  border: 0.5px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 2px;
`;

export const CollapsibleAnnotationTableRow = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  onKeyPointSelect,
  iconComponent,
  borderColor,
}: AnnotationTableRowProps & {
  onKeyPointSelect?: (id: string) => void;
}) => {
  if (
    annotation.region?.shape === 'points' &&
    annotation.region.vertices.length
  ) {
    return (
      <Collapse accordion>
        <StyledCollapsePanel
          header={
            <AnnotationTableRow
              annotation={annotation}
              onSelect={onSelect}
              onDelete={onDelete}
              onApprove={onApprove}
              onVisibilityChange={onVisibilityChange}
              iconComponent={iconComponent}
              borderColor={borderColor}
            />
          }
          key={1}
          className={annotation.selected ? 'active' : ''}
        >
          {annotation.region.vertices.map((keypoint) => (
            <CollapseRowContainer
              key={(keypoint as KeypointVertex).id}
              onClick={() => {
                if (onKeyPointSelect) {
                  onKeyPointSelect((keypoint as KeypointVertex).id);
                }
              }}
              className={(keypoint as KeypointVertex).selected ? 'active' : ''}
            >
              <StyledRow cols={12}>
                <StyledCol span={1}>
                  <ColorBox color={(keypoint as KeypointVertex).color} />
                </StyledCol>
                <StyledCol span={1}>
                  <div>{(keypoint as KeypointVertex).order}</div>
                </StyledCol>
                <StyledCol span={10} className="label">
                  <AnnotationTextContainer>
                    <AnnotationText>
                      {(keypoint as KeypointVertex).caption}
                    </AnnotationText>
                  </AnnotationTextContainer>
                </StyledCol>
                {/* <StyledCol span={1}> */}
                {/*  <AnnotationActionMenuExtended */}
                {/*    showPolygon={annotation.show} */}
                {/*    disableShowPolygon={false} */}
                {/*    handleAnnotationDelete={() => { */}
                {/*      if (onKeyPointDelete) { */}
                {/*        onKeyPointDelete((keypoint as KeypointVertex).id); */}
                {/*      } */}
                {/*    }} */}
                {/*    deleteMenuText="Delete keypoint" */}
                {/*    deleteConfirmText="Are you sure you want to delete this keypoint?" */}
                {/*  /> */}
                {/* </StyledCol> */}
              </StyledRow>
            </CollapseRowContainer>
          ))}
        </StyledCollapsePanel>
      </Collapse>
    );
  }
  return (
    <TableRowContainer className={annotation.selected ? 'active' : ''}>
      <AnnotationTableRow
        annotation={annotation}
        onSelect={onSelect}
        onDelete={onDelete}
        onApprove={onApprove}
        onVisibilityChange={onVisibilityChange}
        iconComponent={iconComponent}
        borderColor={borderColor}
      />
    </TableRowContainer>
  );
};

const TableRowContainer = styled.div`
  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
  }
`;

const CollapseRowContainer = styled.div`
  padding: 0 30px;

  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
  }
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  .rc-collapse-header {
    padding: 0 0 0 16px;
  }
  .rc-collapse-content {
    padding: 0;
  }
  .rc-collapse-content-box {
    margin: 0;
    width: 100%;
  }

  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
  }
`;
