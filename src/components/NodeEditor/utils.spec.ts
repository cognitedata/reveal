import {
  ComputationStep,
  TimeSeriesInputTypeEnum,
} from '@cognite/calculation-backend';
import { ChartTimeSeries } from 'models/charts/charts/types/types';
import { fullListOfOperations } from 'models/calculation-backend/operations/mocks';
import {
  getOperationsGroupedByCategory,
  resolveTimeseriesSourceInSteps,
} from './utils';

describe('resolveTimeseriesSourceInSteps', () => {
  it('should resolve timeseries step input values correctly', () => {
    const chartTimeseries: ChartTimeSeries[] = [
      {
        id: 'some-chart-timeseries-id-1',
        name: 'Some Timeseries',
        color: 'red',
        tsId: 1,
        tsExternalId: 'ts-1',
        enabled: true,
        createdAt: 1000,
      },
      {
        id: 'some-chart-timeseries-id-2',
        name: 'Some Timeseries',
        color: 'red',
        tsId: 2,
        tsExternalId: 'ts-2',
        enabled: true,
        createdAt: 1000,
      },
    ];

    const steps: ComputationStep[] = [
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'some-chart-timeseries-id-1',
          },
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'some-chart-timeseries-id-2',
          },
        ],
      },
    ];

    const resolvedSteps = resolveTimeseriesSourceInSteps(
      steps,
      chartTimeseries
    );

    expect(resolvedSteps).toEqual([
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'ts-1',
          },
          {
            type: TimeSeriesInputTypeEnum.Ts,
            value: 'ts-2',
          },
        ],
      },
    ]);
  });
});

