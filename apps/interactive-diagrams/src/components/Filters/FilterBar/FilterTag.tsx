import React from 'react';
import { Chip } from '@cognite/cogs.js';

type FilterProps = {
  id: string | number;
  onClose: () => void;
  content: string;
};

export const FilterTag = ({ onClose, id, content }: FilterProps) => {
  return (
    <Chip
      css={{
        margin: '0 6px 6px 0',
      }}
      key={id}
      label={content}
      onRemove={onClose}
      size="small"
      type="neutral"
    />
  );
};
