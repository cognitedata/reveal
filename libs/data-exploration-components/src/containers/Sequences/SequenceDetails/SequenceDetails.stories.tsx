import { sequences } from '@data-exploration-lib/core';
import React from 'react';
import { SequenceDetails } from './SequenceDetails';

export default {
  title: 'Sequences/SequenceDetails',
  component: SequenceDetails,
};
export const Example = () => <SequenceDetails sequence={sequences[0]} />;
