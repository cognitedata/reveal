import * as React from 'react';
import isEmpty from 'lodash/isEmpty';

import { resetDrawState } from '../utils/resetDrawState';
import { useTouchedEvent } from '../events/useTouchedEvent';
import { getRightMostPoint } from '../utils/getRightMostPoint';
import { MapPopup } from '../MapPopup';
import { MapAddedProps } from '../types';

import { FloatingActions } from './FloatingActions';

type SearchClicked = ({
  drawnFeatures,
  selectedFeatures,
}: {
  drawnFeatures: MapAddedProps['drawnFeatures'];
  selectedFeatures: MapAddedProps['selectedFeatures'];
}) => void;

export const FloatingActionsPopup: React.FC<
  MapAddedProps & {
    onSearchClicked: SearchClicked;
    onDeleteClicked?: () => void; // notify implementing component
  }
> = (props) => {
  const {
    map,
    selectedFeatures,
    drawnFeatures,
    onSearchClicked,
    onDeleteClicked,
  } = props;
  const { touched } = useTouchedEvent();
  const hasNoUserSelections = isEmpty(selectedFeatures);

  const handleDelete = () => {
    resetDrawState(props);
    if (onDeleteClicked) {
      onDeleteClicked();
    }
  };

  const handleSearch = () => {
    onSearchClicked({ selectedFeatures, drawnFeatures });
  };

  if (hasNoUserSelections || !map) {
    return null;
  }

  // typescript wants this check more explicit
  // even though it's nicely covered with hasNoUserSelections
  if (!selectedFeatures) {
    return null;
  }

  // we need to comment why we check for this:
  // i'm guessing it makes tablet/mobile usage possible?
  if (touched) {
    return null;
  }

  const rightMostPoint = getRightMostPoint(map, selectedFeatures[0]);

  // keeping this old method around, as might be useful in the future if the 'MapPopup' is acting weird.
  // const coords = map.project(rightMostPoint.geometry.coordinates);

  return (
    <MapPopup point={rightMostPoint.geometry} map={map}>
      <FloatingActions
        onSearchClicked={handleSearch}
        onDeleteClicked={handleDelete}
      />
    </MapPopup>
  );
};
