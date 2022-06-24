import React, { useEffect, useState } from 'react';
import { Button, Detail, Tabs, Title } from '@cognite/cogs.js';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from 'src/modules/Review/types';
import styled from 'styled-components';
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
    activeView: 'keypoint' | 'shape';
  };
}) => {
  const [activeView, setActiveView] = useState<string>(
    options?.activeView || 'shape'
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
        Create pre-defined annotations that can be used when creating manual
        annotations. Individual points can be created under a shared group.
      </Detail>
      <Tabs
        style={{ overflow: 'visible' }}
        activeKey={activeView}
        onChange={(activeKey) => setActiveView(activeKey)}
      >
        <Tabs.TabPane tab="Pre-defined Shapes" key="shape">
          <Body>
            <Shapes
              predefinedShapes={predefinedAnnotations.predefinedShapes}
              unsavedShapes={newCollection.predefinedShapes}
              setUnsavedShapes={setUnsavedShapes}
              options={options?.activeView === 'shape' ? options : undefined}
              creationInProgress={setShapesInProgressState}
            />
          </Body>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pre-defined Points" key="keypoint">
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
