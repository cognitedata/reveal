import React from 'react';

import Favorites from '@3d-management/assets/Graphics/EmptyStates/Favorites';
import SearchEmpty from '@3d-management/assets/Graphics/EmptyStates/SearchEmpty';
import ThreeDModel from '@3d-management/assets/Graphics/EmptyStates/ThreeDModel';

import { EmptyStateOptions } from '../../pages/AllModels/components/EmptyState/EmptyState';

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
