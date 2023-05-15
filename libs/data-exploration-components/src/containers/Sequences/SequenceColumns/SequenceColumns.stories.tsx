import { sequences } from '@data-exploration-lib/core';
import React from 'react';
import { SequenceColumns } from './SequenceColumns';

export default {
  title: 'Sequences/SequenceColumns',
  component: SequenceColumns,
};
export const Example = () => <SequenceColumns sequence={sequences[0]} />;
