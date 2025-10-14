import { useState, useCallback, useEffect, useContext } from 'react';
import { type Cognite3DViewer, type DataSourceType, type Image360 } from '@cognite/reveal';
import { UseImage360EntityContext } from './useImage360Entity.context';

export const useImage360Entity = (
  viewer: Cognite3DViewer<DataSourceType>
): Image360<DataSourceType> | undefined => {
  const { useImage360Collections } = useContext(UseImage360EntityContext);
  const [enteredEntity, setEnteredEntity] = useState<Image360<DataSourceType> | undefined>();

  const clearEnteredImage360 = useCallback((): void => {
    setEnteredEntity(undefined);
  }, [setEnteredEntity]);

  const collections = useImage360Collections();

  useEffect(() => {
    collections.forEach((collection) => {
      collection.on('image360Entered', setEnteredEntity);
      collection.on('image360Exited', clearEnteredImage360);
    });
    return () => {
      collections.forEach((collection) => {
        collection.off('image360Entered', setEnteredEntity);
        collection.off('image360Exited', clearEnteredImage360);
      });
    };
  }, [viewer, collections, setEnteredEntity, clearEnteredImage360]);

  return enteredEntity;
};
