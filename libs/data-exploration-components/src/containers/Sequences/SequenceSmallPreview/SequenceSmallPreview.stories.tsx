import { sequences } from '@data-exploration-lib/core';
import React from 'react';
import { SequenceSmallPreview } from './SequenceSmallPreview';

export default {
  title: 'Sequences/SequenceSmallPreview',
  component: SequenceSmallPreview,
};
export const Example = () => (
  <SequenceSmallPreview sequenceId={sequences[0].id} />
);
