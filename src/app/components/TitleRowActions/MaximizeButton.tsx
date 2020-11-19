import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceItem } from 'lib/types';

export const MaximizeButton = ({ item }: { item: ResourceItem }) => {
  return (
    <Link to={createLink(`/explore/${item.type}/${item.id}`)}>
      <Button variant="outline" icon="Expand" />
    </Link>
  );
};
