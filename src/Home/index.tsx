import React from 'react';
import { Icons } from '@cognite/cogs.js';
import Extractors from './Extractors';

export default {
  name: 'Extractors',
  path: '/extractors',
  icon: <Icons.Export />,
  component: Extractors,
  shortDescription:
    'Download extractors to ingest data from your source systems',
  description: (
    <p>
      Download official Cognite extractors to gather data from many popular
      source systems, such as OSIsoft PI, OPC-UA, OpenText Documentum or D2, and
      relational databases.
    </p>
  ),
  isAuthorized: (_: any) => true,
  accessInstructions: '',
  shouldRender: () => true,
  subpages: [
    {
      name: 'Duplicate', // Only created to show subPage functionality
      component: Extractors,
      icon: 'cluster',
      path: '/extractors/duplicate',
      showInMenu: true,
    },
  ],
};