describe('getOperationsGroupedByCategory', () => {
  it('should group by category', () => {
    const operationsGroupedByCategory =
      getOperationsGroupedByCategory(fullListOfOperations);

    expect(operationsGroupedByCategory).toEqual({
      'Data quality': [
        {
          category: 'Data quality',
          op: 'extreme',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Outlier detector and removal based on the [paper from Gustavo A. Zarruk](https://iopscience.iop.org/article/10.1088/0957-0233/16/10/012/meta). The procedure is as follows:\n\n * Fit a polynomial curve to the model using all of the data\n * Calculate the studentized deleted (or externally studentized) residuals\n * These residuals follow a t distribution with degrees of freedom n - p - 1\n * Bonferroni critical value can be computed using the significance level (alpha) and t distribution\n * Any values that fall outside of the critical value are treated as anomalies\n\nUse of the hat matrix diagonal allows for the rapid calculation of deleted residuals without having to refit\nthe predictor function each time.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Extreme outliers removal',
              outputs: [
                {
                  description: null,
                  name: 'Time series without outliers.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 0.05,
                  description: null,
                  name: 'Significance level.',
                  options: null,
                  param: 'alpha',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description:
                    'Relaxation factor for the Bonferroni critical value. Smaller values will make anomaly detection more\nconservative. Defaults to 1',
                  name: 'Factor.',
                  options: null,
                  param: 'bc_relaxation',
                  type: 'float',
                },
                {
                  default_value: 3,
                  description:
                    'Order of the polynomial used for the regression function',
                  name: 'Polynomial order.',
                  options: null,
                  param: 'poly_order',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_iqr',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using the [interquartile range (IQR)](https://en.wikipedia.org/wiki/Interquartile_range) method. The IQR is a measure of statistical\ndispersion, which is the spread of the data. Any time steps that are more than 1.5 IQR above Q3 are considered\ngaps in the data.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, IQR',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_modified_z_scores',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using modified Z-scores. Gaps are defined as time periods\nwhere the Z-score is larger than cutoff.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, mod. Z-scores',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 3.5,
                  description:
                    'Time-periods are considered gaps if the modified Z-score is over this cut-off value. Default 3.5.',
                  name: 'Cut-off',
                  options: null,
                  param: 'cutoff',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_z_scores',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using [Z-scores ](https://en.wikipedia.org/wiki/Standard_score). Z-score stands for\nthe number of standard deviations by which the value of a raw score (i.e., an observed value or data point) is\nabove or below the mean value of what is being observed or measured. This method assumes that the time step sizes\nare normally distributed. Gaps are defined as time periods where the Z-score is larger than cutoff.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, Z-scores',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 3,
                  description:
                    'Time periods are considered gaps if the Z-score is over this cut-off value. Default 3.0.',
                  name: 'Cut-off',
                  options: null,
                  param: 'cutoff',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Raise a warning if the data is not normally distributed.\nThe Shapiro-Wilk test is used. The test is only performed if the the time series contains at least 50 data points.',
                  name: 'Test for normality',
                  options: null,
                  param: 'test_normality_assumption',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'negative_running_hours_check',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                "Negative running hours model is created in order to automate data quality check for time series with values that\nshouldn't be decreasing over time. One example would be Running Hours (or Hour Count) time series - a specific type\nof time series that is counting the number of running hours in a pump. Given that we expect the number of running\nhours to either stay the same (if the pump is not running) or increase with time (if the pump is running), the\ndecrease in running hours value indicates bad data quality. Although the algorithm is originally created for\nRunning Hours time series, it can be applied to all time series where the decrease in value is a sign of bad data\nquality.",
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Negative running hours',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a decrease in time series\nvalue, and 0 otherwise. The indicator will be set to 1 until the data gets "back to normal" (that is,\nuntil time series reaches the value it had before the value drop).',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description:
                    'This threshold indicates for how many hours the time series value needs to drop (in hours) before we\nconsider it bad data quality. Threshold must be a non-negative float. By default, the threshold is set to 0.',
                  name: 'Threshold for value drop.',
                  options: null,
                  param: 'threshold',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Detect: [
        {
          category: 'Detect',
          op: 'cpd_ed_pelt',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect change points in a time series. The time series is split into "statistically homogeneous" segments using the\nED Pelt change point detection algorithm while observing the minimum distance argument.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Change Point Detection',
              outputs: [
                {
                  description: 'Binary time series.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description:
                    'Specifies the minimum point wise distance for each segment that will be considered in the Change\nPoint Detection algorithm.',
                  name: 'Minimum distance',
                  options: null,
                  param: 'min_distance',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'drift',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detects data drift (deviation) by comparing two rolling averages, short and long interval, of the signal. The\ndeviation between the short and long term average is considered significant if it is above a given threshold\nmultiplied by the rolling standard deviation of the long term average.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Drift',
              outputs: [
                {
                  description: 'Drift = 1, No drift = 0.',
                  name: 'Boolean time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '3d',
                  description: 'Length of long term time interval.',
                  name: 'Long length.',
                  options: null,
                  param: 'long_interval',
                  type: 'str',
                },
                {
                  default_value: '4h',
                  description: 'Length of short term time interval.',
                  name: 'Short length.',
                  options: null,
                  param: 'short_interval',
                  type: 'str',
                },
                {
                  default_value: 3,
                  description:
                    'Parameter that determines the signal has changed significantly enough to be considered drift. The threshold\nis multiplied by the long term rolling standard deviation to take into account the recent condition of the\nsignal.',
                  name: 'Threshold.',
                  options: null,
                  param: 'std_threshold',
                  type: 'float',
                },
                {
                  default_value: 'both',
                  description:
                    'Parameter to determine if the model should detect significant decreases, increases or both. Options are:\n"decrease", "increase" or "both". Defaults to "both"',
                  name: 'Type.',
                  options: null,
                  param: 'detect',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'ssd_cpd',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect steady state periods in a time series based on a change point detection algorithm. The time series is split\ninto "statistically homogeneous" segments using the ED Pelt change point detection algorithm. Then each segment is tested with regards\nto a normalized standard deviation and the slope of the line of best fit to determine if the segment can be\nconsidered a steady or transient region.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Steady State Detection (CPD)',
              outputs: [
                {
                  description: 'Steady state = 1, Transient = 0.',
                  name: 'Binary time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 15,
                  description:
                    'Specifies the minimum point wise distance for each segment that will be considered in the Change\nPoint Detection algorithm.',
                  name: 'Minimum distance.',
                  options: null,
                  param: 'min_distance',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description:
                    'Specifies the variance threshold. If the normalized variance calculated for a given segment is greater than\nthe threshold, the segment will be labeled as transient (value = 0).',
                  name: 'Variance threshold.',
                  options: null,
                  param: 'var_threshold',
                  type: 'float',
                },
                {
                  default_value: -3,
                  description:
                    'Specifies the slope threshold. If the slope of a line fitted to the data of a given segment is greater than\n10 to the power of the threshold value, the segment will be labeled as transient (value = 0).',
                  name: 'Slope threshold.',
                  options: null,
                  param: 'slope_threshold',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'ssid',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Steady state detector based on the ration of two variances estimated from the same signal [#]_ . The algorithm first\nfilters the data using the factor "Alpha 1" and calculates two variances (long and short term) based on the\nparameters "Alpa 2" and "Alpha 3". The first variance is an exponentially weighted moving variance based on the\ndifference between the data and the average. The second is also an exponentially weighted moving “variance” but\nbased on sequential data differences. Larger Alpha values imply that fewer data are involved in the analysis,\nwhich has a benefit of reducing the time for the identifier to detect a process change (average run length, ARL)\nbut has a undesired impact of increasing the variability on the results, broadening the distribution and\nconfounding interpretation. Lower λ values undesirably increase the average run length to detection, but increase\nprecision (minimizing Type-I and Type-II statistical errors) by reducing the variability of the distributions\nincreasing the signal-to-noise ratio of a TS to SS situation.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Steady state (variance)',
              outputs: [
                {
                  description: 'Steady state = 0, transient = 1.',
                  name: 'Binary time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2.5,
                  description:
                    'Specifies the variance ratio threshold if it is in steady state or not. A variance ratio greater than the\nthreshold labels the state as transient.',
                  name: 'Threshold.',
                  options: null,
                  param: 'ratio_lim',
                  type: 'float',
                },
                {
                  default_value: 0.2,
                  description:
                    'Filter factor for the mean. Value should be between 0 and 1. Recommended value is 0.2.\nDefaults to 0.2.',
                  name: 'Alpha 1.',
                  options: null,
                  param: 'alpha1',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 1. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 2.',
                  options: null,
                  param: 'alpha2',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 2. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 3.',
                  options: null,
                  param: 'alpha3',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'vma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This moving average is designed to become flat (constant value) when the data\nwithin the lookup window does not vary significantly. It can also be state detector. The calculation is based on\nthe variability of the signal in a lookup window.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Steady state (vma)',
              outputs: [
                {
                  description:
                    'If the results has the same value as the previous moving average result, the signal can be considered to\nbe on steady state.',
                  name: 'Moving average.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 10,
                  description:
                    'Window length in data points used to estimate the variability of the signal.',
                  name: 'Lookup window.',
                  options: null,
                  param: 'window_length',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Filter: [
        {
          category: 'Filter',
          op: 'status_flag_filter',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Function to filter any given data series by a series with integers denoting different states. A typical example of\nsuch a series is typically a series of 0 and 1 where 1 would indicate the presence of an anomaly.\nThe status flag filter retrieves all relevant indices and matches these to the data series.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
                {
                  description:
                    'Time series values are expected to be integers. If not, values are cast to integer automatically.',
                  name: 'Status flag time series.',
                  param: 'filter_by',
                  types: ['ts'],
                },
              ],
              name: 'Status flag filter',
              outputs: [
                {
                  description: null,
                  name: 'Filtered time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description: 'Value to filter by in the boolean filter',
                  name: 'Value.',
                  options: null,
                  param: 'int_to_keep',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Filter',
          op: 'wavelet_filter',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
              inputs: [
                {
                  description:
                    'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Wavelet de-noising',
              outputs: [
                {
                  description: null,
                  name: 'Filtered time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description:
                    'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                  name: 'Level.',
                  options: null,
                  param: 'level',
                  type: 'int',
                },
                {
                  default_value: 'db8',
                  description:
                    'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                  name: 'Type.',
                  options: [
                    {
                      label: 'DAUBECHIES_1',
                      value: 'db1',
                    },
                    {
                      label: 'DAUBECHIES_2',
                      value: 'db2',
                    },
                    {
                      label: 'DAUBECHIES_3',
                      value: 'db3',
                    },
                    {
                      label: 'DAUBECHIES_4',
                      value: 'db4',
                    },
                    {
                      label: 'DAUBECHIES_5',
                      value: 'db5',
                    },
                    {
                      label: 'DAUBECHIES_6',
                      value: 'db6',
                    },
                    {
                      label: 'DAUBECHIES_7',
                      value: 'db7',
                    },
                    {
                      label: 'DAUBECHIES_8',
                      value: 'db8',
                    },
                    {
                      label: 'SYMLETS_1',
                      value: 'sym1',
                    },
                    {
                      label: 'SYMLETS_2',
                      value: 'sym2',
                    },
                    {
                      label: 'SYMLETS_3',
                      value: 'sym3',
                    },
                    {
                      label: 'SYMLETS_4',
                      value: 'sym4',
                    },
                  ],
                  param: 'wavelet',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Fluid Dynamics': [
        {
          category: 'Fluid Dynamics',
          op: 'Haaland',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The [Haaland equation ](https://en.wikipedia.org/wiki/Darcy_friction_factor_formulae#Haaland_equation) was\nproposed in 1983 by Professor S.E. Haaland of the Norwegian Institute of Technology.\nIt is used to solve directly for the Darcy–Weisbach friction factor for a full-flowing circular pipe. It is an\napproximation of the implicit Colebrook–White equation, but the discrepancy from experimental data is well within\nthe accuracy of the data.',
              inputs: [
                {
                  description: null,
                  name: 'Reynolds Number',
                  param: 'Re',
                  types: ['ts'],
                },
              ],
              name: 'Haaland equation',
              outputs: [
                {
                  description: null,
                  name: 'Friction factor',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'Surface roughness',
                  options: null,
                  param: 'roughness',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Fluid Dynamics',
          op: 'Re',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The Reynolds number is the ratio of inertial forces to viscous forces within a fluid which is subjected to\nrelative internal movement due to different fluid velocities.',
              inputs: [
                {
                  description: null,
                  name: 'Flow speed.',
                  param: 'speed',
                  types: ['ts'],
                },
              ],
              name: 'Reynolds Number',
              outputs: [
                {
                  description: null,
                  name: 'Reynolds number',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: 'Density of the fluid',
                  name: 'Density.',
                  options: null,
                  param: 'density',
                  type: 'float',
                },
                {
                  default_value: null,
                  description: 'Dynamic viscosity of the fluid',
                  name: 'Dynamic viscosity.',
                  options: null,
                  param: 'd_viscosity',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'Characteristic linear dimension. A characteristic length is an important dimension that defines the scale\nof a physical system. Often, the characteristic length is the volume of a system divided by its surface',
                  name: 'Characteristic length.',
                  options: null,
                  param: 'length_scale',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Forecast: [
        {
          category: 'Forecast',
          op: 'arma_predictor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The ARMA predictor works by fitting constants to a auto regression (AR) and to a moving average (MA) equation and\nextrapolating the results.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'ARMA predictor',
              outputs: [
                {
                  description:
                    'Predicted data for the test fraction of the input data (e.g. 1 - train_fraction)',
                  name: 'Prediction',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description: null,
                  name: 'Number of AR terms.',
                  options: null,
                  param: 'ar_order',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description: null,
                  name: 'Number of MA terms.',
                  options: null,
                  param: 'ma_order',
                  type: 'int',
                },
                {
                  default_value: 0.8,
                  description:
                    'Fraction of the input data used for training the model',
                  name: 'Fraction.',
                  options: null,
                  param: 'train_fraction',
                  type: 'float',
                },
                {
                  default_value: 'onestep',
                  description:
                    'Type of prediction to perform. MULTISTEP involves forecasting\nseveral steps ahead of the training dataset while ONESTEP involves incrementally going through the test\ndataset, appending it to the training dataset by performing a one-step forecast.',
                  name: 'Method',
                  options: [
                    {
                      label: 'ONESTEP',
                      value: 'onestep',
                    },
                    {
                      label: 'MULTISTEP',
                      value: 'multistep',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Number of steps to forecast ahead of the training dataset.',
                  name: 'Steps.',
                  options: null,
                  param: 'steps',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Forecast',
          op: 'holt_winters_predictor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This technique (also known by Holt-Winters) can be used to forecast time series data which displays a trend and a\nseasonality.\nIt works by utilizing exponential smoothing thrice - for the average value, the trend and the seasonality.\nValues are predicted by combining the effects of these influences.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Triple exponential smoothing',
              outputs: [
                {
                  description:
                    'Predicted data for the test fraction of the input data (e.g. 1 - train_fraction).',
                  name: 'Prediction.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'The value for the seasonal periods is chosen such that it denotes the number of timesteps within a period,\ne.g., 7*24 for hourly data with a weekly seasonality or 365 for daily data with a yearly pattern. Take care!\nA time series which shows a spike every day, but not on Sunday, does not have a daily seasonality, but a\nweekly seasonality!',
                  name: 'Number of periods per cycle.',
                  options: null,
                  param: 'seasonal_periods',
                  type: 'int',
                },
                {
                  default_value: 'add',
                  description:
                    'Additive seasonality: Amount of adjustment is constant.\nMultiplicative seasonality: Amount of adjustment varies with the level of the series.',
                  name: 'Seasonality.',
                  options: [
                    {
                      label: 'add',
                      value: 'add',
                    },
                    {
                      label: 'mul',
                      value: 'mul',
                    },
                  ],
                  param: 'seasonality',
                  type: 'str',
                },
                {
                  default_value: 'add',
                  description:
                    'Additive seasonality: Amount of adjustment is constant.\nMultiplicative seasonality: Amount of adjustment varies with the level of the series.',
                  name: 'Trend.',
                  options: [
                    {
                      label: 'add',
                      value: 'add',
                    },
                    {
                      label: 'mul',
                      value: 'mul',
                    },
                  ],
                  param: 'trend',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'If the trend component shall be dampened. Useful if this method is used to predict very far in the future\nand it is reasonable to assume that the trend will not stay constant, but flatten out.',
                  name: 'Dampen the trend component.',
                  options: null,
                  param: 'dampen_trend',
                  type: 'bool',
                },
                {
                  default_value: 1,
                  description:
                    'Number of steps to forecast ahead of the training dataset.',
                  name: 'Steps.',
                  options: null,
                  param: 'steps',
                  type: 'int',
                },
                {
                  default_value: 0.8,
                  description:
                    'Fraction of the input data used for training the model.',
                  name: 'Fraction.',
                  options: null,
                  param: 'train_fraction',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Not listed operations': [
        {
          category: 'Not listed operations',
          op: 'ADD',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Add any two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Add',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Add any two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Add',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '2.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'ARCCOS',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Calculates the trigonometric arccosine of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arccos',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'ARCSIN',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Calculates the trigonometric arcsine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arcsin',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'ARCTAN',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Calculate inverse hyperbolic tangent of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctan',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'ARCTANH',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Calculates the hyperbolic arctangent of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'BIN_MAP',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Maps to a binary array by checking if one timeseries is greater than another',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise greater-than',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'CEIL',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Rounds a time series up to the nearest integer greater than or equal to the current value',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round up',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'CLIP',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Given an interval, values of the time series outside the interval are clipped to the interval edges.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Clip(low, high)',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: -99999999999999,
                  description: 'Lower clipping limit. Default: -infinity',
                  name: 'Lower limit',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: 99999999999999,
                  description: 'Upper clipping limit. Default: +infinity',
                  name: 'Upper limit',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'COSH',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Calculates the hyperbolic cosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Cosh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'DEG2RAD',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Converts angles from degrees to radians',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Degrees to radians',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'DRIFT_DETECTOR',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Detects data drift (deviation) by comparing two rolling averages, short and long interval, of the signal. The\ndeviation between the short and long term average is considered significant if it is above a given threshold\nmultiplied by the rolling standard deviation of the long term average.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Drift',
              outputs: [
                {
                  description: 'Drift = 1, No drift = 0.',
                  name: 'Boolean time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '3d',
                  description: 'Length of long term time interval.',
                  name: 'Long length.',
                  options: null,
                  param: 'long_interval',
                  type: 'str',
                },
                {
                  default_value: '4h',
                  description: 'Length of short term time interval.',
                  name: 'Short length.',
                  options: null,
                  param: 'short_interval',
                  type: 'str',
                },
                {
                  default_value: 3,
                  description:
                    'Parameter that determines the signal has changed significantly enough to be considered drift. The threshold\nis multiplied by the long term rolling standard deviation to take into account the recent condition of the\nsignal.',
                  name: 'Threshold.',
                  options: null,
                  param: 'std_threshold',
                  type: 'float',
                },
                {
                  default_value: 'both',
                  description:
                    'Parameter to determine if the model should detect significant decreases, increases or both. Options are:\n"decrease", "increase" or "both". Defaults to "both"',
                  name: 'Type.',
                  options: null,
                  param: 'detect',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'EXP_WMA',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'The exponential moving average gives more weight to the more recent observations. The weights fall exponentially\nas the data point gets older. It reacts more than the simple moving average with regards to recent movements.\nThe moving average value is calculated following the definition yt=(1−α)yt−1+αxt if adjust = False or\nyt=(xt+(1−α)*xt−1+(1−α)^2*xt−2+...+(1−α)^t*x0) / (1+(1−α)+(1−α)^2+...+(1−α)^t) if adjust = True.',
              inputs: [
                {
                  description: 'Data with a pd.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Exp. weighted moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Defines how important the current observation is in the calculation of the EWMA. The longer the period, the slowly it adjusts to reflect current trends. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nThe time window is converted to the number of points for each of the windows. Each time window may have different number of points if the timeseries is not regular.\nThe number of points specify the decay of the exponential weights in terms of span α=2/(span+1), for span≥1.",
                  name: 'Time window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of data points inside a time window required to have a value (otherwise result is NA). Defaults to 1.\nIf min_periods > 1 and adjust is False, the SMA is computed for the first observation.',
                  name: 'Minimum number of data points.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'If true, the exponential function is calculated using weights w_i=(1−α)^i.\nIf false, the exponential function is calculated recursively using yt=(1−α)yt−1+αxt. Defaults to True.',
                  name: 'Adjust.',
                  options: null,
                  param: 'adjust',
                  type: 'bool',
                },
                {
                  default_value: 200,
                  description:
                    'Sets the maximum number of points to consider in a window if adjust = True. A high number of points will require more time to execute. Defaults to 200.',
                  name: 'Maximum number of data points.',
                  options: null,
                  param: 'max_pt',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'If true, resamples the calculated exponential moving average series. Defaults to False.',
                  name: 'Resample.',
                  options: null,
                  param: 'resample',
                  type: 'bool',
                },
                {
                  default_value: '60min',
                  description:
                    "Time window used to resample the calculated exponential moving average series. Defaults to '60min'.",
                  name: 'Resampling window',
                  options: null,
                  param: 'resample_window',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'INTEGRATE',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Cumulative integration using trapezoidal rule with an optional user-defined time unit.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Integration',
              outputs: [
                {
                  description: null,
                  name: 'Cumulative integral.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Current granularity for the chart on-screen (auto-given).',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'auto',
                  description:
                    "User defined granularity to potentially override unit of time.\nAccepts integer followed by time unit string (s|m|h|d). For example: '1s', '5m', '3h' or '1d'.",
                  name: 'Frequency.',
                  options: null,
                  param: 'time_unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'INV',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Element-wise inverse of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Inverse',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'LOG',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Calculates the natural logarithm of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Ln',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'LOG2',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Calculates the logarithm with base 2 of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log base 2',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'MAX',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Computes the maximum value of two timeseries or numbers',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise maximum',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'MOD',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Modulo of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'dividend time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'divisor time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Modulo',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'NEG',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Negation of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Negation',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'OUTLIER_DETECTOR',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Outlier detector and removal based on the [paper from Gustavo A. Zarruk](https://iopscience.iop.org/article/10.1088/0957-0233/16/10/012/meta). The procedure is as follows:\n\n * Fit a polynomial curve to the model using all of the data\n * Calculate the studentized deleted (or externally studentized) residuals\n * These residuals follow a t distribution with degrees of freedom n - p - 1\n * Bonferroni critical value can be computed using the significance level (alpha) and t distribution\n * Any values that fall outside of the critical value are treated as anomalies\n\nUse of the hat matrix diagonal allows for the rapid calculation of deleted residuals without having to refit\nthe predictor function each time.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Extreme outliers removal',
              outputs: [
                {
                  description: null,
                  name: 'Time series without outliers.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 0.05,
                  description: null,
                  name: 'Significance level.',
                  options: null,
                  param: 'alpha',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description:
                    'Relaxation factor for the Bonferroni critical value. Smaller values will make anomaly detection more\nconservative. Defaults to 1',
                  name: 'Factor.',
                  options: null,
                  param: 'bc_relaxation',
                  type: 'float',
                },
                {
                  default_value: 3,
                  description:
                    'Order of the polynomial used for the regression function',
                  name: 'Polynomial order.',
                  options: null,
                  param: 'poly_order',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'PI_CALC',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'The productivity index or PI is defined as the gas flow rate at the well divided by the difference in pressure\nbetween the reservoir and bottom hole. If there is no data available for any of the inputs for a specific\ntimestamp, then it will be ignored.',
              inputs: [
                {
                  description: null,
                  name: 'Reservoir pressure.',
                  param: 'p_res',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Bottomhole pressure.',
                  param: 'p_bh',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Gas flowrate.',
                  param: 'Q_gas',
                  types: ['ts'],
                },
              ],
              name: 'Productivity Index',
              outputs: [
                {
                  description: null,
                  name: 'Productivity index.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'POW',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Power of time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'base time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'exponent time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Power',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'RESAMPLE',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Resample time series to a given fixed granularity (time delta) and aggregation type\n([read more about aggregation ](https://docs.cognite.com/dev/concepts/aggregation/))',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Resample to granularity',
              outputs: [
                {
                  description: null,
                  name: 'Resampled time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Granularity defines the time range that each aggregate is calculated from. It consists of a time unit and a\nsize. Valid time units are day or d, hour h, minute or m and second or s. For example, 2h means that each\ntime range should be 2 hours wide, 3m means 3 minutes, and so on.',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'mean',
                  description:
                    'Type of aggregation to use when resampling. Possible options are:\n\n* mean\n* max\n* min\n* count\n* sum',
                  name: 'Aggregate.',
                  options: [
                    {
                      label: 'MEAN',
                      value: 'mean',
                    },
                    {
                      label: 'INTERPOLATION',
                      value: 'interpolation',
                    },
                    {
                      label: 'STEP_INTERPOLATION',
                      value: 'stepInterpolation',
                    },
                    {
                      label: 'MAX',
                      value: 'max',
                    },
                    {
                      label: 'MIN',
                      value: 'min',
                    },
                    {
                      label: 'COUNT',
                      value: 'count',
                    },
                    {
                      label: 'SUM',
                      value: 'sum',
                    },
                  ],
                  param: 'aggregate',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'ROUND',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Rounds a time series to a given number of decimals',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'number of decimals',
                  options: null,
                  param: 'decimals',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'SHUTIN_CALC',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'The shut-in interval is defined as period when the valve is in closed state. The close state is determined based\non the calculated manually-given threshold. The threshold is calculated based on the analysis of the valve signal\nhistogram.',
              inputs: [
                {
                  description: 'Shut-in valve signal',
                  name: 'Shut-in valve signal.',
                  param: 'shut_valve',
                  types: ['ts'],
                },
              ],
              name: 'Shut-in interval',
              outputs: [
                {
                  description:
                    'Binary time series indicating open state or closed state: Open state= 1, Close state = 0.',
                  name: 'Shut-in periods.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 6,
                  description:
                    'Minimum shut-in length in hours to be considered for detection',
                  name: 'Minimum time.',
                  options: null,
                  param: 'min_shutin_len',
                  type: 'int',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum time between consecutive shut-ins in hours to validate change of state',
                  name: 'Time between.',
                  options: null,
                  param: 'min_time_btw_shutins',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'Indicator to tell the algorithm if the shut-in state is below the threshold',
                  name: 'Below threshold.',
                  options: null,
                  param: 'shutin_state_below_threshold',
                  type: 'bool',
                },
                {
                  default_value: null,
                  description:
                    'Threshold between the valve open and close states. Defaults to None meaning that the threshold is calculated',
                  name: 'Threshold.',
                  options: null,
                  param: 'shutin_threshold',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'SIMPLE_MA',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Plain simple average that computes the sum of the values of the observations in a time_window divided by the number of observations in the time_window.\nSMA time series are much less noisy than the original time series. However, SMA time series lag the original time series, which means that changes in the trend are only seen with a delay (lag) of time_window/2.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Simple moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the average. Defaults to '60min'.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.",
                  name: 'Window',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of observations in window required to have a value (otherwise result is NA). Defaults  to 1.',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'SINH',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Calculates the hyperbolic sine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sinh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'SS_DETECTOR',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Steady state detector based on the ration of two variances estimated from the same signal [#]_ . The algorithm first\nfilters the data using the factor "Alpha 1" and calculates two variances (long and short term) based on the\nparameters "Alpa 2" and "Alpha 3". The first variance is an exponentially weighted moving variance based on the\ndifference between the data and the average. The second is also an exponentially weighted moving “variance” but\nbased on sequential data differences. Larger Alpha values imply that fewer data are involved in the analysis,\nwhich has a benefit of reducing the time for the identifier to detect a process change (average run length, ARL)\nbut has a undesired impact of increasing the variability on the results, broadening the distribution and\nconfounding interpretation. Lower λ values undesirably increase the average run length to detection, but increase\nprecision (minimizing Type-I and Type-II statistical errors) by reducing the variability of the distributions\nincreasing the signal-to-noise ratio of a TS to SS situation.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Steady state (variance)',
              outputs: [
                {
                  description: 'Steady state = 0, transient = 1.',
                  name: 'Binary time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2.5,
                  description:
                    'Specifies the variance ratio threshold if it is in steady state or not. A variance ratio greater than the\nthreshold labels the state as transient.',
                  name: 'Threshold.',
                  options: null,
                  param: 'ratio_lim',
                  type: 'float',
                },
                {
                  default_value: 0.2,
                  description:
                    'Filter factor for the mean. Value should be between 0 and 1. Recommended value is 0.2.\nDefaults to 0.2.',
                  name: 'Alpha 1.',
                  options: null,
                  param: 'alpha1',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 1. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 2.',
                  options: null,
                  param: 'alpha2',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 2. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 3.',
                  options: null,
                  param: 'alpha3',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'SUB',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'The difference between two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Subtraction',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'TANH',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description: 'Calculates the hyperbolic tangent of time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Tanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'WAVELET_FILTER',
          versions: [
            {
              changelog: 'Deprecated function. Re-create node to upgrade',
              deprecated: true,
              description:
                'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
              inputs: [
                {
                  description:
                    'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Wavelet de-noising',
              outputs: [
                {
                  description: null,
                  name: 'Filtered time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description:
                    'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                  name: 'Level.',
                  options: null,
                  param: 'level',
                  type: 'int',
                },
                {
                  default_value: 'db8',
                  description:
                    'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                  name: 'Type.',
                  options: [
                    {
                      label: 'DAUBECHIES_1',
                      value: 'db1',
                    },
                    {
                      label: 'DAUBECHIES_2',
                      value: 'db2',
                    },
                    {
                      label: 'DAUBECHIES_3',
                      value: 'db3',
                    },
                    {
                      label: 'DAUBECHIES_4',
                      value: 'db4',
                    },
                    {
                      label: 'DAUBECHIES_5',
                      value: 'db5',
                    },
                    {
                      label: 'DAUBECHIES_6',
                      value: 'db6',
                    },
                    {
                      label: 'DAUBECHIES_7',
                      value: 'db7',
                    },
                    {
                      label: 'DAUBECHIES_8',
                      value: 'db8',
                    },
                    {
                      label: 'SYMLETS_1',
                      value: 'sym1',
                    },
                    {
                      label: 'SYMLETS_2',
                      value: 'sym2',
                    },
                    {
                      label: 'SYMLETS_3',
                      value: 'sym3',
                    },
                    {
                      label: 'SYMLETS_4',
                      value: 'sym4',
                    },
                  ],
                  param: 'wavelet',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Not listed operations',
          op: 'versioning_test_op',
          versions: [
            {
              changelog: null,
              deprecated: true,
              description:
                'This old function is used only for testing purposes',
              inputs: [
                {
                  description: null,
                  name: 'Dummy input',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Old versioning test',
              outputs: [
                {
                  description: null,
                  name: 'Dummy output',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
            {
              changelog: 'Added verbose parameter',
              deprecated: true,
              description:
                'This new function is used only for testing purposes',
              inputs: [
                {
                  description: null,
                  name: 'Dummy input',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'New versioning test',
              outputs: [
                {
                  description: null,
                  name: 'Dummy output',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'Dummy flag',
                  options: null,
                  param: 'verbose',
                  type: 'bool',
                },
              ],
              version: '2.0',
            },
          ],
        },
      ],
      'Oil and gas': [
        {
          category: 'Oil and gas',
          op: 'calculate_gas_density',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The gas density is calculated from real gas laws.The psuedo critical tempreature and pressure is\ncalculated from specific gravity following [Sutton (1985) ](https://doi.org/10.2118/14265-MS). The\n[Beggs and Brill (1973) ](https://onepetro.org/JPT/article-abstract/25/05/607/165212/A-Study-of-Two-Phase-Flow-in-Inclined-Pipes)\nmethod (explicit) is used to calculate the compressibility factor. All equations used here can be found in one place at\n[Kareem et. al. ](https://link.springer.com/article/10.1007/s13202-015-0209-3). The gas equation *Pv = zRT*\nis used to calculate the gas density.',
              inputs: [
                {
                  description: 'Pressure time series in psi units.',
                  name: 'Pressure',
                  param: 'pressure',
                  types: ['ts'],
                },
                {
                  description:
                    'Temperature time series in degrees Fahrenheit units.',
                  name: 'Temperature',
                  param: 'temperature',
                  types: ['ts'],
                },
              ],
              name: 'Gas density calculator',
              outputs: [
                {
                  description:
                    'Estimated gas density in pound-force per cubic foot (pcf).',
                  name: 'Gas density',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.5534,
                  description: 'Specific gravity of the gas.',
                  name: 'Specific gravity',
                  options: null,
                  param: 'sg',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_shutin_interval',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The shut-in interval is defined as period when the valve is in closed state. The close state is determined based\non the calculated manually-given threshold. The threshold is calculated based on the analysis of the valve signal\nhistogram.',
              inputs: [
                {
                  description: 'Shut-in valve signal',
                  name: 'Shut-in valve signal.',
                  param: 'shut_valve',
                  types: ['ts'],
                },
              ],
              name: 'Shut-in interval',
              outputs: [
                {
                  description:
                    'Binary time series indicating open state or closed state: Open state= 1, Close state = 0.',
                  name: 'Shut-in periods.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 6,
                  description:
                    'Minimum shut-in length in hours to be considered for detection',
                  name: 'Minimum time.',
                  options: null,
                  param: 'min_shutin_len',
                  type: 'int',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum time between consecutive shut-ins in hours to validate change of state',
                  name: 'Time between.',
                  options: null,
                  param: 'min_time_btw_shutins',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'Indicator to tell the algorithm if the shut-in state is below the threshold',
                  name: 'Below threshold.',
                  options: null,
                  param: 'shutin_state_below_threshold',
                  type: 'bool',
                },
                {
                  default_value: null,
                  description:
                    'Threshold between the valve open and close states. Defaults to None meaning that the threshold is calculated',
                  name: 'Threshold.',
                  options: null,
                  param: 'shutin_threshold',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_shutin_variable',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Shut-in variable calculator is a function to compute the variable of interest at specific times after the shut-in\nonset. Typically, variables of interest are pressure and temperature. The function is the dependency of the shut-in\ndetector. Based on the detected shut-in interval, the function uses specified number of hours indicating the time after\nthe onset of each shut-in and calculates the variable of interest at that time instance using interpolation (method - time).',
              inputs: [
                {
                  description: 'Typically pressure or temperature signal',
                  name: 'Signal of interest.',
                  param: 'variable_signal',
                  types: ['ts'],
                },
                {
                  description:
                    'The signal comes from a shut-in detector function or a signal indicating shut-in condition\n(0 - well in shut-in state, 1 - well in flowing state). We suggest using the\n:meth:`indsl.oil_and_gas.calculate_shutin_interval`',
                  name: 'Shut-in signal.',
                  param: 'shutin_signal',
                  types: ['ts'],
                },
              ],
              name: 'Shut-in variable calculator',
              outputs: [
                {
                  description:
                    'Signal of interest at specific time after shut-in onset.',
                  name: 'Output.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Hours after shut-in onset at which to calculate the signal of interest',
                  name: 'Hours after.',
                  options: null,
                  param: 'hrs_after_shutin',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_well_prod_status',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Determine if the well is producing. In order for this to be the case, the following has to happen:\n* All Master, Wing and Choke data have to come from the same well.\n* Check if the master, wing and choke valve openings are above their respective threshold values at a given time.\n* If any of the valves are below the threshold opening, then the well is closed.\n* If all of the valves are above the threshold opening, then the well is open.\n* Threshold values should be between 0-100.',
              inputs: [
                {
                  description: 'Time series of the master valve.',
                  name: 'Master Valve',
                  param: 'master_valve',
                  types: ['ts'],
                },
                {
                  description: 'Time series of the wing valve.',
                  name: ' Wing Valve',
                  param: 'wing_valve',
                  types: ['ts'],
                },
                {
                  description: 'Time series of the choke valve.',
                  name: ' Choke Valve',
                  param: 'choke_valve',
                  types: ['ts'],
                },
              ],
              name: 'Check if the well is producing',
              outputs: [
                {
                  description:
                    'Well production status (1 means open, 0 means closed).',
                  name: 'Well Status',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Master threshold',
                  options: null,
                  param: 'threshold_master',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Wing threshold',
                  options: null,
                  param: 'threshold_wing',
                  type: 'float',
                },
                {
                  default_value: 5,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Choke threshold',
                  options: null,
                  param: 'threshold_choke',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'productivity_index',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The productivity index or PI is defined as the gas flow rate at the well divided by the difference in pressure\nbetween the reservoir and bottom hole. If there is no data available for any of the inputs for a specific\ntimestamp, then it will be ignored.',
              inputs: [
                {
                  description: null,
                  name: 'Reservoir pressure.',
                  param: 'p_res',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Bottomhole pressure.',
                  param: 'p_bh',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Gas flowrate.',
                  param: 'Q_gas',
                  types: ['ts'],
                },
              ],
              name: 'Productivity Index',
              outputs: [
                {
                  description: null,
                  name: 'Productivity index.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Regression: [
        {
          category: 'Regression',
          op: 'poly_regression',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Fit a polynomial curve of a specified degree to the data. Default method corresponds to a ordinary least squares\nfitting procedure but method can be changed to allow for L1 or L2 regularisation.',
              inputs: [
                {
                  description: 'Data to fit the polynomial regression',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Polynomial',
              outputs: [
                {
                  description: null,
                  name: 'Fitted data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description: null,
                  name: 'Polynomial order.',
                  options: null,
                  param: 'order',
                  type: 'int',
                },
                {
                  default_value: 'No regularisation',
                  description:
                    'Type of regularisation to apply (Lasso or Ridge). Default is simple linear least squares with no regularisation.',
                  name: 'Method.',
                  options: [
                    {
                      label: 'Lasso',
                      value: 'Lasso',
                    },
                    {
                      label: 'Ridge',
                      value: 'Ridge',
                    },
                    {
                      label: 'No regularisation',
                      value: 'No regularisation',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 0.1,
                  description:
                    'Only applies to either Ridge or Lasso methods which sets the penalty for either L2 or L1 regularisation.\nValue of 0 means that there is no penalty and this essentially equivalent to ordinary least squares.',
                  name: 'Alpha.',
                  options: null,
                  param: 'alpha',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Resample: [
        {
          category: 'Resample',
          op: 'interpolate',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Interpolates and resamples data with a uniform sampling frequency.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Interpolation',
              outputs: [
                {
                  description: null,
                  name: 'Interpolated time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 'linear',
                  description:
                    "Specifies the interpolation method. Defaults to \"linear\". Possible inputs are :\n\n* 'linear': linear interpolation.\n* 'ffill': forward filling.\n* 'stepwise': yields same result as ffill.\n* 'zero', 'slinear', 'quadratic', 'cubic': spline interpolation of zeroth, first, second or third order.",
                  name: 'Method.',
                  options: [
                    {
                      label: 'linear',
                      value: 'linear',
                    },
                    {
                      label: 'ffill',
                      value: 'ffill',
                    },
                    {
                      label: 'stepwise',
                      value: 'stepwise',
                    },
                    {
                      label: 'zero',
                      value: 'zero',
                    },
                    {
                      label: 'slinear',
                      value: 'slinear',
                    },
                    {
                      label: 'quadratic',
                      value: 'quadratic',
                    },
                    {
                      label: 'cubic',
                      value: 'cubic',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 'pointwise',
                  description:
                    "Specifies the kind of returned data points. Defaults to \"pointwise\".  Possible inputs are :\n\n* 'pointwise': returns the pointwise value of the interpolated function for each timestamp.\n* 'average': returns the average of the interpolated function within each time period.",
                  name: 'Kind.',
                  options: [
                    {
                      label: 'pointwise',
                      value: 'pointwise',
                    },
                    {
                      label: 'average',
                      value: 'average',
                    },
                  ],
                  param: 'kind',
                  type: 'str',
                },
                {
                  default_value: '1s',
                  description:
                    "Sampling frequency or granularity of the output (e.g. '1s' or '2h'). 'min' refers to minutes and 'M' to\nmonths. Defaults to \"1s\".",
                  name: 'Frequency.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    '- 1: Fill in for requested points outside of the data range.\n- 0: Ignore said points. Defaults to 1.\n\nDefault behaviour is to raise a UserValueError if the data range is not within start and end and no outside fill\nmethod is specified (value 1).',
                  name: 'Bounded.',
                  options: null,
                  param: 'bounded',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    "Specifies how to fill values outside input data range ('None' or 'extrapolate'). Defaults to None.",
                  name: 'Outside fill.',
                  options: null,
                  param: 'outside_fill',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'reindex',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This method offers data reindexing onto a common index and fills missing data points.\nIf bounded is false, the common index is the union of the the input time-series indices.\nIf bounded is true, the common index is restricted to the period where the time-series overlap.',
              inputs: [
                {
                  description: null,
                  name: 'First time series.',
                  param: 'data1',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Second time series.',
                  param: 'data2',
                  types: ['ts'],
                },
              ],
              name: 'Reindex',
              outputs: [
                {
                  description:
                    'pandas.Series: Second reindexed time series\nReindexed time series with common indices.',
                  name: 'First reindexed time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 'first order spline interpolation',
                  description:
                    "Specifies the interpolation method. Defaults to \"linear\". Possible inputs are :\n\n* 'zero_previous': zero order spline interpolation with forward filling mode, i.e. the previous known value of any point is used.\n* 'zero_next': zero order spline interpolation with backward filling mode, i.e. the next known value of any point is used.\n* 'linear': linear order spline interpolation.\n* 'quadratic': quadratic order spline interpolation.\n* 'cubic': cubic order spline interpolation.",
                  name: 'Method.',
                  options: [
                    {
                      label: 'ZERO_PREVIOUS',
                      value:
                        'zero order spline interpolation (forward filling)',
                    },
                    {
                      label: 'ZERO_NEXT',
                      value:
                        'zero order spline interpolation (backward filling)',
                    },
                    {
                      label: 'LINEAR',
                      value: 'first order spline interpolation',
                    },
                    {
                      label: 'QUADRATIC',
                      value: 'second order plines interpolation',
                    },
                    {
                      label: 'CUBIC',
                      value: 'third order plines interpolation',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 'pointwise',
                  description:
                    "Specifies the kind of returned data points. Defaults to \"pointwise\".  Possible inputs are:\n\n* 'pointwise': returns the pointwise value of the interpolated function for each timestamp.\n* 'average': returns the average of the interpolated function within each time period.",
                  name: 'Kind.',
                  options: [
                    {
                      label: 'POINTWISE',
                      value: 'pointwise',
                    },
                    {
                      label: 'AVERAGE',
                      value: 'average',
                    },
                  ],
                  param: 'kind',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'Specifies if the output should be bounded to avoid extrapolation. Defaults to False. Possible inputs are:\n\n* True: Return the intersection of the timeperiods of the input time series.\n* False: Return the union of the timeperiods of the input time series. Extraplolate points outside of the data range.',
                  name: 'Bounded.',
                  options: null,
                  param: 'bounded',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'resample',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This method offers a robust filling of missing data points and data resampling a given sampling frequency. Multiple\ndata resampling options are available:\n\n * Fourier\n * Polynomial phase filtering\n * Linear interpolation (for up-sampling)\n * Min, max, sum, count, mean (for down-sampling)',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Resample',
              outputs: [
                {
                  description:
                    'Uniform, resampled time series with specified number of data points.',
                  name: 'Interpolated time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'fourier',
                  description:
                    'Resampling method:\n\n* "fourier" for Fourier method (default)\n* "polyphase" for polyphase filtering\n* "interpolate" for linear interpolation when upsampling\n* "min", "max", "sum", "count", "mean" when downsampling',
                  name: 'Method.',
                  options: [
                    {
                      label: 'fourier',
                      value: 'fourier',
                    },
                    {
                      label: 'polyphase',
                      value: 'polyphase',
                    },
                    {
                      label: 'interpolate',
                      value: 'interpolate',
                    },
                    {
                      label: 'min',
                      value: 'min',
                    },
                    {
                      label: 'max',
                      value: 'max',
                    },
                    {
                      label: 'sum',
                      value: 'sum',
                    },
                    {
                      label: 'count',
                      value: 'count',
                    },
                    {
                      label: 'mean',
                      value: 'mean',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Temporal resolution of uniform time series, before resampling. Defaults to None.\nIf not specified, the frequency will be implied, which only works if no data is missing.\nFollows Pandas DateTime convention.',
                  name: 'Current temporal resolution.',
                  options: null,
                  param: 'granularity_current',
                  type: 'str',
                },
                {
                  default_value: '1s',
                  description:
                    'Temporal resolution of uniform time series, after resampling. Defaults to "1s".\nEither "Number of Samples" or "Final temporal resolution" must be provided.',
                  name: 'Final temporal resolution.',
                  options: null,
                  param: 'granularity_next',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'The number of samples in the resampled signal. If this is set, the time deltas will be inferred. Defaults\nto None. Either "Number of Samples" or "Final temporal resolution" must be provided.',
                  name: 'Number of Samples.',
                  options: null,
                  param: 'num',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'The down-sampling factor is required for the polyphase filtering. Defaults to None.',
                  name: 'Down-sampling factor.',
                  options: null,
                  param: 'downsampling_factor',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'Gaps smaller than threshold will be interpolated, larger than this will be filled by noise.\nDefaults to None.',
                  name: 'Interpolation threshold.',
                  options: null,
                  param: 'interpolate_resolution',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Gaps smaller than this threshold will be forward filled. Defaults to None.',
                  name: 'Forward fill threshold.',
                  options: null,
                  param: 'ffill_resolution',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'resample_to_granularity',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Resample time series to a given fixed granularity (time delta) and aggregation type\n([read more about aggregation ](https://docs.cognite.com/dev/concepts/aggregation/))',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Resample to granularity',
              outputs: [
                {
                  description: null,
                  name: 'Resampled time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Granularity defines the time range that each aggregate is calculated from. It consists of a time unit and a\nsize. Valid time units are day or d, hour h, minute or m and second or s. For example, 2h means that each\ntime range should be 2 hours wide, 3m means 3 minutes, and so on.',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'mean',
                  description:
                    'Type of aggregation to use when resampling. Possible options are:\n\n* mean\n* max\n* min\n* count\n* sum',
                  name: 'Aggregate.',
                  options: [
                    {
                      label: 'MEAN',
                      value: 'mean',
                    },
                    {
                      label: 'INTERPOLATION',
                      value: 'interpolation',
                    },
                    {
                      label: 'STEP_INTERPOLATION',
                      value: 'stepInterpolation',
                    },
                    {
                      label: 'MAX',
                      value: 'max',
                    },
                    {
                      label: 'MIN',
                      value: 'min',
                    },
                    {
                      label: 'COUNT',
                      value: 'count',
                    },
                    {
                      label: 'SUM',
                      value: 'sum',
                    },
                  ],
                  param: 'aggregate',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Signal generator': [
        {
          category: 'Signal generator',
          op: 'insert_data_gaps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                "Method to synthetically remove data, i.e. generate data gaps in a time series. The amount of data points removed\nis defined by the given 'fraction' relative to the original time series.",
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Insert data gaps',
              outputs: [
                {
                  description:
                    'Original time series with synthetically generated data gap(s).',
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.25,
                  description:
                    'Fraction of data points to remove relative to the original time series. Must be a number higher than 0 and\nlower than 1 (0 < keep < 1). Defaults to 0.25.',
                  name: 'Remove fraction',
                  options: null,
                  param: 'fraction',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'Number of gaps to generate. Only needs to be provided when using the "Multiple" gaps method.',
                  name: 'Number of gaps',
                  options: null,
                  param: 'num_gaps',
                  type: 'int',
                },
                {
                  default_value: 5,
                  description:
                    'Minimum of data points to keep between data gaps and at the start and end of the time series. If the buffer\nof data points is higher than 1% of the number of data points in the time series, the end and start buffer\nis set to 1% of the total available data points.',
                  name: 'Buffer',
                  options: null,
                  param: 'data_buffer',
                  type: 'int',
                },
                {
                  default_value: 'Random',
                  description:
                    "This function offers multiple methods to generate data gaps:\n\n* Random: Removes data points at random locations so that the output time series size is a given\n  fraction  ('Remove fraction') of the original time series. The first and last data points are never\n  deleted. No buffer is set between gaps, only for the start and end of the time series.\n  If the buffer of data points is higher than 1% of the number of data points in the time\n  series, the end and start buffer is set to 1% of the total available data points.\n* Single: Remove consecutive data points at a single location. Buffer data points at the start\n  and end of the time series is kept to prevent removing the start and end of the time series. The\n  buffer is set to the maximum value between 5 data points or 1% of the data points in the signal.\n* Multiple: Insert multiple non-overlapping data gaps at random dates and of random\n  sizes such that the given fraction of data is removed. If the number of gaps is not defined or is\n  less than 2, the function defaults to 2 gaps. To avoid gap overlapping, a minimum of 5 data points\n  is imposed at the start and end of the signal and between gaps.",
                  name: 'Method',
                  options: [
                    {
                      label: 'Random',
                      value: 'Random',
                    },
                    {
                      label: 'Single',
                      value: 'Single',
                    },
                    {
                      label: 'Multiple',
                      value: 'Multiple',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'line',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Generate a synthetic time series using the line equation. If no end and/or start dates are given, the default\nsignal duration is set to 1 day. If no dates are provided, the end date is set to the current date and time.',
              inputs: [],
              name: 'Line',
              outputs: [
                {
                  description: 'Synthetic time series for a line',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'The start date of the time series entered as a string, for example: "1975-05-09 20:09:10", or\n"1975-05-09".',
                  name: 'Start date.',
                  options: null,
                  param: 'start_date',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'The end date of the time series entered as a string, for example: "1975-05-09 20:09:10", or\n"1975-05-09".',
                  name: 'End date.',
                  options: null,
                  param: 'end_date',
                  type: 'str',
                },
                {
                  default_value: '0 days 00:01:00',
                  description:
                    "Sampling frequency as a time delta, value and time unit. Defaults to '1 minute'. Valid time units are:\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'Frequency',
                  options: null,
                  param: 'sample_freq',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: 'Line slope. Defaults to 0 (horizontal line).',
                  name: 'Slope',
                  options: null,
                  param: 'slope',
                  type: 'float',
                },
                {
                  default_value: 0,
                  description: 'Y-intercept. Defaults to 0.',
                  name: 'Intercept',
                  options: null,
                  param: 'intercept',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'perturb_timestamp',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Perturb the date-time index (timestamp) of the original time series using a normal (Gaussian) distribution\nwith a mean of zero and a given standard deviation (magnitude) in seconds.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Perturb timestamp',
              outputs: [
                {
                  description: 'Original signal with a non-uniform time stamp.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description:
                    'Time delta perturbation magnitude in seconds. If none is given, it is set to the inferred average sampling\nrate in seconds of the original signal.',
                  name: 'Magnitude',
                  options: null,
                  param: 'magnitude',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'sine_wave',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Generate a time series for a [sine wave ](https://en.wikipedia.org/wiki/Sine_wave) with a given wave period,\namplitude, phase and mean value. If no end and/or start dates are given, the default signal duration is set to\n1 day. If no dates are provided, the end date is set to the current date and time.',
              inputs: [],
              name: 'Sine wave',
              outputs: [
                {
                  description: null,
                  name: 'Sine wave',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Date-time string when the time series starts. The date must be a string, for example:\n"1975-05-09 20:09:10".',
                  name: 'Start date',
                  options: null,
                  param: 'start_date',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Date-time string when the time series starts. The date must be a string, for example:\n"1975-05-09 20:09:10".',
                  name: 'End date',
                  options: null,
                  param: 'end_date',
                  type: 'str',
                },
                {
                  default_value: '0 days 00:00:01',
                  description:
                    "Sampling frequency as a time delta, value and time unit. Defaults to '1 minute'. Valid time units are:\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'Frequency',
                  options: null,
                  param: 'sample_freq',
                  type: 'str',
                },
                {
                  default_value: '0 days 01:00:00',
                  description:
                    'The time it takes for two successive crests (one wavelength) to pass a specified point. For example, defining\na wave period of :math:`10 min` will generate one full wave every 10 minutes. The period can not be 0. If\nno value is provided, it 1 minute. Valid time units are:\n    * ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n    * ‘days’ or ‘day’\n    * ‘hours’, ‘hour’, ‘hr’, or ‘h’\n    * ‘minutes’, ‘minute’, ‘min’, or ‘m’\n    * ‘seconds’, ‘second’, or ‘sec’\n    * ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n    * ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n    * ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.',
                  name: 'Wave period',
                  options: null,
                  param: 'wave_period',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: "The wave's mean value. Defaults to 0.",
                  name: 'Mean',
                  options: null,
                  param: 'wave_mean',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description:
                    'Maximum absolute deviation from the mean. Defaults to 1.',
                  name: 'Peak amplitude',
                  options: null,
                  param: 'wave_amplitude',
                  type: 'float',
                },
                {
                  default_value: 0,
                  description:
                    'Specifies (in radians) where in its cycle the oscillation is at time = 0. When the phase is non-zero, the\nwave is shifted in time. A negative value represents a delay, and a positive value represents an advance.\nDefualts to 0.',
                  name: 'Phase',
                  options: null,
                  param: 'wave_phase',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'univariate_polynomial',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Creates a univariate polynomial $y$, of degree $n$, from the time series $x$, and a list of\ncoefficients $a_{n}$:\n\n$$\ny = a_0 + a_1x + a_2x^2 + a_3x^3 + ... + a_nx^n\n$$\n',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'signal',
                  types: ['ts'],
                },
              ],
              name: 'Univariate polynomial',
              outputs: [
                {
                  description: null,
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: [0, 1],
                  description:
                    'List of coefficient separated by commas. The numbers must be entered deparated by comas (e.g. 0, 1).\nThe default is :math:`0.0, 1.0`, which returns the original time series.',
                  name: 'Coefficients',
                  options: null,
                  param: 'coefficients',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'white_noise',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Adds white noise to the original data using a given signal-to-noise ratio (SNR).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Add white noise',
              outputs: [
                {
                  description: 'Original data plus white noise.',
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 30,
                  description:
                    'Signal-to-noise ratio (SNR) in decibels. SNR is a comparison of the level of a signal to the level of\nbackground noise. SNR is defined as the ratio of signal power to the noise power. A ratio higher than 1\nindicates more signal than noise. Defaults to 30.',
                  name: 'SNR',
                  options: null,
                  param: 'snr_db',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'A seed (integer number) to initialize the random number generator. If left empty, then a fresh,\nunpredictable values will be generated. If a value is entered the exact random noise will be generated if\nthe time series data and date range is not changed.',
                  name: 'Seed',
                  options: null,
                  param: 'seed',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Smooth: [
        {
          category: 'Smooth',
          op: 'alma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Moving average typically used in the financial industry which aims to strike a good balance between smoothness\nand responsivness (i.e. capture a general smoothed trend without allowing for significant lag). It can be\ninterpreted as a Gaussian weighted moving average with an offset, where the offset, spread and window size are\nuser defined.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Arnaud Legoux moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 10,
                  description:
                    'Defaults to 10 data points or time steps for uniformly sample time series.',
                  name: 'Window size.',
                  options: null,
                  param: 'window',
                  type: 'int',
                },
                {
                  default_value: 6,
                  description:
                    'Parameter that controls the width of the Gaussian filter. Defaults to 6.',
                  name: 'Sigma.',
                  options: null,
                  param: 'sigma',
                  type: 'float',
                },
                {
                  default_value: 0.75,
                  description:
                    'Parameter that controls the magnitude of the weights for each past observation within the window.\nDefaults to 0.75.',
                  name: 'Offset factor.',
                  options: null,
                  param: 'offset_factor',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'arma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The autoregressive moving average (ARMA) is a popular model used in forecasting. It uses an autoregression (AR)\nanalysis characterize the effect of past values on current values and a moving average to quantify the effect of the\nprevious day error (variation).',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Autoregressive moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description:
                    'Number of past dat points to include in the AR model. Defaults to 2.',
                  name: 'AR order.',
                  options: null,
                  param: 'ar_order',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description:
                    'Number of terms in the MA model.  Defaults to 2.',
                  name: 'MA order.',
                  options: null,
                  param: 'ma_order',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'butterworth',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This is signal processing filter designed to have a frequency response as flat as possible in the passband and\nroll-offs towards zero in the stopband. In other words, this filter is designed not to modify much the signal at the\nin the passband and attenuate as much as possible the signal at the stopband. At the moment onlylow and high pass\nfiltering is supported.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Butterworth',
              outputs: [
                {
                  description: null,
                  name: 'Filtered signal.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 50,
                  description: 'Defaults to 50.',
                  name: 'Order.',
                  options: null,
                  param: 'N',
                  type: 'int',
                },
                {
                  default_value: 0.1,
                  description:
                    'Number between 0 and 1, with 1 representing one-half of the sampling rate (Nyquist frequency).\nDefaults to 0.1.',
                  name: 'Critical frequency.',
                  options: null,
                  param: 'Wn',
                  type: 'float',
                },
                {
                  default_value: 'sos',
                  description: 'Defaults to "sos".',
                  name: 'Filtering method',
                  options: null,
                  param: 'output',
                  type: 'str',
                },
                {
                  default_value: 'lowpass',
                  description:
                    'The options are: "lowpass" and "highpass"\nDefaults to "lowpass".',
                  name: 'Filter type',
                  options: null,
                  param: 'btype',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'chebyshev',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Chebyshev filters are analog or digital filters having a steeper roll-off than Butterworth filters, and have\npassband ripple (type I) or stopband ripple (type II). Chebyshev filters have the property that they minimize the\nerror between the idealized and the actual filter characteristic over the range of the filter but with ripples in\nthe passband (Wikipedia).',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Chebyshev (I, II)',
              outputs: [
                {
                  description: null,
                  name: 'Filtered signal',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description: 'Options are 1 or 2. Defaults to 1.',
                  name: 'Filter type',
                  options: null,
                  param: 'filter_type',
                  type: 'int',
                },
                {
                  default_value: 10,
                  description: 'Defaults to 10.',
                  name: 'Order',
                  options: null,
                  param: 'N',
                  type: 'int',
                },
                {
                  default_value: 0.1,
                  description:
                    'Maximum ripple allowed below unity gain in the passband.\nDefaults to 0.1.',
                  name: 'Maximum ripple.',
                  options: null,
                  param: 'rp',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Number between 0 and 1, with 1 representing one-half of the sampling rate (Nyquist frequency).\nDefaults to 0.1.',
                  name: 'Critical frequency.',
                  options: null,
                  param: 'Wn',
                  type: 'float',
                },
                {
                  default_value: 'lowpass',
                  description:
                    'The options are: "lowpass" and "highpass"\nDefaults to "lowpass".',
                  name: 'Filter type',
                  options: null,
                  param: 'btype',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'ewma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The exponential moving average gives more weight to the more recent observations. The weights fall exponentially\nas the data point gets older. It reacts more than the simple moving average with regards to recent movements.\nThe moving average value is calculated following the definition yt=(1−α)yt−1+αxt if adjust = False or\nyt=(xt+(1−α)*xt−1+(1−α)^2*xt−2+...+(1−α)^t*x0) / (1+(1−α)+(1−α)^2+...+(1−α)^t) if adjust = True.',
              inputs: [
                {
                  description: 'Data with a pd.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Exp. weighted moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Defines how important the current observation is in the calculation of the EWMA. The longer the period, the slowly it adjusts to reflect current trends. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nThe time window is converted to the number of points for each of the windows. Each time window may have different number of points if the timeseries is not regular.\nThe number of points specify the decay of the exponential weights in terms of span α=2/(span+1), for span≥1.",
                  name: 'Time window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of data points inside a time window required to have a value (otherwise result is NA). Defaults to 1.\nIf min_periods > 1 and adjust is False, the SMA is computed for the first observation.',
                  name: 'Minimum number of data points.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'If true, the exponential function is calculated using weights w_i=(1−α)^i.\nIf false, the exponential function is calculated recursively using yt=(1−α)yt−1+αxt. Defaults to True.',
                  name: 'Adjust.',
                  options: null,
                  param: 'adjust',
                  type: 'bool',
                },
                {
                  default_value: 200,
                  description:
                    'Sets the maximum number of points to consider in a window if adjust = True. A high number of points will require more time to execute. Defaults to 200.',
                  name: 'Maximum number of data points.',
                  options: null,
                  param: 'max_pt',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'If true, resamples the calculated exponential moving average series. Defaults to False.',
                  name: 'Resample.',
                  options: null,
                  param: 'resample',
                  type: 'bool',
                },
                {
                  default_value: '60min',
                  description:
                    "Time window used to resample the calculated exponential moving average series. Defaults to '60min'.",
                  name: 'Resampling window',
                  options: null,
                  param: 'resample_window',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'lwma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The linear weighted moving average gives more weight to the more recent observations and gradually less to the older\nones.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Linear weighted moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the rolling mean. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.",
                  name: 'Time window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of observations in the time window required to estimate a value (otherwise result is NA). Defaults to 1.',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'Resamples the calculated linear weighted moving average series. Defaults to False',
                  name: 'Resample.',
                  options: null,
                  param: 'resample',
                  type: 'bool',
                },
                {
                  default_value: '60min',
                  description:
                    "Time window used to resample the calculated linear weighted moving average series. Defaults to '60min'.",
                  name: 'Resampling window.',
                  options: null,
                  param: 'resample_window',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'sg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Use this filter for smoothing data, without distorting the data tendency. The method is independent of\nthe sampling frequency, hence simple and robust to apply on data with non-uniform sampling. If working with\nhigh-frequency data (e.g. sampling frequency ~> 1 Hz) we recommend the user to provide the filter window length and\npolynomial order parameters to suit the requirements. Otherwise, if no parameters are provided, the function will\nestimate and set the parameters based on the characteristics of the input time series (e.g. sampling frequency).',
              inputs: [
                {
                  description:
                    'Time series to be smoothed. The series must have a pandas.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Saviztky-Golay',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Length of the filter window (i.e. number of data points). A large window results in a stronger\nsmoothing effect and vice-versa. If the filter window_length is not defined by the user, a\nlength of about 1/5 of the length of time series is set.',
                  name: 'Window.',
                  options: null,
                  param: 'window_length',
                  type: 'int',
                },
                {
                  default_value: 1,
                  description:
                    'The order of the polynomial used to fit the samples. Must be less than filter window length.\nHint: A small polyorder (e.g. polyorder = 1) results in a stronger data smoothing effect.\nDefaults to 1 if not specified. This typically results in a\nsmoothed time series representing the dominating data trend and attenuates the data fluctuations.',
                  name: 'Polynomial order.',
                  options: null,
                  param: 'polyorder',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'sma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Plain simple average that computes the sum of the values of the observations in a time_window divided by the number of observations in the time_window.\nSMA time series are much less noisy than the original time series. However, SMA time series lag the original time series, which means that changes in the trend are only seen with a delay (lag) of time_window/2.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Simple moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the average. Defaults to '60min'.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.",
                  name: 'Window',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of observations in window required to have a value (otherwise result is NA). Defaults  to 1.',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Statistics: [
        {
          category: 'Statistics',
          op: 'remove_outliers',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Identifies outliers combining two methods, dbscan and csap.\n\n- **dbscan**: Density-based clustering algorithm used to identify clusters of varying shape and size within a data\n set. Does not require a pre-determined set number of clusters. Able to identify outliers as noise, instead of\n classifying them into a cluster. Flexible when it comes to the size and shape of clusters, which makes it more\n useful for noise, real life data.\n\n- **csaps regression**: Cubic smoothing spline algorithm. Residuals from the regression are computed. Data points with\n high residuals (3 Standard Deviations from the Mean) are considered as outliers.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Outlier removal',
              outputs: [
                {
                  description: null,
                  name: 'Time series without outliers.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.9,
                  description:
                    'The smoothing parameter that determines the weighted sum of terms in the regression and it is limited by\nthe range [0,1]. Defaults to 0.9. Ref: https://csaps.readthedocs.io/en/latest/formulation.html#definition',
                  name: 'Smoothing factor.',
                  options: null,
                  param: 'reg_smooth',
                  type: 'float',
                },
                {
                  default_value: 4,
                  description:
                    'Minimum number of data points required to form a distinct cluster. Defaults to 4.\nDefines the minimum number of data points required to form a distinct cluster. Rules of thumb for selecting\nthe minimum samples value:\n\n* The larger the data set, the larger the value of MinPts should be.\n* If the data set is noisier, choose a larger value of MinPts Generally, MinPts should be greater than or\n  equal to the dimensionality of the data set. For 2-dimensional data, use DBSCAN’s default value of 4\n  (Ester et al., 1996).\n* If your data has more than 2 dimensions, choose MinPts = 2*dim, where dim= the dimensions of your data\n  set (Sander et al., 1998).',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_samples',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'Defaults to None.  Defines the maximum distance between two samples for one to be considered as in the\nneighborhood of the other (i.e. belonging to the same cluster). The value of this parameter is automatically\nset after using a Nearest Neighbors algorithm to calculate the average distance between each point and its k\nnearest neighbors, where k = min_samples (minimum samples). In ascending order on a k-distance graph, the\noptimal value for the threshold is at the point of maximum curvature (i.e. after plotting the average\nk-distances in where the graph has the greatest slope). This is not a maximum bound on the distances of\npoints within a cluster. This is the most important DBSCAN parameter to choose appropriately for your data\nset and distance function. If no value is given, it is set automatically using nearest neighbors algorithm.\nDefaults to None.',
                  name: 'Distance threshold.',
                  options: null,
                  param: 'eps',
                  type: 'float',
                },
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the rolling mean. The rolling mean and the data point value are the two features considered when calculating the distance to the furthest neighbour.\nThis distance allows us to find the right epsilon when training dbscan. Defaults to '60min'.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nIf a number without unit (such as '60')is given, it will be considered as the number of minutes.",
                  name: 'Window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'Removes data points containing a value of 0. Defaults to False.',
                  name: 'Remove zeros.',
                  options: null,
                  param: 'del_zero_val',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Operators: [
        {
          category: 'Operators',
          op: 'absolute',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Absolute value of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Absolute value',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'add',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Add any two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Add',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arccos',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric arccosine of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arccos',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arccosh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arccosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arccosh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arcsin',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric arcsine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arcsin',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arcsinh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arcsine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arcsinh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctan',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculate inverse hyperbolic tangent of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctan',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctan2',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Element-wise arc tangent of x1/x2 choosing the quadrant correctly.',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctan(x1, x2)',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctanh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arctangent of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arithmetic_mean',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Mean of two time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'Time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arithmetic mean',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'bin_map',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Maps to a binary array by checking if one timeseries is greater than another',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise greater-than',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'ceil',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Rounds a time series up to the nearest integer greater than or equal to the current value',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round up',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'clip',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Given an interval, values of the time series outside the interval are clipped to the interval edges.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Clip(low, high)',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: -99999999999999,
                  description: 'Lower clipping limit. Default: -infinity',
                  name: 'Lower limit',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: 99999999999999,
                  description: 'Upper clipping limit. Default: +infinity',
                  name: 'Upper limit',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'cos',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric cosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Cos',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'cosh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic cosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Cosh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'deg2rad',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Converts angles from degrees to radians',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Degrees to radians',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'differentiate',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Differentiation (finite difference) using a second-order accurate numerical method (central difference).\nBoundary points are computed using a first-order accurate method.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Differentiation',
              outputs: [
                {
                  description: null,
                  name: 'First order derivative.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Current granularity for the chart on-screen (auto-given).',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'auto',
                  description:
                    "User defined granularity to potentially override unit of time.\nAccepts integer followed by time unit string (s|m|h|d). For example: '1s', '5m', '3h' or '1d'.",
                  name: 'Frequency.',
                  options: null,
                  param: 'time_unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'div',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Divide two time series or numbers. If the time series in the denominator contains zeros,\nall instances are dropped from the final result.',
              inputs: [
                {
                  description: null,
                  name: 'Numerator',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Denominator',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Division',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'exp',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the exponential of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Exp',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'floor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Rounds a time series down to the nearest integer smaller than or equal to the current value',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round down',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'get_timestamps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Get timestamps of the time series as values.\nThe timestamps follow the Unix convention (Number of seconds\nstarting from January 1st, 1970). Precision loss in the order of\nnanoseconds may happen if unit is not nanoseconds.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Get index of time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Timestamp unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'inv',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Element-wise inverse of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Inverse',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the natural logarithm of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Ln',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log10',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base 10 of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log base 10',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log2',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base 2 of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log base 2',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'logn',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base “n” of a time series',
              inputs: [
                {
                  description: null,
                  name: 'Input time-series or number',
                  param: 'x',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Base time-series or number',
                  param: 'base',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log, any base',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'maximum',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Computes the maximum value of two timeseries or numbers',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise maximum',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'minimum',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Computes the minimum value of two timeseries',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise minimum',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'mod',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Modulo of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'dividend time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'divisor time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Modulo',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'mul',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Multiply two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Multiplication',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'neg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Negation of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Negation',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'power',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Power of time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'base time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'exponent time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Power',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'rad2deg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Converts angles from radiants to degrees.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Radians to degrees',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'remove',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Remove values in a time series. The values to remove should be a semicolon-separated list.\nUndefined and infinity values can be replaced by using nan, inf and -inf (e.g. 1.0, 5, inf, -inf, 20, nan).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Remove',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'List of values to remove. The values must be seperated by semicolons. Infinity and undefined values can be\nreplaced by using the keywords inf, -inf and nan.',
                  name: 'Remove',
                  options: null,
                  param: 'to_remove',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'replace',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Replace values in a time series. The values to replace should be a semicolon-separated list.\nUndefined and infinity values can be replaced by using nan, inf and -inf (e.g. 1.0, 5, inf, -inf, 20, nan).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Replace',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'List of values to replace. The values must be seperated by semicolons. Infinity and undefined values can be\nreplaced by using the keywords inf, -inf and nan. The default is to replace no values.',
                  name: 'Replace',
                  options: null,
                  param: 'to_replace',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: 'Value used as replacement. Default is 0.0',
                  name: 'By',
                  options: null,
                  param: 'value',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'round',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Rounds a time series to a given number of decimals',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'number of decimals',
                  options: null,
                  param: 'decimals',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'set_timestamps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Sets the time series values to the Unix timestamps.\nThe timestamps follow the Unix convention (Number of seconds\nstarting from January 1st, 1970). Both input time series\nmust have the same length.',
              inputs: [
                {
                  description: null,
                  name: 'Timestamp time series',
                  param: 'timestamp_series',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Value time series',
                  param: 'value_series',
                  types: ['ts'],
                },
              ],
              name: 'Set index of time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Timestamp unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sign',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Element-wise indication of the sign of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sign',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sin',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric sine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sin',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sinh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic sine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sinh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sliding_window_integration',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Siding window integration using trapezoidal rule.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Sliding window integration',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '0 days 00:05:00',
                  description:
                    "the length of time the window. Defaults to '5 minute'. Valid time units are:\n\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'window_length',
                  options: null,
                  param: 'window_length',
                  type: 'str',
                },
                {
                  default_value: '0 days 01:00:00',
                  description:
                    "if the integrands rate is per sec, per hour, per day.\nDefaults to '1 hour'. Valid time units are:\n\n    * ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n    * ‘days’ or ‘day’\n    * ‘hours’, ‘hour’, ‘hr’, or ‘h’\n    * ‘minutes’, ‘minute’, ‘min’, or ‘m’\n    * ‘seconds’, ‘second’, or ‘sec’\n    * ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n    * ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n    * ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'integrand_rate.',
                  options: null,
                  param: 'integrand_rate',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sqrt',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Square root of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Square root',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sub',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'The difference between two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Subtraction',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'tan',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric tangent of a timeseries.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Tan',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'tanh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic tangent of time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Tanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'threshold',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Indicates if the input series exceeds the lower and higher limits. The output series\nis 1.0 if the input is between the (inclusive) limits, and 0.0 otherwise.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Threshold',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: -99999999999999,
                  description: 'threshold. Default: -infinity',
                  name: 'Lower limit',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: 99999999999999,
                  description: 'threshold. Default: +infinity',
                  name: 'Upper limit',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'time_shift',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Shift time series by a time period',
              inputs: [
                {
                  description: null,
                  name: 'Time-series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Shift time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description: 'Number of time periods to shift',
                  name: 'Time periods to shift',
                  options: null,
                  param: 'n_units',
                  type: 'float',
                },
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Time period unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'trapezoidal_integration',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Cumulative integration using trapezoidal rule with an optional user-defined time unit.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Integration',
              outputs: [
                {
                  description: null,
                  name: 'Cumulative integral.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Current granularity for the chart on-screen (auto-given).',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'auto',
                  description:
                    "User defined granularity to potentially override unit of time.\nAccepts integer followed by time unit string (s|m|h|d). For example: '1s', '5m', '3h' or '1d'.",
                  name: 'Frequency.',
                  options: null,
                  param: 'time_unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'union',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Takes the union of two time series. If a time stamp\noccurs in both series, the value of the first time series is used.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'series1',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'time series',
                  param: 'series2',
                  types: ['ts'],
                },
              ],
              name: 'Union',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
      ],
    });
  });

  it('should group by category and respect ignored categories when provided', () => {
    const operationsGroupedByCategory = getOperationsGroupedByCategory(
      fullListOfOperations,
      ['Not listed operations']
    );

    expect(operationsGroupedByCategory).toEqual({
      'Data quality': [
        {
          category: 'Data quality',
          op: 'extreme',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Outlier detector and removal based on the [paper from Gustavo A. Zarruk](https://iopscience.iop.org/article/10.1088/0957-0233/16/10/012/meta). The procedure is as follows:\n\n * Fit a polynomial curve to the model using all of the data\n * Calculate the studentized deleted (or externally studentized) residuals\n * These residuals follow a t distribution with degrees of freedom n - p - 1\n * Bonferroni critical value can be computed using the significance level (alpha) and t distribution\n * Any values that fall outside of the critical value are treated as anomalies\n\nUse of the hat matrix diagonal allows for the rapid calculation of deleted residuals without having to refit\nthe predictor function each time.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Extreme outliers removal',
              outputs: [
                {
                  description: null,
                  name: 'Time series without outliers.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 0.05,
                  description: null,
                  name: 'Significance level.',
                  options: null,
                  param: 'alpha',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description:
                    'Relaxation factor for the Bonferroni critical value. Smaller values will make anomaly detection more\nconservative. Defaults to 1',
                  name: 'Factor.',
                  options: null,
                  param: 'bc_relaxation',
                  type: 'float',
                },
                {
                  default_value: 3,
                  description:
                    'Order of the polynomial used for the regression function',
                  name: 'Polynomial order.',
                  options: null,
                  param: 'poly_order',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_iqr',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using the [interquartile range (IQR)](https://en.wikipedia.org/wiki/Interquartile_range) method. The IQR is a measure of statistical\ndispersion, which is the spread of the data. Any time steps that are more than 1.5 IQR above Q3 are considered\ngaps in the data.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, IQR',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_modified_z_scores',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using modified Z-scores. Gaps are defined as time periods\nwhere the Z-score is larger than cutoff.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, mod. Z-scores',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 3.5,
                  description:
                    'Time-periods are considered gaps if the modified Z-score is over this cut-off value. Default 3.5.',
                  name: 'Cut-off',
                  options: null,
                  param: 'cutoff',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'gaps_identification_z_scores',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect gaps in the time stamps using [Z-scores ](https://en.wikipedia.org/wiki/Standard_score). Z-score stands for\nthe number of standard deviations by which the value of a raw score (i.e., an observed value or data point) is\nabove or below the mean value of what is being observed or measured. This method assumes that the time step sizes\nare normally distributed. Gaps are defined as time periods where the Z-score is larger than cutoff.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Gaps detection, Z-scores',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a gap, and 0 otherwise.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 3,
                  description:
                    'Time periods are considered gaps if the Z-score is over this cut-off value. Default 3.0.',
                  name: 'Cut-off',
                  options: null,
                  param: 'cutoff',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Raise a warning if the data is not normally distributed.\nThe Shapiro-Wilk test is used. The test is only performed if the the time series contains at least 50 data points.',
                  name: 'Test for normality',
                  options: null,
                  param: 'test_normality_assumption',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Data quality',
          op: 'negative_running_hours_check',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                "Negative running hours model is created in order to automate data quality check for time series with values that\nshouldn't be decreasing over time. One example would be Running Hours (or Hour Count) time series - a specific type\nof time series that is counting the number of running hours in a pump. Given that we expect the number of running\nhours to either stay the same (if the pump is not running) or increase with time (if the pump is running), the\ndecrease in running hours value indicates bad data quality. Although the algorithm is originally created for\nRunning Hours time series, it can be applied to all time series where the decrease in value is a sign of bad data\nquality.",
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'x',
                  types: ['ts'],
                },
              ],
              name: 'Negative running hours',
              outputs: [
                {
                  description:
                    'The returned time series is an indicator function that is 1 where there is a decrease in time series\nvalue, and 0 otherwise. The indicator will be set to 1 until the data gets "back to normal" (that is,\nuntil time series reaches the value it had before the value drop).',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description:
                    'This threshold indicates for how many hours the time series value needs to drop (in hours) before we\nconsider it bad data quality. Threshold must be a non-negative float. By default, the threshold is set to 0.',
                  name: 'Threshold for value drop.',
                  options: null,
                  param: 'threshold',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Detect: [
        {
          category: 'Detect',
          op: 'cpd_ed_pelt',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect change points in a time series. The time series is split into "statistically homogeneous" segments using the\nED Pelt change point detection algorithm while observing the minimum distance argument.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Change Point Detection',
              outputs: [
                {
                  description: 'Binary time series.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description:
                    'Specifies the minimum point wise distance for each segment that will be considered in the Change\nPoint Detection algorithm.',
                  name: 'Minimum distance',
                  options: null,
                  param: 'min_distance',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'drift',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detects data drift (deviation) by comparing two rolling averages, short and long interval, of the signal. The\ndeviation between the short and long term average is considered significant if it is above a given threshold\nmultiplied by the rolling standard deviation of the long term average.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Drift',
              outputs: [
                {
                  description: 'Drift = 1, No drift = 0.',
                  name: 'Boolean time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '3d',
                  description: 'Length of long term time interval.',
                  name: 'Long length.',
                  options: null,
                  param: 'long_interval',
                  type: 'str',
                },
                {
                  default_value: '4h',
                  description: 'Length of short term time interval.',
                  name: 'Short length.',
                  options: null,
                  param: 'short_interval',
                  type: 'str',
                },
                {
                  default_value: 3,
                  description:
                    'Parameter that determines the signal has changed significantly enough to be considered drift. The threshold\nis multiplied by the long term rolling standard deviation to take into account the recent condition of the\nsignal.',
                  name: 'Threshold.',
                  options: null,
                  param: 'std_threshold',
                  type: 'float',
                },
                {
                  default_value: 'both',
                  description:
                    'Parameter to determine if the model should detect significant decreases, increases or both. Options are:\n"decrease", "increase" or "both". Defaults to "both"',
                  name: 'Type.',
                  options: null,
                  param: 'detect',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'ssd_cpd',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Detect steady state periods in a time series based on a change point detection algorithm. The time series is split\ninto "statistically homogeneous" segments using the ED Pelt change point detection algorithm. Then each segment is tested with regards\nto a normalized standard deviation and the slope of the line of best fit to determine if the segment can be\nconsidered a steady or transient region.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Steady State Detection (CPD)',
              outputs: [
                {
                  description: 'Steady state = 1, Transient = 0.',
                  name: 'Binary time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 15,
                  description:
                    'Specifies the minimum point wise distance for each segment that will be considered in the Change\nPoint Detection algorithm.',
                  name: 'Minimum distance.',
                  options: null,
                  param: 'min_distance',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description:
                    'Specifies the variance threshold. If the normalized variance calculated for a given segment is greater than\nthe threshold, the segment will be labeled as transient (value = 0).',
                  name: 'Variance threshold.',
                  options: null,
                  param: 'var_threshold',
                  type: 'float',
                },
                {
                  default_value: -3,
                  description:
                    'Specifies the slope threshold. If the slope of a line fitted to the data of a given segment is greater than\n10 to the power of the threshold value, the segment will be labeled as transient (value = 0).',
                  name: 'Slope threshold.',
                  options: null,
                  param: 'slope_threshold',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'ssid',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Steady state detector based on the ration of two variances estimated from the same signal [#]_ . The algorithm first\nfilters the data using the factor "Alpha 1" and calculates two variances (long and short term) based on the\nparameters "Alpa 2" and "Alpha 3". The first variance is an exponentially weighted moving variance based on the\ndifference between the data and the average. The second is also an exponentially weighted moving “variance” but\nbased on sequential data differences. Larger Alpha values imply that fewer data are involved in the analysis,\nwhich has a benefit of reducing the time for the identifier to detect a process change (average run length, ARL)\nbut has a undesired impact of increasing the variability on the results, broadening the distribution and\nconfounding interpretation. Lower λ values undesirably increase the average run length to detection, but increase\nprecision (minimizing Type-I and Type-II statistical errors) by reducing the variability of the distributions\nincreasing the signal-to-noise ratio of a TS to SS situation.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Steady state (variance)',
              outputs: [
                {
                  description: 'Steady state = 0, transient = 1.',
                  name: 'Binary time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2.5,
                  description:
                    'Specifies the variance ratio threshold if it is in steady state or not. A variance ratio greater than the\nthreshold labels the state as transient.',
                  name: 'Threshold.',
                  options: null,
                  param: 'ratio_lim',
                  type: 'float',
                },
                {
                  default_value: 0.2,
                  description:
                    'Filter factor for the mean. Value should be between 0 and 1. Recommended value is 0.2.\nDefaults to 0.2.',
                  name: 'Alpha 1.',
                  options: null,
                  param: 'alpha1',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 1. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 2.',
                  options: null,
                  param: 'alpha2',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Filter factor for variance 2. Value should be between 0 and 1. Recommended value is 0.1.\nDefaults to 0.1.',
                  name: 'Alpha 3.',
                  options: null,
                  param: 'alpha3',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Detect',
          op: 'vma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This moving average is designed to become flat (constant value) when the data\nwithin the lookup window does not vary significantly. It can also be state detector. The calculation is based on\nthe variability of the signal in a lookup window.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Steady state (vma)',
              outputs: [
                {
                  description:
                    'If the results has the same value as the previous moving average result, the signal can be considered to\nbe on steady state.',
                  name: 'Moving average.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 10,
                  description:
                    'Window length in data points used to estimate the variability of the signal.',
                  name: 'Lookup window.',
                  options: null,
                  param: 'window_length',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Filter: [
        {
          category: 'Filter',
          op: 'status_flag_filter',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Function to filter any given data series by a series with integers denoting different states. A typical example of\nsuch a series is typically a series of 0 and 1 where 1 would indicate the presence of an anomaly.\nThe status flag filter retrieves all relevant indices and matches these to the data series.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
                {
                  description:
                    'Time series values are expected to be integers. If not, values are cast to integer automatically.',
                  name: 'Status flag time series.',
                  param: 'filter_by',
                  types: ['ts'],
                },
              ],
              name: 'Status flag filter',
              outputs: [
                {
                  description: null,
                  name: 'Filtered time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description: 'Value to filter by in the boolean filter',
                  name: 'Value.',
                  options: null,
                  param: 'int_to_keep',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Filter',
          op: 'wavelet_filter',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
              inputs: [
                {
                  description:
                    'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Wavelet de-noising',
              outputs: [
                {
                  description: null,
                  name: 'Filtered time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description:
                    'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                  name: 'Level.',
                  options: null,
                  param: 'level',
                  type: 'int',
                },
                {
                  default_value: 'db8',
                  description:
                    'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                  name: 'Type.',
                  options: [
                    {
                      label: 'DAUBECHIES_1',
                      value: 'db1',
                    },
                    {
                      label: 'DAUBECHIES_2',
                      value: 'db2',
                    },
                    {
                      label: 'DAUBECHIES_3',
                      value: 'db3',
                    },
                    {
                      label: 'DAUBECHIES_4',
                      value: 'db4',
                    },
                    {
                      label: 'DAUBECHIES_5',
                      value: 'db5',
                    },
                    {
                      label: 'DAUBECHIES_6',
                      value: 'db6',
                    },
                    {
                      label: 'DAUBECHIES_7',
                      value: 'db7',
                    },
                    {
                      label: 'DAUBECHIES_8',
                      value: 'db8',
                    },
                    {
                      label: 'SYMLETS_1',
                      value: 'sym1',
                    },
                    {
                      label: 'SYMLETS_2',
                      value: 'sym2',
                    },
                    {
                      label: 'SYMLETS_3',
                      value: 'sym3',
                    },
                    {
                      label: 'SYMLETS_4',
                      value: 'sym4',
                    },
                  ],
                  param: 'wavelet',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Fluid Dynamics': [
        {
          category: 'Fluid Dynamics',
          op: 'Haaland',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The [Haaland equation ](https://en.wikipedia.org/wiki/Darcy_friction_factor_formulae#Haaland_equation) was\nproposed in 1983 by Professor S.E. Haaland of the Norwegian Institute of Technology.\nIt is used to solve directly for the Darcy–Weisbach friction factor for a full-flowing circular pipe. It is an\napproximation of the implicit Colebrook–White equation, but the discrepancy from experimental data is well within\nthe accuracy of the data.',
              inputs: [
                {
                  description: null,
                  name: 'Reynolds Number',
                  param: 'Re',
                  types: ['ts'],
                },
              ],
              name: 'Haaland equation',
              outputs: [
                {
                  description: null,
                  name: 'Friction factor',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'Surface roughness',
                  options: null,
                  param: 'roughness',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Fluid Dynamics',
          op: 'Re',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The Reynolds number is the ratio of inertial forces to viscous forces within a fluid which is subjected to\nrelative internal movement due to different fluid velocities.',
              inputs: [
                {
                  description: null,
                  name: 'Flow speed.',
                  param: 'speed',
                  types: ['ts'],
                },
              ],
              name: 'Reynolds Number',
              outputs: [
                {
                  description: null,
                  name: 'Reynolds number',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: 'Density of the fluid',
                  name: 'Density.',
                  options: null,
                  param: 'density',
                  type: 'float',
                },
                {
                  default_value: null,
                  description: 'Dynamic viscosity of the fluid',
                  name: 'Dynamic viscosity.',
                  options: null,
                  param: 'd_viscosity',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'Characteristic linear dimension. A characteristic length is an important dimension that defines the scale\nof a physical system. Often, the characteristic length is the volume of a system divided by its surface',
                  name: 'Characteristic length.',
                  options: null,
                  param: 'length_scale',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Forecast: [
        {
          category: 'Forecast',
          op: 'arma_predictor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The ARMA predictor works by fitting constants to a auto regression (AR) and to a moving average (MA) equation and\nextrapolating the results.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'ARMA predictor',
              outputs: [
                {
                  description:
                    'Predicted data for the test fraction of the input data (e.g. 1 - train_fraction)',
                  name: 'Prediction',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description: null,
                  name: 'Number of AR terms.',
                  options: null,
                  param: 'ar_order',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description: null,
                  name: 'Number of MA terms.',
                  options: null,
                  param: 'ma_order',
                  type: 'int',
                },
                {
                  default_value: 0.8,
                  description:
                    'Fraction of the input data used for training the model',
                  name: 'Fraction.',
                  options: null,
                  param: 'train_fraction',
                  type: 'float',
                },
                {
                  default_value: 'onestep',
                  description:
                    'Type of prediction to perform. MULTISTEP involves forecasting\nseveral steps ahead of the training dataset while ONESTEP involves incrementally going through the test\ndataset, appending it to the training dataset by performing a one-step forecast.',
                  name: 'Method',
                  options: [
                    {
                      label: 'ONESTEP',
                      value: 'onestep',
                    },
                    {
                      label: 'MULTISTEP',
                      value: 'multistep',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Number of steps to forecast ahead of the training dataset.',
                  name: 'Steps.',
                  options: null,
                  param: 'steps',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Forecast',
          op: 'holt_winters_predictor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This technique (also known by Holt-Winters) can be used to forecast time series data which displays a trend and a\nseasonality.\nIt works by utilizing exponential smoothing thrice - for the average value, the trend and the seasonality.\nValues are predicted by combining the effects of these influences.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Triple exponential smoothing',
              outputs: [
                {
                  description:
                    'Predicted data for the test fraction of the input data (e.g. 1 - train_fraction).',
                  name: 'Prediction.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'The value for the seasonal periods is chosen such that it denotes the number of timesteps within a period,\ne.g., 7*24 for hourly data with a weekly seasonality or 365 for daily data with a yearly pattern. Take care!\nA time series which shows a spike every day, but not on Sunday, does not have a daily seasonality, but a\nweekly seasonality!',
                  name: 'Number of periods per cycle.',
                  options: null,
                  param: 'seasonal_periods',
                  type: 'int',
                },
                {
                  default_value: 'add',
                  description:
                    'Additive seasonality: Amount of adjustment is constant.\nMultiplicative seasonality: Amount of adjustment varies with the level of the series.',
                  name: 'Seasonality.',
                  options: [
                    {
                      label: 'add',
                      value: 'add',
                    },
                    {
                      label: 'mul',
                      value: 'mul',
                    },
                  ],
                  param: 'seasonality',
                  type: 'str',
                },
                {
                  default_value: 'add',
                  description:
                    'Additive seasonality: Amount of adjustment is constant.\nMultiplicative seasonality: Amount of adjustment varies with the level of the series.',
                  name: 'Trend.',
                  options: [
                    {
                      label: 'add',
                      value: 'add',
                    },
                    {
                      label: 'mul',
                      value: 'mul',
                    },
                  ],
                  param: 'trend',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'If the trend component shall be dampened. Useful if this method is used to predict very far in the future\nand it is reasonable to assume that the trend will not stay constant, but flatten out.',
                  name: 'Dampen the trend component.',
                  options: null,
                  param: 'dampen_trend',
                  type: 'bool',
                },
                {
                  default_value: 1,
                  description:
                    'Number of steps to forecast ahead of the training dataset.',
                  name: 'Steps.',
                  options: null,
                  param: 'steps',
                  type: 'int',
                },
                {
                  default_value: 0.8,
                  description:
                    'Fraction of the input data used for training the model.',
                  name: 'Fraction.',
                  options: null,
                  param: 'train_fraction',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Oil and gas': [
        {
          category: 'Oil and gas',
          op: 'calculate_gas_density',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The gas density is calculated from real gas laws.The psuedo critical tempreature and pressure is\ncalculated from specific gravity following [Sutton (1985) ](https://doi.org/10.2118/14265-MS). The\n[Beggs and Brill (1973) ](https://onepetro.org/JPT/article-abstract/25/05/607/165212/A-Study-of-Two-Phase-Flow-in-Inclined-Pipes)\nmethod (explicit) is used to calculate the compressibility factor. All equations used here can be found in one place at\n[Kareem et. al. ](https://link.springer.com/article/10.1007/s13202-015-0209-3). The gas equation *Pv = zRT*\nis used to calculate the gas density.',
              inputs: [
                {
                  description: 'Pressure time series in psi units.',
                  name: 'Pressure',
                  param: 'pressure',
                  types: ['ts'],
                },
                {
                  description:
                    'Temperature time series in degrees Fahrenheit units.',
                  name: 'Temperature',
                  param: 'temperature',
                  types: ['ts'],
                },
              ],
              name: 'Gas density calculator',
              outputs: [
                {
                  description:
                    'Estimated gas density in pound-force per cubic foot (pcf).',
                  name: 'Gas density',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.5534,
                  description: 'Specific gravity of the gas.',
                  name: 'Specific gravity',
                  options: null,
                  param: 'sg',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_shutin_interval',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The shut-in interval is defined as period when the valve is in closed state. The close state is determined based\non the calculated manually-given threshold. The threshold is calculated based on the analysis of the valve signal\nhistogram.',
              inputs: [
                {
                  description: 'Shut-in valve signal',
                  name: 'Shut-in valve signal.',
                  param: 'shut_valve',
                  types: ['ts'],
                },
              ],
              name: 'Shut-in interval',
              outputs: [
                {
                  description:
                    'Binary time series indicating open state or closed state: Open state= 1, Close state = 0.',
                  name: 'Shut-in periods.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 6,
                  description:
                    'Minimum shut-in length in hours to be considered for detection',
                  name: 'Minimum time.',
                  options: null,
                  param: 'min_shutin_len',
                  type: 'int',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum time between consecutive shut-ins in hours to validate change of state',
                  name: 'Time between.',
                  options: null,
                  param: 'min_time_btw_shutins',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'Indicator to tell the algorithm if the shut-in state is below the threshold',
                  name: 'Below threshold.',
                  options: null,
                  param: 'shutin_state_below_threshold',
                  type: 'bool',
                },
                {
                  default_value: null,
                  description:
                    'Threshold between the valve open and close states. Defaults to None meaning that the threshold is calculated',
                  name: 'Threshold.',
                  options: null,
                  param: 'shutin_threshold',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_shutin_variable',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Shut-in variable calculator is a function to compute the variable of interest at specific times after the shut-in\nonset. Typically, variables of interest are pressure and temperature. The function is the dependency of the shut-in\ndetector. Based on the detected shut-in interval, the function uses specified number of hours indicating the time after\nthe onset of each shut-in and calculates the variable of interest at that time instance using interpolation (method - time).',
              inputs: [
                {
                  description: 'Typically pressure or temperature signal',
                  name: 'Signal of interest.',
                  param: 'variable_signal',
                  types: ['ts'],
                },
                {
                  description:
                    'The signal comes from a shut-in detector function or a signal indicating shut-in condition\n(0 - well in shut-in state, 1 - well in flowing state). We suggest using the\n:meth:`indsl.oil_and_gas.calculate_shutin_interval`',
                  name: 'Shut-in signal.',
                  param: 'shutin_signal',
                  types: ['ts'],
                },
              ],
              name: 'Shut-in variable calculator',
              outputs: [
                {
                  description:
                    'Signal of interest at specific time after shut-in onset.',
                  name: 'Output.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Hours after shut-in onset at which to calculate the signal of interest',
                  name: 'Hours after.',
                  options: null,
                  param: 'hrs_after_shutin',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'calculate_well_prod_status',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Determine if the well is producing. In order for this to be the case, the following has to happen:\n* All Master, Wing and Choke data have to come from the same well.\n* Check if the master, wing and choke valve openings are above their respective threshold values at a given time.\n* If any of the valves are below the threshold opening, then the well is closed.\n* If all of the valves are above the threshold opening, then the well is open.\n* Threshold values should be between 0-100.',
              inputs: [
                {
                  description: 'Time series of the master valve.',
                  name: 'Master Valve',
                  param: 'master_valve',
                  types: ['ts'],
                },
                {
                  description: 'Time series of the wing valve.',
                  name: ' Wing Valve',
                  param: 'wing_valve',
                  types: ['ts'],
                },
                {
                  description: 'Time series of the choke valve.',
                  name: ' Choke Valve',
                  param: 'choke_valve',
                  types: ['ts'],
                },
              ],
              name: 'Check if the well is producing',
              outputs: [
                {
                  description:
                    'Well production status (1 means open, 0 means closed).',
                  name: 'Well Status',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Master threshold',
                  options: null,
                  param: 'threshold_master',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Wing threshold',
                  options: null,
                  param: 'threshold_wing',
                  type: 'float',
                },
                {
                  default_value: 5,
                  description: 'Threshold percentage value from 0%-100%.',
                  name: 'Choke threshold',
                  options: null,
                  param: 'threshold_choke',
                  type: 'float',
                },
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Oil and gas',
          op: 'productivity_index',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The productivity index or PI is defined as the gas flow rate at the well divided by the difference in pressure\nbetween the reservoir and bottom hole. If there is no data available for any of the inputs for a specific\ntimestamp, then it will be ignored.',
              inputs: [
                {
                  description: null,
                  name: 'Reservoir pressure.',
                  param: 'p_res',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Bottomhole pressure.',
                  param: 'p_bh',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Gas flowrate.',
                  param: 'Q_gas',
                  types: ['ts'],
                },
              ],
              name: 'Productivity Index',
              outputs: [
                {
                  description: null,
                  name: 'Productivity index.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Regression: [
        {
          category: 'Regression',
          op: 'poly_regression',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Fit a polynomial curve of a specified degree to the data. Default method corresponds to a ordinary least squares\nfitting procedure but method can be changed to allow for L1 or L2 regularisation.',
              inputs: [
                {
                  description: 'Data to fit the polynomial regression',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Polynomial',
              outputs: [
                {
                  description: null,
                  name: 'Fitted data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description: null,
                  name: 'Polynomial order.',
                  options: null,
                  param: 'order',
                  type: 'int',
                },
                {
                  default_value: 'No regularisation',
                  description:
                    'Type of regularisation to apply (Lasso or Ridge). Default is simple linear least squares with no regularisation.',
                  name: 'Method.',
                  options: [
                    {
                      label: 'Lasso',
                      value: 'Lasso',
                    },
                    {
                      label: 'Ridge',
                      value: 'Ridge',
                    },
                    {
                      label: 'No regularisation',
                      value: 'No regularisation',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 0.1,
                  description:
                    'Only applies to either Ridge or Lasso methods which sets the penalty for either L2 or L1 regularisation.\nValue of 0 means that there is no penalty and this essentially equivalent to ordinary least squares.',
                  name: 'Alpha.',
                  options: null,
                  param: 'alpha',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Resample: [
        {
          category: 'Resample',
          op: 'interpolate',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Interpolates and resamples data with a uniform sampling frequency.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Interpolation',
              outputs: [
                {
                  description: null,
                  name: 'Interpolated time series.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 'linear',
                  description:
                    "Specifies the interpolation method. Defaults to \"linear\". Possible inputs are :\n\n* 'linear': linear interpolation.\n* 'ffill': forward filling.\n* 'stepwise': yields same result as ffill.\n* 'zero', 'slinear', 'quadratic', 'cubic': spline interpolation of zeroth, first, second or third order.",
                  name: 'Method.',
                  options: [
                    {
                      label: 'linear',
                      value: 'linear',
                    },
                    {
                      label: 'ffill',
                      value: 'ffill',
                    },
                    {
                      label: 'stepwise',
                      value: 'stepwise',
                    },
                    {
                      label: 'zero',
                      value: 'zero',
                    },
                    {
                      label: 'slinear',
                      value: 'slinear',
                    },
                    {
                      label: 'quadratic',
                      value: 'quadratic',
                    },
                    {
                      label: 'cubic',
                      value: 'cubic',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 'pointwise',
                  description:
                    "Specifies the kind of returned data points. Defaults to \"pointwise\".  Possible inputs are :\n\n* 'pointwise': returns the pointwise value of the interpolated function for each timestamp.\n* 'average': returns the average of the interpolated function within each time period.",
                  name: 'Kind.',
                  options: [
                    {
                      label: 'pointwise',
                      value: 'pointwise',
                    },
                    {
                      label: 'average',
                      value: 'average',
                    },
                  ],
                  param: 'kind',
                  type: 'str',
                },
                {
                  default_value: '1s',
                  description:
                    "Sampling frequency or granularity of the output (e.g. '1s' or '2h'). 'min' refers to minutes and 'M' to\nmonths. Defaults to \"1s\".",
                  name: 'Frequency.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    '- 1: Fill in for requested points outside of the data range.\n- 0: Ignore said points. Defaults to 1.\n\nDefault behaviour is to raise a UserValueError if the data range is not within start and end and no outside fill\nmethod is specified (value 1).',
                  name: 'Bounded.',
                  options: null,
                  param: 'bounded',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    "Specifies how to fill values outside input data range ('None' or 'extrapolate'). Defaults to None.",
                  name: 'Outside fill.',
                  options: null,
                  param: 'outside_fill',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'reindex',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This method offers data reindexing onto a common index and fills missing data points.\nIf bounded is false, the common index is the union of the the input time-series indices.\nIf bounded is true, the common index is restricted to the period where the time-series overlap.',
              inputs: [
                {
                  description: null,
                  name: 'First time series.',
                  param: 'data1',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Second time series.',
                  param: 'data2',
                  types: ['ts'],
                },
              ],
              name: 'Reindex',
              outputs: [
                {
                  description:
                    'pandas.Series: Second reindexed time series\nReindexed time series with common indices.',
                  name: 'First reindexed time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 'first order spline interpolation',
                  description:
                    "Specifies the interpolation method. Defaults to \"linear\". Possible inputs are :\n\n* 'zero_previous': zero order spline interpolation with forward filling mode, i.e. the previous known value of any point is used.\n* 'zero_next': zero order spline interpolation with backward filling mode, i.e. the next known value of any point is used.\n* 'linear': linear order spline interpolation.\n* 'quadratic': quadratic order spline interpolation.\n* 'cubic': cubic order spline interpolation.",
                  name: 'Method.',
                  options: [
                    {
                      label: 'ZERO_PREVIOUS',
                      value:
                        'zero order spline interpolation (forward filling)',
                    },
                    {
                      label: 'ZERO_NEXT',
                      value:
                        'zero order spline interpolation (backward filling)',
                    },
                    {
                      label: 'LINEAR',
                      value: 'first order spline interpolation',
                    },
                    {
                      label: 'QUADRATIC',
                      value: 'second order plines interpolation',
                    },
                    {
                      label: 'CUBIC',
                      value: 'third order plines interpolation',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: 'pointwise',
                  description:
                    "Specifies the kind of returned data points. Defaults to \"pointwise\".  Possible inputs are:\n\n* 'pointwise': returns the pointwise value of the interpolated function for each timestamp.\n* 'average': returns the average of the interpolated function within each time period.",
                  name: 'Kind.',
                  options: [
                    {
                      label: 'POINTWISE',
                      value: 'pointwise',
                    },
                    {
                      label: 'AVERAGE',
                      value: 'average',
                    },
                  ],
                  param: 'kind',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'Specifies if the output should be bounded to avoid extrapolation. Defaults to False. Possible inputs are:\n\n* True: Return the intersection of the timeperiods of the input time series.\n* False: Return the union of the timeperiods of the input time series. Extraplolate points outside of the data range.',
                  name: 'Bounded.',
                  options: null,
                  param: 'bounded',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'resample',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This method offers a robust filling of missing data points and data resampling a given sampling frequency. Multiple\ndata resampling options are available:\n\n * Fourier\n * Polynomial phase filtering\n * Linear interpolation (for up-sampling)\n * Min, max, sum, count, mean (for down-sampling)',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Resample',
              outputs: [
                {
                  description:
                    'Uniform, resampled time series with specified number of data points.',
                  name: 'Interpolated time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'fourier',
                  description:
                    'Resampling method:\n\n* "fourier" for Fourier method (default)\n* "polyphase" for polyphase filtering\n* "interpolate" for linear interpolation when upsampling\n* "min", "max", "sum", "count", "mean" when downsampling',
                  name: 'Method.',
                  options: [
                    {
                      label: 'fourier',
                      value: 'fourier',
                    },
                    {
                      label: 'polyphase',
                      value: 'polyphase',
                    },
                    {
                      label: 'interpolate',
                      value: 'interpolate',
                    },
                    {
                      label: 'min',
                      value: 'min',
                    },
                    {
                      label: 'max',
                      value: 'max',
                    },
                    {
                      label: 'sum',
                      value: 'sum',
                    },
                    {
                      label: 'count',
                      value: 'count',
                    },
                    {
                      label: 'mean',
                      value: 'mean',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Temporal resolution of uniform time series, before resampling. Defaults to None.\nIf not specified, the frequency will be implied, which only works if no data is missing.\nFollows Pandas DateTime convention.',
                  name: 'Current temporal resolution.',
                  options: null,
                  param: 'granularity_current',
                  type: 'str',
                },
                {
                  default_value: '1s',
                  description:
                    'Temporal resolution of uniform time series, after resampling. Defaults to "1s".\nEither "Number of Samples" or "Final temporal resolution" must be provided.',
                  name: 'Final temporal resolution.',
                  options: null,
                  param: 'granularity_next',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'The number of samples in the resampled signal. If this is set, the time deltas will be inferred. Defaults\nto None. Either "Number of Samples" or "Final temporal resolution" must be provided.',
                  name: 'Number of Samples.',
                  options: null,
                  param: 'num',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'The down-sampling factor is required for the polyphase filtering. Defaults to None.',
                  name: 'Down-sampling factor.',
                  options: null,
                  param: 'downsampling_factor',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'Gaps smaller than threshold will be interpolated, larger than this will be filled by noise.\nDefaults to None.',
                  name: 'Interpolation threshold.',
                  options: null,
                  param: 'interpolate_resolution',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Gaps smaller than this threshold will be forward filled. Defaults to None.',
                  name: 'Forward fill threshold.',
                  options: null,
                  param: 'ffill_resolution',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Resample',
          op: 'resample_to_granularity',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Resample time series to a given fixed granularity (time delta) and aggregation type\n([read more about aggregation ](https://docs.cognite.com/dev/concepts/aggregation/))',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Resample to granularity',
              outputs: [
                {
                  description: null,
                  name: 'Resampled time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Granularity defines the time range that each aggregate is calculated from. It consists of a time unit and a\nsize. Valid time units are day or d, hour h, minute or m and second or s. For example, 2h means that each\ntime range should be 2 hours wide, 3m means 3 minutes, and so on.',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'mean',
                  description:
                    'Type of aggregation to use when resampling. Possible options are:\n\n* mean\n* max\n* min\n* count\n* sum',
                  name: 'Aggregate.',
                  options: [
                    {
                      label: 'MEAN',
                      value: 'mean',
                    },
                    {
                      label: 'INTERPOLATION',
                      value: 'interpolation',
                    },
                    {
                      label: 'STEP_INTERPOLATION',
                      value: 'stepInterpolation',
                    },
                    {
                      label: 'MAX',
                      value: 'max',
                    },
                    {
                      label: 'MIN',
                      value: 'min',
                    },
                    {
                      label: 'COUNT',
                      value: 'count',
                    },
                    {
                      label: 'SUM',
                      value: 'sum',
                    },
                  ],
                  param: 'aggregate',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      'Signal generator': [
        {
          category: 'Signal generator',
          op: 'insert_data_gaps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                "Method to synthetically remove data, i.e. generate data gaps in a time series. The amount of data points removed\nis defined by the given 'fraction' relative to the original time series.",
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Insert data gaps',
              outputs: [
                {
                  description:
                    'Original time series with synthetically generated data gap(s).',
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.25,
                  description:
                    'Fraction of data points to remove relative to the original time series. Must be a number higher than 0 and\nlower than 1 (0 < keep < 1). Defaults to 0.25.',
                  name: 'Remove fraction',
                  options: null,
                  param: 'fraction',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'Number of gaps to generate. Only needs to be provided when using the "Multiple" gaps method.',
                  name: 'Number of gaps',
                  options: null,
                  param: 'num_gaps',
                  type: 'int',
                },
                {
                  default_value: 5,
                  description:
                    'Minimum of data points to keep between data gaps and at the start and end of the time series. If the buffer\nof data points is higher than 1% of the number of data points in the time series, the end and start buffer\nis set to 1% of the total available data points.',
                  name: 'Buffer',
                  options: null,
                  param: 'data_buffer',
                  type: 'int',
                },
                {
                  default_value: 'Random',
                  description:
                    "This function offers multiple methods to generate data gaps:\n\n* Random: Removes data points at random locations so that the output time series size is a given\n  fraction  ('Remove fraction') of the original time series. The first and last data points are never\n  deleted. No buffer is set between gaps, only for the start and end of the time series.\n  If the buffer of data points is higher than 1% of the number of data points in the time\n  series, the end and start buffer is set to 1% of the total available data points.\n* Single: Remove consecutive data points at a single location. Buffer data points at the start\n  and end of the time series is kept to prevent removing the start and end of the time series. The\n  buffer is set to the maximum value between 5 data points or 1% of the data points in the signal.\n* Multiple: Insert multiple non-overlapping data gaps at random dates and of random\n  sizes such that the given fraction of data is removed. If the number of gaps is not defined or is\n  less than 2, the function defaults to 2 gaps. To avoid gap overlapping, a minimum of 5 data points\n  is imposed at the start and end of the signal and between gaps.",
                  name: 'Method',
                  options: [
                    {
                      label: 'Random',
                      value: 'Random',
                    },
                    {
                      label: 'Single',
                      value: 'Single',
                    },
                    {
                      label: 'Multiple',
                      value: 'Multiple',
                    },
                  ],
                  param: 'method',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'line',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Generate a synthetic time series using the line equation. If no end and/or start dates are given, the default\nsignal duration is set to 1 day. If no dates are provided, the end date is set to the current date and time.',
              inputs: [],
              name: 'Line',
              outputs: [
                {
                  description: 'Synthetic time series for a line',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'The start date of the time series entered as a string, for example: "1975-05-09 20:09:10", or\n"1975-05-09".',
                  name: 'Start date.',
                  options: null,
                  param: 'start_date',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'The end date of the time series entered as a string, for example: "1975-05-09 20:09:10", or\n"1975-05-09".',
                  name: 'End date.',
                  options: null,
                  param: 'end_date',
                  type: 'str',
                },
                {
                  default_value: '0 days 00:01:00',
                  description:
                    "Sampling frequency as a time delta, value and time unit. Defaults to '1 minute'. Valid time units are:\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'Frequency',
                  options: null,
                  param: 'sample_freq',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: 'Line slope. Defaults to 0 (horizontal line).',
                  name: 'Slope',
                  options: null,
                  param: 'slope',
                  type: 'float',
                },
                {
                  default_value: 0,
                  description: 'Y-intercept. Defaults to 0.',
                  name: 'Intercept',
                  options: null,
                  param: 'intercept',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'perturb_timestamp',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Perturb the date-time index (timestamp) of the original time series using a normal (Gaussian) distribution\nwith a mean of zero and a given standard deviation (magnitude) in seconds.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Perturb timestamp',
              outputs: [
                {
                  description: 'Original signal with a non-uniform time stamp.',
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description:
                    'Time delta perturbation magnitude in seconds. If none is given, it is set to the inferred average sampling\nrate in seconds of the original signal.',
                  name: 'Magnitude',
                  options: null,
                  param: 'magnitude',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'sine_wave',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Generate a time series for a [sine wave ](https://en.wikipedia.org/wiki/Sine_wave) with a given wave period,\namplitude, phase and mean value. If no end and/or start dates are given, the default signal duration is set to\n1 day. If no dates are provided, the end date is set to the current date and time.',
              inputs: [],
              name: 'Sine wave',
              outputs: [
                {
                  description: null,
                  name: 'Sine wave',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Date-time string when the time series starts. The date must be a string, for example:\n"1975-05-09 20:09:10".',
                  name: 'Start date',
                  options: null,
                  param: 'start_date',
                  type: 'str',
                },
                {
                  default_value: null,
                  description:
                    'Date-time string when the time series starts. The date must be a string, for example:\n"1975-05-09 20:09:10".',
                  name: 'End date',
                  options: null,
                  param: 'end_date',
                  type: 'str',
                },
                {
                  default_value: '0 days 00:00:01',
                  description:
                    "Sampling frequency as a time delta, value and time unit. Defaults to '1 minute'. Valid time units are:\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'Frequency',
                  options: null,
                  param: 'sample_freq',
                  type: 'str',
                },
                {
                  default_value: '0 days 01:00:00',
                  description:
                    'The time it takes for two successive crests (one wavelength) to pass a specified point. For example, defining\na wave period of :math:`10 min` will generate one full wave every 10 minutes. The period can not be 0. If\nno value is provided, it 1 minute. Valid time units are:\n    * ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n    * ‘days’ or ‘day’\n    * ‘hours’, ‘hour’, ‘hr’, or ‘h’\n    * ‘minutes’, ‘minute’, ‘min’, or ‘m’\n    * ‘seconds’, ‘second’, or ‘sec’\n    * ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n    * ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n    * ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.',
                  name: 'Wave period',
                  options: null,
                  param: 'wave_period',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: "The wave's mean value. Defaults to 0.",
                  name: 'Mean',
                  options: null,
                  param: 'wave_mean',
                  type: 'float',
                },
                {
                  default_value: 1,
                  description:
                    'Maximum absolute deviation from the mean. Defaults to 1.',
                  name: 'Peak amplitude',
                  options: null,
                  param: 'wave_amplitude',
                  type: 'float',
                },
                {
                  default_value: 0,
                  description:
                    'Specifies (in radians) where in its cycle the oscillation is at time = 0. When the phase is non-zero, the\nwave is shifted in time. A negative value represents a delay, and a positive value represents an advance.\nDefualts to 0.',
                  name: 'Phase',
                  options: null,
                  param: 'wave_phase',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'univariate_polynomial',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Creates a univariate polynomial $y$, of degree $n$, from the time series $x$, and a list of\ncoefficients $a_{n}$:\n\n$$\ny = a_0 + a_1x + a_2x^2 + a_3x^3 + ... + a_nx^n\n$$\n',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'signal',
                  types: ['ts'],
                },
              ],
              name: 'Univariate polynomial',
              outputs: [
                {
                  description: null,
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: [0, 1],
                  description:
                    'List of coefficient separated by commas. The numbers must be entered deparated by comas (e.g. 0, 1).\nThe default is :math:`0.0, 1.0`, which returns the original time series.',
                  name: 'Coefficients',
                  options: null,
                  param: 'coefficients',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Signal generator',
          op: 'white_noise',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Adds white noise to the original data using a given signal-to-noise ratio (SNR).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Add white noise',
              outputs: [
                {
                  description: 'Original data plus white noise.',
                  name: 'Output',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 30,
                  description:
                    'Signal-to-noise ratio (SNR) in decibels. SNR is a comparison of the level of a signal to the level of\nbackground noise. SNR is defined as the ratio of signal power to the noise power. A ratio higher than 1\nindicates more signal than noise. Defaults to 30.',
                  name: 'SNR',
                  options: null,
                  param: 'snr_db',
                  type: 'float',
                },
                {
                  default_value: null,
                  description:
                    'A seed (integer number) to initialize the random number generator. If left empty, then a fresh,\nunpredictable values will be generated. If a value is entered the exact random noise will be generated if\nthe time series data and date range is not changed.',
                  name: 'Seed',
                  options: null,
                  param: 'seed',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Smooth: [
        {
          category: 'Smooth',
          op: 'alma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Moving average typically used in the financial industry which aims to strike a good balance between smoothness\nand responsivness (i.e. capture a general smoothed trend without allowing for significant lag). It can be\ninterpreted as a Gaussian weighted moving average with an offset, where the offset, spread and window size are\nuser defined.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Arnaud Legoux moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 10,
                  description:
                    'Defaults to 10 data points or time steps for uniformly sample time series.',
                  name: 'Window size.',
                  options: null,
                  param: 'window',
                  type: 'int',
                },
                {
                  default_value: 6,
                  description:
                    'Parameter that controls the width of the Gaussian filter. Defaults to 6.',
                  name: 'Sigma.',
                  options: null,
                  param: 'sigma',
                  type: 'float',
                },
                {
                  default_value: 0.75,
                  description:
                    'Parameter that controls the magnitude of the weights for each past observation within the window.\nDefaults to 0.75.',
                  name: 'Offset factor.',
                  options: null,
                  param: 'offset_factor',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'arma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The autoregressive moving average (ARMA) is a popular model used in forecasting. It uses an autoregression (AR)\nanalysis characterize the effect of past values on current values and a moving average to quantify the effect of the\nprevious day error (variation).',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Autoregressive moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed data.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 2,
                  description:
                    'Number of past dat points to include in the AR model. Defaults to 2.',
                  name: 'AR order.',
                  options: null,
                  param: 'ar_order',
                  type: 'int',
                },
                {
                  default_value: 2,
                  description:
                    'Number of terms in the MA model.  Defaults to 2.',
                  name: 'MA order.',
                  options: null,
                  param: 'ma_order',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'butterworth',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'This is signal processing filter designed to have a frequency response as flat as possible in the passband and\nroll-offs towards zero in the stopband. In other words, this filter is designed not to modify much the signal at the\nin the passband and attenuate as much as possible the signal at the stopband. At the moment onlylow and high pass\nfiltering is supported.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Butterworth',
              outputs: [
                {
                  description: null,
                  name: 'Filtered signal.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 50,
                  description: 'Defaults to 50.',
                  name: 'Order.',
                  options: null,
                  param: 'N',
                  type: 'int',
                },
                {
                  default_value: 0.1,
                  description:
                    'Number between 0 and 1, with 1 representing one-half of the sampling rate (Nyquist frequency).\nDefaults to 0.1.',
                  name: 'Critical frequency.',
                  options: null,
                  param: 'Wn',
                  type: 'float',
                },
                {
                  default_value: 'sos',
                  description: 'Defaults to "sos".',
                  name: 'Filtering method',
                  options: null,
                  param: 'output',
                  type: 'str',
                },
                {
                  default_value: 'lowpass',
                  description:
                    'The options are: "lowpass" and "highpass"\nDefaults to "lowpass".',
                  name: 'Filter type',
                  options: null,
                  param: 'btype',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'chebyshev',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Chebyshev filters are analog or digital filters having a steeper roll-off than Butterworth filters, and have\npassband ripple (type I) or stopband ripple (type II). Chebyshev filters have the property that they minimize the\nerror between the idealized and the actual filter characteristic over the range of the filter but with ripples in\nthe passband (Wikipedia).',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Chebyshev (I, II)',
              outputs: [
                {
                  description: null,
                  name: 'Filtered signal',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: 1,
                  description: 'Options are 1 or 2. Defaults to 1.',
                  name: 'Filter type',
                  options: null,
                  param: 'filter_type',
                  type: 'int',
                },
                {
                  default_value: 10,
                  description: 'Defaults to 10.',
                  name: 'Order',
                  options: null,
                  param: 'N',
                  type: 'int',
                },
                {
                  default_value: 0.1,
                  description:
                    'Maximum ripple allowed below unity gain in the passband.\nDefaults to 0.1.',
                  name: 'Maximum ripple.',
                  options: null,
                  param: 'rp',
                  type: 'float',
                },
                {
                  default_value: 0.1,
                  description:
                    'Number between 0 and 1, with 1 representing one-half of the sampling rate (Nyquist frequency).\nDefaults to 0.1.',
                  name: 'Critical frequency.',
                  options: null,
                  param: 'Wn',
                  type: 'float',
                },
                {
                  default_value: 'lowpass',
                  description:
                    'The options are: "lowpass" and "highpass"\nDefaults to "lowpass".',
                  name: 'Filter type',
                  options: null,
                  param: 'btype',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'ewma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The exponential moving average gives more weight to the more recent observations. The weights fall exponentially\nas the data point gets older. It reacts more than the simple moving average with regards to recent movements.\nThe moving average value is calculated following the definition yt=(1−α)yt−1+αxt if adjust = False or\nyt=(xt+(1−α)*xt−1+(1−α)^2*xt−2+...+(1−α)^t*x0) / (1+(1−α)+(1−α)^2+...+(1−α)^t) if adjust = True.',
              inputs: [
                {
                  description: 'Data with a pd.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Exp. weighted moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Defines how important the current observation is in the calculation of the EWMA. The longer the period, the slowly it adjusts to reflect current trends. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nThe time window is converted to the number of points for each of the windows. Each time window may have different number of points if the timeseries is not regular.\nThe number of points specify the decay of the exponential weights in terms of span α=2/(span+1), for span≥1.",
                  name: 'Time window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of data points inside a time window required to have a value (otherwise result is NA). Defaults to 1.\nIf min_periods > 1 and adjust is False, the SMA is computed for the first observation.',
                  name: 'Minimum number of data points.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
                {
                  default_value: true,
                  description:
                    'If true, the exponential function is calculated using weights w_i=(1−α)^i.\nIf false, the exponential function is calculated recursively using yt=(1−α)yt−1+αxt. Defaults to True.',
                  name: 'Adjust.',
                  options: null,
                  param: 'adjust',
                  type: 'bool',
                },
                {
                  default_value: 200,
                  description:
                    'Sets the maximum number of points to consider in a window if adjust = True. A high number of points will require more time to execute. Defaults to 200.',
                  name: 'Maximum number of data points.',
                  options: null,
                  param: 'max_pt',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'If true, resamples the calculated exponential moving average series. Defaults to False.',
                  name: 'Resample.',
                  options: null,
                  param: 'resample',
                  type: 'bool',
                },
                {
                  default_value: '60min',
                  description:
                    "Time window used to resample the calculated exponential moving average series. Defaults to '60min'.",
                  name: 'Resampling window',
                  options: null,
                  param: 'resample_window',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'lwma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'The linear weighted moving average gives more weight to the more recent observations and gradually less to the older\nones.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Linear weighted moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the rolling mean. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.",
                  name: 'Time window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of observations in the time window required to estimate a value (otherwise result is NA). Defaults to 1.',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
                {
                  default_value: false,
                  description:
                    'Resamples the calculated linear weighted moving average series. Defaults to False',
                  name: 'Resample.',
                  options: null,
                  param: 'resample',
                  type: 'bool',
                },
                {
                  default_value: '60min',
                  description:
                    "Time window used to resample the calculated linear weighted moving average series. Defaults to '60min'.",
                  name: 'Resampling window.',
                  options: null,
                  param: 'resample_window',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'sg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Use this filter for smoothing data, without distorting the data tendency. The method is independent of\nthe sampling frequency, hence simple and robust to apply on data with non-uniform sampling. If working with\nhigh-frequency data (e.g. sampling frequency ~> 1 Hz) we recommend the user to provide the filter window length and\npolynomial order parameters to suit the requirements. Otherwise, if no parameters are provided, the function will\nestimate and set the parameters based on the characteristics of the input time series (e.g. sampling frequency).',
              inputs: [
                {
                  description:
                    'Time series to be smoothed. The series must have a pandas.DatetimeIndex.',
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Saviztky-Golay',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'Length of the filter window (i.e. number of data points). A large window results in a stronger\nsmoothing effect and vice-versa. If the filter window_length is not defined by the user, a\nlength of about 1/5 of the length of time series is set.',
                  name: 'Window.',
                  options: null,
                  param: 'window_length',
                  type: 'int',
                },
                {
                  default_value: 1,
                  description:
                    'The order of the polynomial used to fit the samples. Must be less than filter window length.\nHint: A small polyorder (e.g. polyorder = 1) results in a stronger data smoothing effect.\nDefaults to 1 if not specified. This typically results in a\nsmoothed time series representing the dominating data trend and attenuates the data fluctuations.',
                  name: 'Polynomial order.',
                  options: null,
                  param: 'polyorder',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Smooth',
          op: 'sma',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Plain simple average that computes the sum of the values of the observations in a time_window divided by the number of observations in the time_window.\nSMA time series are much less noisy than the original time series. However, SMA time series lag the original time series, which means that changes in the trend are only seen with a delay (lag) of time_window/2.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Simple moving average',
              outputs: [
                {
                  description: null,
                  name: 'Smoothed time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the average. Defaults to '60min'.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.",
                  name: 'Window',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: 1,
                  description:
                    'Minimum number of observations in window required to have a value (otherwise result is NA). Defaults  to 1.',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_periods',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Statistics: [
        {
          category: 'Statistics',
          op: 'remove_outliers',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Identifies outliers combining two methods, dbscan and csap.\n\n- **dbscan**: Density-based clustering algorithm used to identify clusters of varying shape and size within a data\n set. Does not require a pre-determined set number of clusters. Able to identify outliers as noise, instead of\n classifying them into a cluster. Flexible when it comes to the size and shape of clusters, which makes it more\n useful for noise, real life data.\n\n- **csaps regression**: Cubic smoothing spline algorithm. Residuals from the regression are computed. Data points with\n high residuals (3 Standard Deviations from the Mean) are considered as outliers.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'data',
                  types: ['ts'],
                },
              ],
              name: 'Outlier removal',
              outputs: [
                {
                  description: null,
                  name: 'Time series without outliers.',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0.9,
                  description:
                    'The smoothing parameter that determines the weighted sum of terms in the regression and it is limited by\nthe range [0,1]. Defaults to 0.9. Ref: https://csaps.readthedocs.io/en/latest/formulation.html#definition',
                  name: 'Smoothing factor.',
                  options: null,
                  param: 'reg_smooth',
                  type: 'float',
                },
                {
                  default_value: 4,
                  description:
                    'Minimum number of data points required to form a distinct cluster. Defaults to 4.\nDefines the minimum number of data points required to form a distinct cluster. Rules of thumb for selecting\nthe minimum samples value:\n\n* The larger the data set, the larger the value of MinPts should be.\n* If the data set is noisier, choose a larger value of MinPts Generally, MinPts should be greater than or\n  equal to the dimensionality of the data set. For 2-dimensional data, use DBSCAN’s default value of 4\n  (Ester et al., 1996).\n* If your data has more than 2 dimensions, choose MinPts = 2*dim, where dim= the dimensions of your data\n  set (Sander et al., 1998).',
                  name: 'Minimum samples.',
                  options: null,
                  param: 'min_samples',
                  type: 'int',
                },
                {
                  default_value: null,
                  description:
                    'Defaults to None.  Defines the maximum distance between two samples for one to be considered as in the\nneighborhood of the other (i.e. belonging to the same cluster). The value of this parameter is automatically\nset after using a Nearest Neighbors algorithm to calculate the average distance between each point and its k\nnearest neighbors, where k = min_samples (minimum samples). In ascending order on a k-distance graph, the\noptimal value for the threshold is at the point of maximum curvature (i.e. after plotting the average\nk-distances in where the graph has the greatest slope). This is not a maximum bound on the distances of\npoints within a cluster. This is the most important DBSCAN parameter to choose appropriately for your data\nset and distance function. If no value is given, it is set automatically using nearest neighbors algorithm.\nDefaults to None.',
                  name: 'Distance threshold.',
                  options: null,
                  param: 'eps',
                  type: 'float',
                },
                {
                  default_value: '60min',
                  description:
                    "Length of the time period to compute the rolling mean. The rolling mean and the data point value are the two features considered when calculating the distance to the furthest neighbour.\nThis distance allows us to find the right epsilon when training dbscan. Defaults to '60min'.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nIf a number without unit (such as '60')is given, it will be considered as the number of minutes.",
                  name: 'Window.',
                  options: null,
                  param: 'time_window',
                  type: 'str',
                },
                {
                  default_value: false,
                  description:
                    'Removes data points containing a value of 0. Defaults to False.',
                  name: 'Remove zeros.',
                  options: null,
                  param: 'del_zero_val',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
      ],
      Operators: [
        {
          category: 'Operators',
          op: 'absolute',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Absolute value of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Absolute value',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'add',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Add any two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Add',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arccos',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric arccosine of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arccos',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arccosh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arccosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arccosh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arcsin',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric arcsine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arcsin',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arcsinh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arcsine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arcsinh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctan',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculate inverse hyperbolic tangent of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctan',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctan2',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Element-wise arc tangent of x1/x2 choosing the quadrant correctly.',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctan(x1, x2)',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arctanh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the hyperbolic arctangent of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arctanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'arithmetic_mean',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Mean of two time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'Time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Arithmetic mean',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'bin_map',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Maps to a binary array by checking if one timeseries is greater than another',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise greater-than',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'ceil',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Rounds a time series up to the nearest integer greater than or equal to the current value',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round up',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'clip',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Given an interval, values of the time series outside the interval are clipped to the interval edges.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Clip(low, high)',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: -99999999999999,
                  description: 'Lower clipping limit. Default: -infinity',
                  name: 'Lower limit',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: 99999999999999,
                  description: 'Upper clipping limit. Default: +infinity',
                  name: 'Upper limit',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'cos',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric cosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Cos',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'cosh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic cosine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Cosh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'deg2rad',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Converts angles from degrees to radians',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Degrees to radians',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'differentiate',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Differentiation (finite difference) using a second-order accurate numerical method (central difference).\nBoundary points are computed using a first-order accurate method.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Differentiation',
              outputs: [
                {
                  description: null,
                  name: 'First order derivative.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Current granularity for the chart on-screen (auto-given).',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'auto',
                  description:
                    "User defined granularity to potentially override unit of time.\nAccepts integer followed by time unit string (s|m|h|d). For example: '1s', '5m', '3h' or '1d'.",
                  name: 'Frequency.',
                  options: null,
                  param: 'time_unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'div',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Divide two time series or numbers. If the time series in the denominator contains zeros,\nall instances are dropped from the final result.',
              inputs: [
                {
                  description: null,
                  name: 'Numerator',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Denominator',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Division',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'exp',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the exponential of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Exp',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'floor',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Rounds a time series down to the nearest integer smaller than or equal to the current value',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round down',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'get_timestamps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Get timestamps of the time series as values.\nThe timestamps follow the Unix convention (Number of seconds\nstarting from January 1st, 1970). Precision loss in the order of\nnanoseconds may happen if unit is not nanoseconds.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Get index of time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Timestamp unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'inv',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Element-wise inverse of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Inverse',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the natural logarithm of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Ln',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log10',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base 10 of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log base 10',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'log2',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base 2 of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log base 2',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'logn',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the logarithm with base “n” of a time series',
              inputs: [
                {
                  description: null,
                  name: 'Input time-series or number',
                  param: 'x',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Base time-series or number',
                  param: 'base',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Log, any base',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'maximum',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Computes the maximum value of two timeseries or numbers',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise maximum',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'minimum',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Computes the minimum value of two timeseries',
              inputs: [
                {
                  description: null,
                  name: 'First time series or number',
                  param: 'x1',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Second time series or number',
                  param: 'x2',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Element-wise minimum',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'mod',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Modulo of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'dividend time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'divisor time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Modulo',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'mul',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Multiply two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Multiplication',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'neg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Negation of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Negation',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'power',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Power of time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'base time series or number',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'exponent time series or number',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Power',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'rad2deg',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Converts angles from radiants to degrees.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Radians to degrees',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'remove',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Remove values in a time series. The values to remove should be a semicolon-separated list.\nUndefined and infinity values can be replaced by using nan, inf and -inf (e.g. 1.0, 5, inf, -inf, 20, nan).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Remove',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'List of values to remove. The values must be seperated by semicolons. Infinity and undefined values can be\nreplaced by using the keywords inf, -inf and nan.',
                  name: 'Remove',
                  options: null,
                  param: 'to_remove',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'replace',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Replace values in a time series. The values to replace should be a semicolon-separated list.\nUndefined and infinity values can be replaced by using nan, inf and -inf (e.g. 1.0, 5, inf, -inf, 20, nan).',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Replace',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description:
                    'List of values to replace. The values must be seperated by semicolons. Infinity and undefined values can be\nreplaced by using the keywords inf, -inf and nan. The default is to replace no values.',
                  name: 'Replace',
                  options: null,
                  param: 'to_replace',
                  type: 'str',
                },
                {
                  default_value: 0,
                  description: 'Value used as replacement. Default is 0.0',
                  name: 'By',
                  options: null,
                  param: 'value',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'round',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Rounds a time series to a given number of decimals',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Round',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'number of decimals',
                  options: null,
                  param: 'decimals',
                  type: 'int',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'set_timestamps',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Sets the time series values to the Unix timestamps.\nThe timestamps follow the Unix convention (Number of seconds\nstarting from January 1st, 1970). Both input time series\nmust have the same length.',
              inputs: [
                {
                  description: null,
                  name: 'Timestamp time series',
                  param: 'timestamp_series',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'Value time series',
                  param: 'value_series',
                  types: ['ts'],
                },
              ],
              name: 'Set index of time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Timestamp unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sign',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Element-wise indication of the sign of a time series',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sign',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sin',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric sine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sin',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sinh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic sine of a time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Sinh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sliding_window_integration',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Siding window integration using trapezoidal rule.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Sliding window integration',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: '0 days 00:05:00',
                  description:
                    "the length of time the window. Defaults to '5 minute'. Valid time units are:\n\n* ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n* ‘days’ or ‘day’\n* ‘hours’, ‘hour’, ‘hr’, or ‘h’\n* ‘minutes’, ‘minute’, ‘min’, or ‘m’\n* ‘seconds’, ‘second’, or ‘sec’\n* ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n* ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n* ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'window_length',
                  options: null,
                  param: 'window_length',
                  type: 'str',
                },
                {
                  default_value: '0 days 01:00:00',
                  description:
                    "if the integrands rate is per sec, per hour, per day.\nDefaults to '1 hour'. Valid time units are:\n\n    * ‘W’, ‘D’, ‘T’, ‘S’, ‘L’, ‘U’, or ‘N’\n    * ‘days’ or ‘day’\n    * ‘hours’, ‘hour’, ‘hr’, or ‘h’\n    * ‘minutes’, ‘minute’, ‘min’, or ‘m’\n    * ‘seconds’, ‘second’, or ‘sec’\n    * ‘milliseconds’, ‘millisecond’, ‘millis’, or ‘milli’\n    * ‘microseconds’, ‘microsecond’, ‘micros’, or ‘micro’\n    * ‘nanoseconds’, ‘nanosecond’, ‘nanos’, ‘nano’, or ‘ns’.",
                  name: 'integrand_rate.',
                  options: null,
                  param: 'integrand_rate',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sqrt',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Square root of time series or numbers',
              inputs: [
                {
                  description: null,
                  name: 'time series or numbers',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Square root',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'sub',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'The difference between two time series or numbers.',
              inputs: [
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'a',
                  types: ['ts', 'const'],
                },
                {
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Subtraction',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: false,
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  type: 'bool',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'tan',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Calculates the trigonometric tangent of a timeseries.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Tan',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'tanh',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Calculates the hyperbolic tangent of time series.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Tanh',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'threshold',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Indicates if the input series exceeds the lower and higher limits. The output series\nis 1.0 if the input is between the (inclusive) limits, and 0.0 otherwise.',
              inputs: [
                {
                  description: null,
                  name: 'Time series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Threshold',
              outputs: [
                {
                  description: null,
                  name: 'Time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: -99999999999999,
                  description: 'threshold. Default: -infinity',
                  name: 'Lower limit',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: 99999999999999,
                  description: 'threshold. Default: +infinity',
                  name: 'Upper limit',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'time_shift',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description: 'Shift time series by a time period',
              inputs: [
                {
                  description: null,
                  name: 'Time-series',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Shift time series',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [
                {
                  default_value: 0,
                  description: 'Number of time periods to shift',
                  name: 'Time periods to shift',
                  options: null,
                  param: 'n_units',
                  type: 'float',
                },
                {
                  default_value: 'ms',
                  description:
                    'Valid values "ns|us|ms|s|m|h|D|W". Default "ms"',
                  name: 'Time period unit',
                  options: [
                    {
                      label: 'ns',
                      value: 'ns',
                    },
                    {
                      label: 'us',
                      value: 'us',
                    },
                    {
                      label: 'ms',
                      value: 'ms',
                    },
                    {
                      label: 's',
                      value: 's',
                    },
                    {
                      label: 'm',
                      value: 'm',
                    },
                    {
                      label: 'h',
                      value: 'h',
                    },
                    {
                      label: 'D',
                      value: 'D',
                    },
                    {
                      label: 'W',
                      value: 'W',
                    },
                  ],
                  param: 'unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'trapezoidal_integration',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Cumulative integration using trapezoidal rule with an optional user-defined time unit.',
              inputs: [
                {
                  description: null,
                  name: 'Time series.',
                  param: 'series',
                  types: ['ts'],
                },
              ],
              name: 'Integration',
              outputs: [
                {
                  description: null,
                  name: 'Cumulative integral.',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: '1h',
                  description:
                    'Current granularity for the chart on-screen (auto-given).',
                  name: 'Granularity.',
                  options: null,
                  param: 'granularity',
                  type: 'str',
                },
                {
                  default_value: 'auto',
                  description:
                    "User defined granularity to potentially override unit of time.\nAccepts integer followed by time unit string (s|m|h|d). For example: '1s', '5m', '3h' or '1d'.",
                  name: 'Frequency.',
                  options: null,
                  param: 'time_unit',
                  type: 'str',
                },
              ],
              version: '1.0',
            },
          ],
        },
        {
          category: 'Operators',
          op: 'union',
          versions: [
            {
              changelog: null,
              deprecated: false,
              description:
                'Takes the union of two time series. If a time stamp\noccurs in both series, the value of the first time series is used.',
              inputs: [
                {
                  description: null,
                  name: 'time series',
                  param: 'series1',
                  types: ['ts'],
                },
                {
                  description: null,
                  name: 'time series',
                  param: 'series2',
                  types: ['ts'],
                },
              ],
              name: 'Union',
              outputs: [
                {
                  description: null,
                  name: 'time series',
                  types: ['ts'],
                },
              ],
              parameters: [],
              version: '1.0',
            },
          ],
        },
      ],
    });
  });
});
