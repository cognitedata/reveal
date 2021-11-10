import React from 'react';
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
}: {
  onCancel: () => void;
}) => {
  const dispatch = useDispatch();
  const collections = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.predefinedAnnotations
  );

  const setCollections = (collection: AnnotationCollection) => {
    dispatch(SaveAnnotationTemplates(collection));
  };

  return (
    <>
      <Title level={4} as="h1" style={{ paddingBottom: '16px' }}>
        Annotation settings
      </Title>
      <Detail style={{ paddingBottom: '16px' }}>
        Create pre-defined annotations that can be used when creating manual
        annotations. Individual points can be created under a shared group.
      </Detail>
      <Tabs style={{ overflow: 'visible' }}>
        <Tabs.TabPane tab="Pre-defined Shapes" key="pre-defined-shapes">
          <Body>
            <Shapes collections={collections} setCollections={setCollections} />
          </Body>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pre-defined Points" key="pre-defined-points">
          <Body>
            <Keypoints
              collections={collections}
              setCollections={setCollections}
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
