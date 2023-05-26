import React from 'react';

import { sequences } from '@data-exploration-lib/core';

import { SequenceSmallPreview } from './SequenceSmallPreview';

export default {
  title: 'Sequences/SequenceSmallPreview',
  component: SequenceSmallPreview,
};
export const Example = () => (
  <SequenceSmallPreview sequenceId={sequences[0].id} />
);
