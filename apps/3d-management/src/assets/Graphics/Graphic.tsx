import React from 'react';

import { EmptyStateOptions } from '../../pages/AllModels/components/EmptyState/EmptyState';

import Favorites from './EmptyStates/Favorites';
import SearchEmpty from './EmptyStates/SearchEmpty';
import ThreeDModel from './EmptyStates/ThreeDModel';

export const Graphic = ({ type }: { type: EmptyStateOptions }) => {
  switch (type) {
    case EmptyStateOptions.ThreeDModel:
      return <ThreeDModel />;
    case EmptyStateOptions.Favorites:
      return <Favorites />;
    case EmptyStateOptions.SearchEmpty:
    default:
      return <SearchEmpty />;
  }
};
