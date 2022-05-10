import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { SegmentedControl } from '@cognite/cogs.js';

import { wellInspectActions } from 'modules/wellInspect/actions';

import { VIEW_MODES } from '../constants';

export interface Props {
  activeViewMode: string;
  onChange: (key: string) => void;
}

export const ViewModeSelector: React.FC<Props> = ({
  activeViewMode,
  onChange,
}) => {
  const dispatch = useDispatch();
  const onClick = (key: string) => {
    onChange(key);
    dispatch(
      wellInspectActions.setColoredWellbores(activeViewMode === 'Wells')
    );
  };

  useEffect(() => {
    return () => {
      // Reset wellbore colors on measuments tab unmount
      dispatch(wellInspectActions.setColoredWellbores(false));
    };
  }, []);

  return (
    <SegmentedControl currentKey={activeViewMode} onButtonClicked={onClick}>
      {VIEW_MODES.map((viewMode) => (
        <SegmentedControl.Button key={viewMode}>
          {viewMode}
        </SegmentedControl.Button>
      ))}
    </SegmentedControl>
  );
};
