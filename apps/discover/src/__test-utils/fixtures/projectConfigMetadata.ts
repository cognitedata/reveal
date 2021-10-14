import { Metadata } from 'pages/authorized/admin/projectConfig/types';
import { Layer } from 'tenants/types';

export const mockProjectConfigMetadata: Metadata = {
  general: {
    label: 'General',
    type: 'object',
    children: {
      sideBar: {
        label: 'Side Bar',
        type: 'number',
      },
    },
  },
  documents: {
    label: 'Documents',
    type: 'object',
    children: {
      disabled: {
        label: 'Disabled',
        type: 'boolean',
      },
    },
  },
  map: {
    label: 'Map',
    type: 'object',
    children: {
      layers: {
        label: 'Layers',
        type: 'array',
        dataAsChildren: true,
        children: {
          name: { label: 'Name', type: 'string' },
          filters: {
            label: 'Filters',
            type: 'object',
            renderAsJSON: true,
            placeholder: 'Filters',
          },
        },
      },
    },
  },
};

export const mockConfigDataWithLayers: { map: { layers: Layer[] } } = {
  map: {
    layers: [
      { name: 'LayerTest 1', color: '#000', defaultOn: false },
      { name: 'LayerTest 2', color: '#fff', defaultOn: true },
    ],
  },
};
