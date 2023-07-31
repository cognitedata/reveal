import { Metadata } from '../../../../domain/projectConfig/types';

export const projectConfigMetadata: Metadata = {
  general: {
    label: 'General',
    helpText: 'General Settings for Discover App',
    children: {
      sideBar: { label: 'Side Bar', helpText: 'Side Bar', type: 'number' },
    },
  },
  documents: {
    label: 'Documents',
    helpText: 'This is documents page',
    children: {
      disabled: { label: 'Disabled', type: 'boolean' },
      defaultLimit: { label: 'Default Limit', type: 'number' },
      // This is used to decide whether extract documents by parent path field or directory field
      extractByFilepath: { label: 'Extract by File path', type: 'boolean' },
      filters: {
        // [s: string]: string | string[] | number;
        label: 'Filters', // need to update to api types
        type: 'object',
      },
      wellboreSchematics: {
        label: 'Wellbore Schematics',
        children: {
          supportedFileTypes: { label: 'Supported File Types', type: 'array' },
        },
      },
      showGeometryOnMap: { label: 'Show on Map', type: 'boolean' },
    },
  },
};
