import React from 'react';
import { GetTimeSeriesMetadataDTO } from '@cognite/sdk';
import { TimeseriesDetailsAbstract } from 'components/Common';
import { Button } from '@cognite/cogs.js';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

export const TimeseriesHoverPreview = ({
  timeseries,
  actions,
  extras,
  disableSidebarToggle = false,
}: {
  timeseries: GetTimeSeriesMetadataDTO;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  disableSidebarToggle?: boolean;
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <TimeseriesDetailsAbstract
      key={timeseries.id}
      timeSeries={timeseries}
      extras={extras}
      actions={
        disableSidebarToggle
          ? actions
          : [
              <Button
                icon="Expand"
                key="open"
                onClick={() =>
                  dispatch(
                    onResourceSelected(
                      {
                        timeseriesId: timeseries.id,
                        showSidebar: true,
                      },
                      history
                    )
                  )
                }
              >
                View
              </Button>,
              ...(actions || []),
            ]
      }
    />
  );
};
