import React from 'react';
import { sequences } from 'lib/stubs/sequences';
import { SequenceColumns } from './SequenceColumns';

export default {
  title: 'Sequences/SequenceColumns',
  component: SequenceColumns,
};
export const Example = () => <SequenceColumns sequence={sequences[0]} />;
