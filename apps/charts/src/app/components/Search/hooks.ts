import { AxisUpdate } from '@charts-app/components/PlotlyChart/utils';
import { useAddToRecentLocalStorage } from '@charts-app/hooks/recently-used';
import chartAtom from '@charts-app/models/chart/atom';
import {
  removeTimeseries,
  convertTSToChartTS,
  addTimeseries,
  updateSourceAxisForChart,
} from '@charts-app/models/chart/updates';
import { calculateDefaultYAxis } from '@charts-app/utils/axis';
import { useRecoilState } from 'recoil';

import { Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useAddRemoveTimeseries = () => {
  const sdk = useSDK();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { addAssetToRecent, addTimeseriesToRecent } =
    useAddToRecentLocalStorage();

  return async (
    ts: Pick<
      Timeseries,
      | 'assetId'
      | 'id'
      | 'externalId'
      | 'name'
      | 'unit'
      | 'isStep'
      | 'description'
    >
  ) => {
    if (!chart) {
      return;
    }

    const tsToRemove = chart.timeSeriesCollection?.find(
      (t) => t.tsExternalId === ts.externalId
    );

    if (tsToRemove) {
      setChart((oldChart) => removeTimeseries(oldChart!, tsToRemove.id));
    } else {
      const newTs = convertTSToChartTS(ts, chart.id, []);
      setChart((oldChart) => addTimeseries(oldChart!, newTs));

      if (ts.assetId) {
        // add both asset and ts if asset exists
        addAssetToRecent(ts.assetId, ts.id);
      } else {
        addTimeseriesToRecent(ts.id);
      }

      // Calculate y-axis / range
      const range = await calculateDefaultYAxis({
        chart,
        sdk,
        timeSeriesExternalId: ts.externalId || '',
      });

      const axisUpdate: AxisUpdate = {
        id: newTs.id,
        type: 'timeseries',
        range,
      };

      // Update y axis when ready
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, { x: [], y: [axisUpdate] })
      );
    }
  };
};
