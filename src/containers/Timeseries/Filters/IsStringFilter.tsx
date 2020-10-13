import React, { useCallback, useContext, useMemo } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { Title } from '@cognite/cogs.js';
import { ButtonGroup } from 'components/Common';

export const IsStringFilter = () => {
  const { timeseriesFilter, setTimeseriesFilter } = useContext(
    ResourceSelectionContext
  );
  const currentChecked = useMemo(() => {
    if (timeseriesFilter?.isString === undefined) {
      return 'unset';
    }
    if (timeseriesFilter?.isString) {
      return 'true';
    }
    return 'false';
  }, [timeseriesFilter]);

  const setUploaded = useCallback(
    (value?: boolean) => {
      setTimeseriesFilter(currentFilter => ({
        ...currentFilter,
        isString: value,
      }));
    },
    [setTimeseriesFilter]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        String time series
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
