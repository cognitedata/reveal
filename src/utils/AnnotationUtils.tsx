import { AnnotationBoundingBox, CogniteAnnotation } from '@cognite/annotations';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAssets,
  retrieveExternal as retrieveExternalAssets,
} from 'modules/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
  retrieveExternal as retrieveExternalTimeseries,
} from 'modules/timeseries';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
  retrieveExternal as retrieveExternalFiles,
} from 'modules/files';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequences,
  retrieveExternal as retrieveExternalSequences,
} from 'modules/sequences';
import { useSelector } from 'react-redux';
import { ResourceItem } from 'types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';

export const useResourceItemFromAnnotation = (
  annotation?: CogniteAnnotation | ProposedCogniteAnnotation
): ResourceItem | undefined => {
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  let resourceItem: ResourceItem | undefined;
  if (annotation) {
    switch (annotation.resourceType) {
      case 'asset': {
        const asset = getAsset(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (asset) {
          resourceItem = { id: asset.id, type: 'asset' };
        }
        break;
      }
      case 'timeSeries': {
        const ts = getTimeseries(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (ts) {
          resourceItem = { id: ts.id, type: 'timeSeries' };
        }
        break;
      }
      case 'file': {
        const selectedFile = getFile(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (selectedFile) {
          resourceItem = { id: selectedFile.id, type: 'file' };
        }
        break;
      }
      case 'sequence': {
        const sequence = getSequence(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (sequence) {
          resourceItem = { id: sequence.id, type: 'sequence' };
        }
        break;
      }
    }
  }
  return resourceItem;
};

export const fetchResourceForAnnotation = (
  annotation?: CogniteAnnotation | ProposedCogniteAnnotation
) => (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  if (annotation) {
    const { resourceId, resourceExternalId } = annotation;
    switch (annotation.resourceType) {
      case 'asset': {
        if (resourceExternalId) {
          dispatch(
            retrieveExternalAssets([{ externalId: resourceExternalId! }])
          );
        } else if (resourceId) {
          dispatch(retrieveAssets([{ id: resourceId! }]));
        }
        break;
      }
      case 'timeSeries': {
        if (resourceExternalId) {
          dispatch(
            retrieveExternalTimeseries([{ externalId: resourceExternalId! }])
          );
        } else if (resourceId) {
          dispatch(retrieveTimeseries([{ id: resourceId! }]));
        }
        break;
      }
      case 'file': {
        if (resourceExternalId) {
          dispatch(
            retrieveExternalFiles([{ externalId: resourceExternalId! }])
          );
        } else if (resourceId) {
          dispatch(retrieveFiles([{ id: resourceId! }]));
        }
        break;
      }
      case 'sequence': {
        if (resourceExternalId) {
          dispatch(
            retrieveExternalSequences([{ externalId: resourceExternalId! }])
          );
        } else if (resourceId) {
          dispatch(retrieveSequences([{ id: resourceId! }]));
        }
        break;
      }
    }
  }
};

export const PNID_ANNOTATION_TYPE = 'pnid_annotation';

export const isSimilarBoundingBox = (
  origBox: AnnotationBoundingBox,
  compBox: AnnotationBoundingBox,
  percentDiff = 0.1,
  smallerOnly = false
) => {
  const { xMax, xMin, yMax, yMin } = origBox;
  // check right
  if (
    compBox.xMax <= (smallerOnly ? xMax : xMax * (1 + percentDiff)) &&
    compBox.xMax >= xMax * (1 - percentDiff)
  ) {
    // check bottom
    if (
      compBox.yMax <= (smallerOnly ? yMax : yMax * (1 + percentDiff)) &&
      compBox.yMax >= yMax * (1 - percentDiff)
    ) {
      // check left
      if (
        compBox.xMin >= (smallerOnly ? xMin : xMin * (1 - percentDiff)) &&
        compBox.xMin <= xMin * (1 + percentDiff)
      ) {
        // check top
        if (
          compBox.yMin >= (smallerOnly ? yMin : yMin * (1 - percentDiff)) &&
          compBox.yMin <= yMin * (1 + percentDiff)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};
