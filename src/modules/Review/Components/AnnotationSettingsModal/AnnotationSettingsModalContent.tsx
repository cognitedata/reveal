import React, { useEffect, useState } from 'react';
import { Detail, Tabs } from '@cognite/cogs.js-old';
import { Button, Title } from '@cognite/cogs.js';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from 'src/modules/Review/types';
import styled from 'styled-components';
import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';
import { Shapes } from './Body/Shapes';
import { Keypoints } from './Body/Keypoints';

export const AnnotationSettingsModalContent = ({
  predefinedAnnotations,
  onDone,
  onCancel,
  options,
}: {
  predefinedAnnotations: PredefinedVisionAnnotations;
  onDone: (collection: PredefinedVisionAnnotations) => void;
  onCancel: () => void;
  options?: {
    createNew: { text?: string; color?: string };
    activeView: AnnotationSettingsOption;
  };
}) => {
  const [activeView, setActiveView] = useState<string>(
    options?.activeView || AnnotationSettingsOption.SHAPE
  );

  const [newCollection, setNewCollection] =
    useState<PredefinedVisionAnnotations>({
      predefinedKeypointCollections: [],
      predefinedShapes: [],
    });

  const [shapeCreationInProgress, setShapeCreationInProgress] = useState(false);
  const [keypointCreationInProgress, setKeypointCreationInProgress] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const submitNewCollection = async () => {
    setIsSaving(true);
    await onDone(newCollection);
    setIsSaving(false);
  };

  const setUnsavedShapes = (shapes: PredefinedShape[]) => {
    setNewCollection((collection) => ({
      ...collection,
      predefinedShapes: [...shapes],
    }));
  };

  const setUnsavedKeypointCollections = (
    keypointCollections: PredefinedKeypointCollection[]
  ) => {
    setNewCollection((collection) => ({
      ...collection,
      predefinedKeypointCollections: [...keypointCollections],
    }));
  };

  const setShapesInProgressState = (state: boolean) => {
    setShapeCreationInProgress(state);
  };
  const setKeypointsInProgressState = (state: boolean) => {
    setKeypointCreationInProgress(state);
  };

  useEffect(() => {
    if (options && options?.activeView !== activeView) {
      setActiveView(options.activeView);
    }
  }, [options]);

  return (
    <>
      <Title level={4} as="h1" style={{ paddingBottom: '16px' }}>
        Annotation settings
      </Title>
      <Detail style={{ paddingBottom: '16px' }}>
        Pre-defined shapes and points are annotation labels that have been used
        previously. Choose from the pre-defined list, or create new ones to add
        to the list.
      </Detail>
      <Tabs
        style={{ overflow: 'visible' }}
        activeKey={activeView}
        onChange={(activeKey) => setActiveView(activeKey)}
      >
        <Tabs.TabPane tab="Pre-defined shapes" key="shape">
          <Body>
            <Shapes
              predefinedShapes={predefinedAnnotations.predefinedShapes}
              unsavedShapes={newCollection.predefinedShapes}
              setUnsavedShapes={setUnsavedShapes}
              options={
                options?.activeView === AnnotationSettingsOption.SHAPE
                  ? options
                  : undefined
              }
              creationInProgress={setShapesInProgressState}
            />
          </Body>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pre-defined keypoint collections" key="keypoint">
          <Body>
            <Keypoints
              predefinedKeypointCollections={
                predefinedAnnotations.predefinedKeypointCollections
              }
              unsavedKeypointCollections={
                newCollection.predefinedKeypointCollections
              }
              setUnsavedKeypointCollections={setUnsavedKeypointCollections}
              options={options?.activeView === 'keypoint' ? options : undefined}
              creationInProgress={setKeypointsInProgressState}
            />
          </Body>
        </Tabs.TabPane>
      </Tabs>
      <Footer>
        <LeftFooter />
        <RightFooter>
          <Button type="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={submitNewCollection}
            disabled={shapeCreationInProgress || keypointCreationInProgress}
            loading={isSaving}
          >
            Done
          </Button>
        </RightFooter>
      </Footer>
    </>
  );
};

const Body = styled.div`
  margin: 17px 0;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;
const LeftFooter = styled.div`
  align-self: center;
`;

const RightFooter = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  justify-self: end;
  grid-gap: 6px;
`;
