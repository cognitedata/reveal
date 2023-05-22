import { sequences } from '@data-exploration-lib/core';
import React from 'react';
import { SequenceInfo } from './SequenceInfo';

export default {
  title: 'Sequences/SequenceInfo',
  component: SequenceInfo,
};
export const Example = () => <SequenceInfo sequence={sequences[0]} />;
