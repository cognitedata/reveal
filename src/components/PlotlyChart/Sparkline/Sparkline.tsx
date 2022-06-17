import { Skeleton } from 'antd';
import PlotlyChart from '../PlotlyChart';

interface Props {
  /** Hex color for the line. Default is blue `#0000FF` */
  color?: string;
  /** Array of datapoints if `value` is passed, the datapoints will have a marker */
  datapoints: (
    | {
        timestamp: Date;
        min?: number;
        max?: number;
        average: number;
      }
    | {
        timestamp: Date;
        value: number;
      }
  )[];
  /** Loading state for the chart. Default is `false` */
  loading?: boolean;
  /** Width of the sparkline container */
  width: number;
  /** Height of the sparkline container */
  height: number;
  /** Start date for displaying datapoints */
  startDate: Date;
  /** End date for displaying datapoints */
  endDate: Date;
}

const Sparkline = ({
  color = '#0000FF',
  datapoints,
  loading = false,
  width,
  height,
  startDate,
  endDate,
}: Props) => {
  return (
    <div style={{ width, height }}>
      {loading ? (
        <Skeleton.Image style={{ width, height }} />
      ) : (
        <PlotlyChart
          isPreview
          isMinMaxShown
          dateFrom={startDate.toISOString()}
          dateTo={endDate.toISOString()}
          timeseries={[
            {
              id: 'aregrfrest',
              tsExternalId: 'timeseries',
              name: 'timeseries',
              color,
              tsId: 125453153,
              enabled: true,
              createdAt: new Date().getTime(),
            },
          ]}
          timeseriesData={[
            {
              externalId: 'timeseries',
              loading: false,
              series: {
                id: 125453153,
                externalId: 'timeseries',
                isString: false,
                isStep: false,
                datapoints,
              },
            },
          ]}
          isYAxisShown={false}
          onPlotNavigation={() => {}}
          plotlyProps={(prop) => {
            prop.layout.paper_bgcolor = 'rgba(0,0,0,0)';
            prop.layout.plot_bgcolor = 'rgba(0,0,0,0)';
            return prop;
          }}
        />
      )}
    </div>
  );
};

export default Sparkline;
