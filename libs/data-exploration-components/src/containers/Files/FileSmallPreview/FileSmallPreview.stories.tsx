import React from 'react';

import { sdkMock } from '../../../docs/stub';
import { assets } from '../../../stubs/assets';
import { events } from '../../../stubs/events';
import { files } from '../../../stubs/files';

import { FileSmallPreview } from './FileSmallPreview';

const tempSdk = {
  ...sdkMock,
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      return { data: { items: [files[0]] } };
    }
    if (query.includes('assets')) {
      return { data: { items: [assets[0], assets[1], assets[2]] } };
    }
    if (query.includes('events')) {
      return {
        data: {
          items:
            events.find(
              (evt) => evt?.metadata?.CDF_ANNOTATION_resource_type === 'asset'
            ) || [],
        },
      };
    }
    return { data: { items: [] } };
  },
};

export default {
  title: 'Files/FileSmallPreview',
  component: FileSmallPreview,
  explorerConfig: { sdkMockOverride: tempSdk },
};

export const Example = () => <FileSmallPreview fileId={files[0].id} />;
