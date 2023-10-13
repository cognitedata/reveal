import React from 'react';

import { UserAction } from '../../../lib/types';

import { ChainSelectionActionRenderer } from './ChainSelectionActionRenderer';
import { DataModelActionRenderer } from './DataModelActionRenderer';
import { TextActionRenderer } from './TextActionRenderer';

export const actionRenderers: {
  [key in UserAction['type'] | 'none' | 'chain']: any;
} = {
  none: () => <TextActionRenderer disabled />,
  'data-model': DataModelActionRenderer,
  text: TextActionRenderer,
  chain: ChainSelectionActionRenderer,
};
