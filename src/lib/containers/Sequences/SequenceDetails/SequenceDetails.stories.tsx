import React from 'react';
import { sequences } from 'lib/stubs/sequences';
import { SequenceDetails } from './SequenceDetails';

export default {
  title: 'Sequences/SequenceDetails',
  component: SequenceDetails,
};
export const Example = () => <SequenceDetails sequence={sequences[0]} />;
