import React, { useEffect, useState } from 'react';
import { Button, Detail, Tabs, Title } from '@cognite/cogs.js';
import { AnnotationCollection } from 'src/modules/Review/types';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Shapes } from './Body/Shapes';
import { Keypoints } from './Body/Keypoints';

export const AnnotationSettingsModalContent = ({
  onCancel,
  options,
}: {
  onCancel: () => void;
  options?: {
    createNew: { text?: string; color?: string };
    activeView: 'keypoint' | 'shape';
  };
}) => {
  const dispatch = useDispatch();
  const collections = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.predefinedAnnotations
  );
  const [activeView, setActiveView] = useState<string>(
    options?.activeView || 'shape'
  );

  const setCollections = (collection: AnnotationCollection) => {
    dispatch(SaveAnnotationTemplates(collection));
  };

  useEffect(() => {
    if (options && options.activeView !== activeView) {
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
              collections={collections}
              setCollections={setCollections}
              options={options}
            />
          </Body>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pre-defined Points" key="keypoint">
          <Body>
            <Keypoints
              collections={collections}
              setCollections={setCollections}
              options={options}
            />
          </Body>
        </Tabs.TabPane>
      </Tabs>
      <Footer>
        <LeftFooter>
          {/* ToDo: fix upload labels button */}
          {/* <Button
            type="tertiary"
            icon="Upload"
            onClick={() => {
              console.error('Not Implemented');
            }}
          >
            Upload labels
          </Button> */}
        </LeftFooter>
        <RightFooter>
          <Button type="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={onCancel}>
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
