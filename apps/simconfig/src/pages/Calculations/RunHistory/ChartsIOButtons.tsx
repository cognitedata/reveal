import { useEffect, useContext } from 'react';
import { Button } from '@cognite/cogs.js';
import { selectSelectedEvent } from 'store/event/selectors';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSelectedCalculationConfig } from 'store/file/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { fetchCalculationFile } from 'store/file/thunks';
import {
  selectChartInputLink,
  selectChartOutputLink,
} from 'store/samplingConfiguration/selectors';
import {
  fetchChartsInputLink,
  fetchChartsOutputLink,
} from 'store/samplingConfiguration/thunks';

export const ChartsIOButtons: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cdfClient, authState } = useContext(CdfClientContext);
  const selectedEvent = useAppSelector(selectSelectedEvent);
  const selectedConfig = useAppSelector(selectSelectedCalculationConfig);
  const chartInputLink = useAppSelector(selectChartInputLink);
  const chartOutputLink = useAppSelector(selectChartOutputLink);

  useEffect(() => {
    if (selectedEvent) {
      dispatch(
        fetchCalculationFile({
          client: cdfClient,
          externalId: { externalId: selectedEvent?.metadata?.calcConfig || '' },
        })
      );
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent && selectedConfig) {
      dispatch(
        fetchChartsInputLink({
          currentEvent: selectedEvent,
          calculationConfig: selectedConfig,
          projectName: authState?.project,
        })
      );

      dispatch(
        fetchChartsOutputLink({
          currentEvent: selectedEvent,
          calculationConfig: selectedConfig,
          projectName: authState?.project,
        })
      );
    }
  }, [selectedConfig]);

  return (
    <div className="charts-buttons">
      {chartInputLink && (
        <Button
          type="primary"
          href={chartInputLink}
          target="_blank"
          icon="LineChart"
        >
          Inputs
        </Button>
      )}

      {chartOutputLink && (
        <Button
          type="primary"
          href={chartOutputLink}
          target="_blank"
          icon="LineChart"
        >
          Outputs
        </Button>
      )}
    </div>
  );
};
