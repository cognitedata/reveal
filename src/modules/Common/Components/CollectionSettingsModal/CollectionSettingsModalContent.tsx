import React, { useState } from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Shapes } from './Body/Shapes';
import { predefinedKeypoints, predefinedShapes } from './mockData';
import { AnnotationCollection } from './CollectionSettingsTypes';
import { Keypoints } from './Body/Keypoints';

export const CollectionSettingsModalContent = ({
  onCancel,
}: {
  onCancel: () => void;
}) => {
  const [collections, setCollections] = useState<AnnotationCollection>({
    predefinedKeypoints,
    predefinedShapes,
  });
  return (
    <>
      <Title level={4} as="h1">
        Collection settings
      </Title>
      <Body>
        <LeftBody>
          <Keypoints
            collections={collections}
            setCollections={setCollections}
          />
        </LeftBody>
        <RightBody>
          <Shapes collections={collections} setCollections={setCollections} />
        </RightBody>
      </Body>
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
          <Button
            type="primary"
            onClick={() => {
              console.error('Not Implemented');
            }}
          >
            Done
          </Button>
        </RightFooter>
      </Footer>
    </>
  );
};

const Body = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 8px;
  margin: 17px 0px;
`;
const LeftBody = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 5px;
`;
const RightBody = styled.div`
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
