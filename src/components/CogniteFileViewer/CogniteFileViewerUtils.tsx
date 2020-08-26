import {
  PendingCogniteAnnotation,
  getPnIDAnnotationType,
  CogniteAnnotation,
} from '@cognite/annotations';
import { Colors } from '@cognite/cogs.js';

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
import { ProposedCogniteAnnotation } from './CogniteFileViewer';

export const selectAnnotationColor = <T extends PendingCogniteAnnotation>(
  annotation: T,
  isSelected = false
) => {
  if (isSelected) {
    return Colors.midblue.hex();
  }
  // Assets are purple
  if (annotation.resourceType === 'asset') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['purple-3'].hex();
    }
    return Colors['purple-2'].hex();
  }

  // Files are orange
  if (annotation.resourceType === 'file') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['midorange-3'].hex();
    }
    return Colors['midorange-2'].hex();
  }

  // TS are light blue
  if (annotation.resourceType === 'timeSeries') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['lightblue-3'].hex();
    }
    return Colors['lightblue-2'].hex();
  }

  // Sequences are yellow
  if (annotation.resourceType === 'sequence') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['yellow-3'].hex();
    }
    return Colors['yellow-2'].hex();
  }

  // Events are pink
  if (annotation.resourceType === 'event') {
    if (getPnIDAnnotationType(annotation).includes('Model')) {
      return Colors['pink-3'].hex();
    }
    return Colors['pink-2'].hex();
  }

  // Undefined are secondary
  return Colors['text-color-secondary'].hex();
};

export const getPnIdAnnotationCategories = <T extends PendingCogniteAnnotation>(
  annotations: T[]
) =>
  annotations.reduce(
    (prev, el) => {
      const type = getPnIDAnnotationType(el);
      if (el.resourceType === 'asset') {
        if (!prev.Asset.items[type]) {
          prev.Asset.items[type] = [];
        }
        prev.Asset.items[type].push(el);
        prev.Asset.count += 1;
      } else if (el.resourceType === 'file') {
        if (!prev.File.items[type]) {
          prev.File.items[type] = [];
        }
        prev.File.items[type].push(el);
        prev.File.count += 1;
      } else {
        if (!prev.Unclassified.items[type]) {
          prev.Unclassified.items[type] = [];
        }
        prev.Unclassified.items[type].push(el);
        prev.Unclassified.count += 1;
      }
      return prev;
    },
    {
      Asset: { items: {}, count: 0 },
      File: { items: {}, count: 0 },
      Unclassified: { items: {}, count: 0 },
    } as {
      [key: string]: {
        items: { [key: string]: T[] };
        count: number;
      };
    }
  );

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
