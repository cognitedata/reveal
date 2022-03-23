import { AllIconTypes, Collapse, Icon } from '@cognite/cogs.js';
import {
  AnnotationStatus,
  ModelTypeIconMap,
  ModelTypeStyleMap,
} from 'src/utils/AnnotationUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import React, { ReactText } from 'react';
import styled from 'styled-components';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { FileInfo } from '@cognite/sdk';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { ExpandIconComponent } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/ExpandIconComponent';

export type ReviewAnnotation = Omit<VisibleAnnotation, 'id'> & {
  id: string | number;
};
export type VirtualizedAnnotationsReviewPanel = {
  title: string;
  annotations: ReviewAnnotation[];
  mode: VisionDetectionModelType;
  selected: boolean;
  component: React.FunctionComponent<{
    annotation: ReviewAnnotation;
    file?: FileInfo;
    annotations?: ReviewAnnotation[];
  }>;
  emptyPlaceholder: string;
};

export type AnnotationReviewCallbacks = {
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApproveStateChange: (id: ReactText, status: AnnotationStatus) => void;
  onKeypointSelect?: (id: string) => void;
};

export type AnnotationReviewProps = AnnotationReviewCallbacks & {
  annotation: AnnotationTableItem;
  expandByDefault?: boolean;
};

export const VirtualizedAnnotationsReview = ({
  file,
  childContainers,
}: {
  file: FileInfo;
  childContainers: (VirtualizedAnnotationsReviewPanel &
    AnnotationReviewCallbacks)[];
}) => {
  return (
    <CustomizedCollapse
      accordion
      expandIcon={ExpandIconComponent}
      defaultActiveKey="1"
    >
      {childContainers.map((child, index) => {
        const {
          mode,
          annotations,
          component,
          emptyPlaceholder,
          ...childProps
        } = child;

        return (
          <Collapse.Panel
            header={
              <PanelHeader>
                <IconContainer
                  background={ModelTypeStyleMap[mode].backgroundColor}
                >
                  <Icon
                    style={{
                      color: ModelTypeStyleMap[mode].color,
                      flex: '0 0 16px',
                    }}
                    type={ModelTypeIconMap[mode] as AllIconTypes}
                  />
                </IconContainer>
                <span>
                  {child.title} ({annotations.length})
                </span>
              </PanelHeader>
            }
            key={`${index + 1}`}
          >
            <Body>
              {annotations.length ? (
                annotations.map((annotation) => {
                  return (
                    <React.Fragment key={annotation.id}>
                      {React.createElement(component, {
                        annotation,
                        annotations,
                        file,
                        ...childProps,
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <SidePanelRow>
                  <EmptyPlaceHolderContainer>
                    <span>{emptyPlaceholder}</span>
                  </EmptyPlaceHolderContainer>
                </SidePanelRow>
              )}
            </Body>
          </Collapse.Panel>
        );
      })}
    </CustomizedCollapse>
  );
};

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
`;

interface IconContainerProps {
  background: string;
}

const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: ${(props) =>
    props.background ? props.background : '#fcf5fd'};
`;

const Body = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const EmptyPlaceHolderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-left: 34px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;

const CustomizedCollapse = styled(Collapse)`
  background: #ffffff;
  & > .rc-collapse-item {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    overflow: auto;
    margin-bottom: 16px;
  }
  & > .rc-collapse-item > .rc-collapse-header {
    background: #ffffff;
    padding: 4px;
  }
  & > .rc-collapse-item > .rc-collapse-content {
    padding: 0;
  }
  & > .rc-collapse-item > .rc-collapse-content .rc-collapse-content-box {
    margin: 0;
  }
`;
