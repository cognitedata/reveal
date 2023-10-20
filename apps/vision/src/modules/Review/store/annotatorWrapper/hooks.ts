import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../../store/rootReducer';

import { selectTempKeypointCollection } from './selectors';

export const useIsCurrentKeypointCollectionComplete = (fileId: number) => {
  const [isComplete, setIsComplete] = useState(false);
  const tempKeypointCollection = useSelector(
    ({ annotatorWrapperReducer, annotationReducer }: RootState) =>
      selectTempKeypointCollection(annotatorWrapperReducer, {
        currentFileId: fileId,
        annotationColorMap: annotationReducer.annotationColorMap,
      })
  );

  const { predefinedKeypointCollections } = useSelector(
    ({ annotatorWrapperReducer }: RootState) =>
      annotatorWrapperReducer.predefinedAnnotations
  );

  useEffect(() => {
    if (tempKeypointCollection) {
      // check for completeness
      const keypointCollectionTemplate = predefinedKeypointCollections.find(
        (template) =>
          template.collectionName === tempKeypointCollection.data.label
      );

      if (keypointCollectionTemplate) {
        const templateKeypointLabels =
          keypointCollectionTemplate.keypoints!.map(
            (keypoint) => keypoint.caption
          );
        const createdKeypointLabels = Object.keys(
          tempKeypointCollection.data.keypoints
        );
        const notCompletedKeypoints = templateKeypointLabels.filter(
          (keypointLabel) => !createdKeypointLabels.includes(keypointLabel)
        );

        if (notCompletedKeypoints.length === 0) {
          setIsComplete(true);
          return;
        }
      }
    }
    setIsComplete(false);
  }, [tempKeypointCollection, predefinedKeypointCollections]);

  return isComplete;
};