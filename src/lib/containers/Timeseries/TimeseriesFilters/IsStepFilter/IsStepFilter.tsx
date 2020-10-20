import React, { useCallback, useContext, useMemo } from 'react';
import { Title } from '@cognite/cogs.js';
import { ResourceSelectionContext } from 'lib/context';
import { ButtonGroup } from 'lib/components';

export const IsStepFilter = () => {
  const { timeseriesFilter, setTimeseriesFilter } = useContext(
    ResourceSelectionContext
  );
  const currentChecked = useMemo(() => {
    if (timeseriesFilter?.isStep === undefined) {
      return 'unset';
    }
    if (timeseriesFilter?.isStep) {
      return 'true';
    }
    return 'false';
  }, [timeseriesFilter]);

  const setUploaded = useCallback(
    (value?: boolean) => {
      setTimeseriesFilter(currentFilter => ({
        ...currentFilter,
        isStep: value,
      }));
    },
    [setTimeseriesFilter]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Step time series
      </Title>
      <ButtonGroup
        style={{ width: '100%' }}
        currentKey={currentChecked}
        onButtonClicked={key => {
          if (key === 'unset') {
            setUploaded(undefined);
          } else if (key === 'true') {
            setUploaded(true);
          } else {
            setUploaded(false);
          }
        }}
      >
        <ButtonGroup.Button key="unset">All</ButtonGroup.Button>
        <ButtonGroup.Button key="true">True</ButtonGroup.Button>
        <ButtonGroup.Button key="false">False</ButtonGroup.Button>
      </ButtonGroup>
    </>
  );
};
