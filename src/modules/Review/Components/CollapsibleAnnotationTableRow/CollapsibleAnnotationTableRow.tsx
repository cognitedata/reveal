import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotatationTableRow/AnnotationTableRow';
import React from 'react';
import { Col, Collapse, Row } from '@cognite/cogs.js';
import styled from 'styled-components';
import { KeypointVertex } from 'src/utils/AnnotationUtils';

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

const ColorContainer = styled.div`
  height: 100%;
  width: 168px;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const AnnotationTextContainer = styled.div`
  width: 255px;
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
            />
          }
          key={1}
        >
          {annotation.region.vertices.map((keypoint) => (
            <StyledRow
              cols={6}
              key={(keypoint as KeypointVertex).id}
              onClick={() => {
                if (onKeyPointSelect) {
                  onKeyPointSelect((keypoint as KeypointVertex).id);
                }
              }}
              className={(keypoint as KeypointVertex).selected ? 'active' : ''}
            >
              <StyledCol span={2}>
                <ColorContainer>
                  <ColorBox color={(keypoint as KeypointVertex).color} />
                  <div>{(keypoint as KeypointVertex).order}</div>
                </ColorContainer>
              </StyledCol>
              <StyledCol span={3}>
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
          ))}
        </StyledCollapsePanel>
      </Collapse>
    );
  }
  return (
    <TableRowContainer>
      <AnnotationTableRow
        annotation={annotation}
        onSelect={onSelect}
        onDelete={onDelete}
        onApprove={onApprove}
        onVisibilityChange={onVisibilityChange}
      />
    </TableRowContainer>
  );
};

const TableRowContainer = styled.div`
  padding: 0 16px 0 28px;
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  .rc-collapse-header {
    padding: 0 16px;
  }
  .rc-collapse-content {
    padding: 0 16px 0 28px;
  }
  .rc-collapse-content-box {
    margin: 0;
    width: 100%;
  }
`;
