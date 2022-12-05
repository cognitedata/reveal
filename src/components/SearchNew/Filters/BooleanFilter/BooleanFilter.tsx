import React from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

export const BooleanFilter = ({
  title,
  value,
  setValue,
}: {
  title: string;
  value: boolean | undefined;
  setValue: (newValue: boolean | undefined) => void;
}) => {
  const trackUsage = useMetrics();

  const currentChecked = (() => {
    if (value === undefined) {
      return 'unset';
    }
    if (value) {
      return 'true';
    }
    return 'false';
  })();

  const setUploaded = (newValue?: boolean) => {
    setValue(newValue);
  };

  const handleButtonClick = (key: string) => {
    if (key === 'unset') {
      setUploaded(undefined);
    } else if (key === 'true') {
      setUploaded(true);
    } else {
      setUploaded(false);
    }
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.BOOLEAN_FILTER, {
      value: key,
      title,
    });
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <SegmentedControl
        fullWidth
        currentKey={currentChecked}
        onButtonClicked={handleButtonClick}
      >
        <SegmentedControl.Button key="unset" style={{ flex: 1 }}>
          All
        </SegmentedControl.Button>
        <SegmentedControl.Button key="true" style={{ flex: 1 }}>
          True
        </SegmentedControl.Button>
        <SegmentedControl.Button key="false" style={{ flex: 1 }}>
          False
        </SegmentedControl.Button>
      </SegmentedControl>
    </>
  );
};
