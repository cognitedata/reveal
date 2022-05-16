import { CogniteClient } from '@cognite/sdk';

import { OrnateFileURLConfig } from './file-url';
import { OrnateFileAnnotation } from './types';

export const getFileFromCDF =
  (sdk: CogniteClient) => (config: OrnateFileURLConfig) => {
    const { externalId, id } = config.fileReference || {};

    if (!externalId && !id) {
      throw new Error('Config has no CDF file reference, could not load');
    }
    return sdk.files
      .getDownloadUrls(externalId ? [{ externalId }] : [{ id: Number(id) }])
      .then((res) => res[0].downloadUrl);
  };

export type RawCDFBox = {
  xMax: string;
  yMax: string;
  xMin: string;
  yMin: string;
};

export const getAnnotationsFromCDF =
  (sdk: CogniteClient) => async (config: OrnateFileURLConfig) => {
    const { externalId, id } = config.fileReference || {};

    if (!externalId && !id) {
      throw new Error('Config has no CDF file reference, could not load');
    }

    const metadata: Record<string, string> = {};
    if (id) {
      metadata.CDF_ANNOTATION_file_id = String(id);
    } else if (externalId) {
      metadata.CDF_ANNOTATION_file_external_id = String(externalId);
    } else {
      // eslint-disable-next-line no-console
      console.warn('File reference required');
      return [];
    }

    return sdk.events
      .list({
        filter: {
          type: 'cognite_annotation',
          metadata,
        },
      })
      .then((res) =>
        res.items.map<OrnateFileAnnotation>((event) => {
          const rawBox: RawCDFBox = JSON.parse(
            event.metadata?.CDF_ANNOTATION_box || '{}'
          );
          return {
            id: `${config.id}-${event.id}`,
            x: Number(rawBox.xMin),
            y: Number(rawBox.yMin),
            width: Number(rawBox.xMax) - Number(rawBox.xMin),
            height: Number(rawBox.yMax) - Number(rawBox.yMin),
            resourceType:
              event.metadata?.CDF_ANNOTATION_resource_type || 'unknown',
            metadata: {
              assetId: event.metadata?.CDF_ANNOTATION_resource_id,
              assetExternalId: event.metadata?.CDF_ANNOTATION_resource_type,
            },
          };
        })
      );
  };
