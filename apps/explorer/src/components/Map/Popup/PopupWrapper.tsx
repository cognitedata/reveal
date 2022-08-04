import React, { useContext, useEffect } from 'react';

import { MapContext } from '../MapProvider';

import { Content, Container } from './elements';

export const PopupWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { modelRef } = useContext(MapContext);
  const cleanupFunction = () => {
    if (modelRef) {
      modelRef.current.styledNodeCollections.forEach((styledNodeCollection) => {
        if (styledNodeCollection.appearance.visible) {
          modelRef.current.unassignStyledNodeCollection(
            styledNodeCollection.nodeCollection
          );
        }
      });
    }
  };

  useEffect(() => cleanupFunction, []);

  return (
    <Container>
      <Content className="z-2">{children} </Content>
    </Container>
  );
};
