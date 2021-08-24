import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { SaveAnnotationTemplates } from 'src/store/thunks/SaveAnnotationTemplates';
import { Shapes } from './Body/Shapes';
import { AnnotationCollection } from './CollectionSettingsTypes';
import { Keypoints } from './Body/Keypoints';

export const CollectionSettingsModalContent = ({
  onCancel,
}: {
  onCancel: () => void;
}) => {
  const dispatch = useDispatch();
  const collections = useSelector(
    ({ imagePreviewReducer }: RootState) =>
      imagePreviewReducer.predefinedCollections
  );

  const setCollections = (collection: AnnotationCollection) => {
    dispatch(SaveAnnotationTemplates(collection));
  };

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
          <Button type="primary" onClick={onCancel}>
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
  margin: 17px 0;
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
