import React from 'react';
import { sequences } from 'stubs/sequences';
import { SequencePreview } from './SequencePreview';

export default {
  title: 'Sequences/SequencePreview',
  component: SequencePreview,
};

export const Example = () => <SequencePreview sequenceId={sequences[0].id} />;
