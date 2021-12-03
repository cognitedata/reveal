import { Operation } from '@cognite/calculation-backend';

export const fullListOfOperations: Operation[] = [
  {
    category: 'Data quality',
    description:
      'Outlier detector and removal based on the `paper from Gustavo A. Zarruk\n<https://iopscience.iop.org/article/10.1088/0957-0233/16/10/012/meta>`_. The procedure is as follows:\n\n     * Fit a polynomial curve to the model using all of the data\n     * Calculate the studentized deleted (or externally studentized) residuals\n     * These residuals follow a t distribution with degrees of freedom n - p - 1\n     * Bonferroni critical value can be computed using the significance level (alpha) and t distribution\n     * Any values that fall outside of the critical value are treated as anomalies\n\nUse of the hat matrix diagonal allows for the rapid calculation of deleted residuals without having to refit\nthe predictor function each time.',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Extreme outliers removal',
    op: 'extreme',
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
        default_value: 1.0,
        description:
          'Relaxation factor for the Bonferroni critical value. Smaller values will make anomaly detection more\nconservative. Defaults to 1',
        name: 'Factor.',
        options: null,
        param: 'bc_relaxation',
        type: 'float',
      },
      {
        default_value: 3,
        description: 'Order of the polynomial used for the regression function',
        name: 'Polynomial order.',
        options: null,
        param: 'poly_order',
        type: 'int',
      },
    ],
  },
  {
    category: 'Detect',
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
    op: 'drift',
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
  },
  {
    category: 'Detect',
    description:
      'Steady state detector based on the ration of two variances estimated from the same signal [#]_ . The algorithm first\nfilters the data using the factor "Alpha 1" and calculates two variances (long and short term) based on the\nparameters "Alpa 2" and "Alpha 3". The first variance is an exponentially weighted moving variance based on the\ndifference between the data and the average. The second is also an exponentially weighted moving \u201cvariance\u201d but\nbased on sequential data differences. Larger Alpha values imply that fewer data are involved in the analysis,\nwhich has a benefit of reducing the time for the identifier to detect a process change (average run length, ARL)\nbut has a undesired impact of increasing the variability on the results, broadening the distribution and\nconfounding interpretation. Lower \u03bb values undesirably increase the average run length to detection, but increase\nprecision (minimizing Type-I and Type-II statistical errors) by reducing the variability of the distributions\nincreasing the signal-to-noise ratio of a TS to SS situation.',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Steady state (variance)',
    op: 'ssid',
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
  },
  {
    category: 'Detect',
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
    op: 'vma',
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
  },
  {
    category: 'Detect',
    description:
      'Detect steady state periods in a time series based on a change point detection algorithm.  The time series is split\ninto "statistically homogeneous" segments using the ED Pelt change point detection algorithm. Then each segment is tested with regards\nto a normalized standard deviation and the slope of the line of best fit to determine if the segment can be\nconsidered a steady or transient region.',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Steady State Detection (CPD)',
    op: 'ssd_cpd',
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
        default_value: 2.0,
        description:
          'Specifies the variance threshold. If the normalized variance calculated for a given segment is greater than\nthe threshold, the segment will be labeled as transient (value = 0).',
        name: 'Variance threshold.',
        options: null,
        param: 'var_threshold',
        type: 'float',
      },
      {
        default_value: -3.0,
        description:
          'Specifies the slope threshold. If the slope of a line fitted to the data of a given segment is greater than\n10 to the power of the threshold value, the segment will be labeled as transient (value = 0).',
        name: 'Slope threshold.',
        options: null,
        param: 'slope_threshold',
        type: 'float',
      },
    ],
  },
  {
    category: 'Filter',
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
    op: 'status_flag_filter',
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
  },
  {
    category: 'Filter',
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
    op: 'wavelet_filter',
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
  },
  {
    category: 'Fluid Dynamics',
    description:
      'The Haaland equation was proposed in 1983 by Professor S.E. Haaland of the Norwegian Institute of Technology.[9]\nIt is used to solve directly for the Darcy\u2013Weisbach friction factor f for a full-flowing circular pipe. It is an\napproximation of the implicit Colebrook\u2013White equation, but the discrepancy from experimental data is well within\nthe accuracy of the data.',
    inputs: [
      {
        description: null,
        name: 'Reynolds Number.',
        param: 'Re',
        types: ['ts'],
      },
    ],
    name: 'Haaland equation',
    op: 'Haaland',
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
        name: 'Surface roughness.',
        options: null,
        param: 'roughness',
        type: 'float',
      },
    ],
  },
  {
    category: 'Fluid Dynamics',
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
    op: 'Re',
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
  },
  {
    category: 'Forecast',
    description:
      'The ARMA predictor works by fitting constants to a auto regression (AR)  and to a moving average (MA) equation and\nextrapolating the results.',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Autoregressive moving average predictor',
    op: 'arma_predictor',
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
        description: 'Fraction of the input data used for training the model',
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
  },
  {
    category: 'Oil and gas',
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
    op: 'productivity_index',
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
  },
  {
    category: 'Oil and gas',
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
    op: 'calculate_shutin_interval',
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
  },
  {
    category: 'Regression',
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
    op: 'poly_regression',
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
        default_value: null,
        description:
          'Type of regularisation to apply (Lasso or Ridge). Default is simple linear least squares with no regularisation.',
        name: 'Method.',
        options: null,
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
  },
  {
    category: 'Resample',
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
    op: 'interpolate',
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
          "Specifies the interpolation method. Defaults to \"linear\". Possible inputs are :\n\n* 'linear': linear interpolation.\n* 'ffill': forward filling.\n* 'stepwise': yields same result as ffill.\n* 'zero', \u2018slinear\u2019, \u2018quadratic\u2019, \u2018cubic\u2019: spline interpolation of zeroth, first, second or third order.",
        name: 'Method.',
        options: null,
        param: 'method',
        type: 'str',
      },
      {
        default_value: 'pointwise',
        description:
          "Specifies the kind of returned data points. Defaults to \"pointwise\".  Possible inputs are :\n\n* 'pointwise': returns the pointwise value of the interpolated function for each timestamp.\n* 'average': returns the average of the interpolated function within each time period.",
        name: 'Kind.',
        options: null,
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
          '- 1: Fill in for requested points outside of the data range.\n- 0: Ignore said points. Defaults to 1.\n\nDefault behaviour is to raise a ValueError if the data range is not within start and end and no outside fill\nmethod is specified (value 1).',
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
  },
  {
    category: 'Resample',
    description:
      'Resample time series to a given fixed granularity (time delta) and aggregation type\n(`read more about aggregation <https://docs.cognite.com/dev/concepts/aggregation/>`_)',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'series',
        types: ['ts'],
      },
    ],
    name: 'Resample to granularity',
    op: 'resample_to_granularity',
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
  },
  {
    category: 'Resample',
    description:
      'This method offers a robust filling of missing data points and data resampling a given sampling frequency. Multiple\ndata resampling options are available:\n\n    * Fourier\n    * Polynomial phase filtering\n    * Linear interpolation (for up-sampling)\n    * Min, max, sum, count, mean (for down-sampling)',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Resample',
    op: 'resample',
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
        options: null,
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
  },
  {
    category: 'Resample',
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
    op: 'reindex',
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
            value: 'zero order spline interpolation (forward filling)',
          },
          {
            label: 'ZERO_NEXT',
            value: 'zero order spline interpolation (backward filling)',
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
  },
  {
    category: 'Smooth',
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
    op: 'alma',
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
  },
  {
    category: 'Smooth',
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
    op: 'arma',
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
        description: 'Number of terms in the MA model.  Defaults to 2.',
        name: 'MA order.',
        options: null,
        param: 'ma_order',
        type: 'int',
      },
    ],
  },
  {
    category: 'Smooth',
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
    op: 'butterworth',
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
  },
  {
    category: 'Smooth',
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
    op: 'chebyshev',
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
  },
  {
    category: 'Smooth',
    description:
      'The exponential moving average gives more weight to the more recent observations. The weights fall exponentially\nas the data point gets older. It reacts more than the simple moving average with regards to recent movements.\nThe moving average value is calculated following the definition yt=(1\u2212\u03b1)yt\u22121+\u03b1xt if adjust = False or\nyt=(xt+(1\u2212\u03b1)*xt\u22121+(1\u2212\u03b1)^2*xt\u22122+...+(1\u2212\u03b1)^t*x0) / (1+(1\u2212\u03b1)+(1\u2212\u03b1)^2+...+(1\u2212\u03b1)^t) if adjust = True.',
    inputs: [
      {
        description: 'Data with a pd.DatetimeIndex.',
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Exponential weighted moving average',
    op: 'ewma',
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
          "Defines how important the current observation is in the calculation of the EWMA. The longer the period, the slowly it adjusts to reflect current trends. Defaults to '60min'.\nIf the user gives a number without unit (such as '60'), it will be considered as the number of minutes.\nAccepted string format: '3w', '10d', '5h', '30min', '10s'.\nThe time window is converted to the number of points for each of the windows. Each time window may have different number of points if the timeseries is not regular.\nThe number of points specify the decay of the exponential weights in terms of span \u03b1=2/(span+1), for span\u22651.",
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
          'If true, the exponential function is calculated using weights w_i=(1\u2212\u03b1)^i.\nIf false, the exponential function is calculated recursively using yt=(1\u2212\u03b1)yt\u22121+\u03b1xt. Defaults to True.',
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
  },
  {
    category: 'Smooth',
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
    op: 'lwma',
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
  },
  {
    category: 'Smooth',
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
    op: 'sg',
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
  },
  {
    category: 'Smooth',
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
    op: 'sma',
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
  },
  {
    category: 'Statistics',
    description:
      'Identifies outliers combining two methods, *dbscan* and *csap*.\n\n**dbscan**: Density-based clustering algorithm used to identify clusters of varying shape and size within a data\nset. Does not require a pre-determined set number of clusters. Able to identify outliers as noise, instead of\nclassifying them into a cluster. Flexible when it comes to the size and shape of clusters, which makes it more\nuseful for noise, real life data.\n\n**csaps regression**: Cubic smoothing spline algorithm. Residuals from the regression are computed. Data points with\nhigh residuals (3 Standard Deviations from the Mean) are considered as outliers.',
    inputs: [
      {
        description: null,
        name: 'Time series.',
        param: 'data',
        types: ['ts'],
      },
    ],
    name: 'Outlier removal',
    op: 'remove_outliers',
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
          'Minimum number of data points required to form a distinct cluster. Defaults to 4.\nDefines the minimum number of data points required to form a distinct cluster. Rules of thumb for selecting\nthe minimum samples value:\n\n* The larger the data set, the larger the value of MinPts should be.\n* If the data set is noisier, choose a larger value of MinPts Generally, MinPts should be greater than or\n  equal to the dimensionality of the data set. For 2-dimensional data, use DBSCAN\u2019s default value of 4\n  (Ester et al., 1996).\n* If your data has more than 2 dimensions, choose MinPts = 2*dim, where dim= the dimensions of your data\n  set (Sander et al., 1998).',
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
  },
  {
    category: 'Operators',
    description: 'Absolute value of time series or numbers',
    inputs: [
      {
        description: null,
        name: 'time-series or numbers',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Absolute value',
    op: 'absolute',
    outputs: [
      {
        description: null,
        name: 'Absolute value of input variables',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
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
    op: 'add',
    outputs: [
      {
        description: null,
        name: 'Sum of both input variables.',
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
  },
  {
    category: 'Operators',
    description: 'Calculates the trigonometric arccosine of a time series',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arccos',
    op: 'arccos',
    outputs: [
      {
        description: null,
        name: 'trigonometric arccosine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic arccosine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arccosh',
    op: 'arccosh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic arccosine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the trigonometric arcsine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arcsin',
    op: 'arcsin',
    outputs: [
      {
        description: null,
        name: 'trigonometric arcsine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic arcsine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arcsinh',
    op: 'arcsinh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic arcsine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculate inverse hyperbolic tangent of a time series',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arctan',
    op: 'arctan',
    outputs: [
      {
        description: null,
        name: 'inverse hyperbolic tanent of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Element-wise arc tangent of x1/x2 choosing the quadrant correctly.',
    inputs: [
      {
        description: null,
        name: 'First time-series or number',
        param: 'x1',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'Second time-series or number',
        param: 'x2',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arctan(x1, x2)',
    op: 'arctan2',
    outputs: [
      {
        description: null,
        name: 'Element-wise arc tangent of input variables',
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
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic arctangent of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Arctanh',
    op: 'arctanh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic arctangent of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Maps to a binary array by checking if one timeseries is greater than another',
    inputs: [
      {
        description: null,
        name: 'First time-series or number',
        param: 'x1',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'Second time-series or number',
        param: 'x2',
        types: ['ts', 'const'],
      },
    ],
    name: 'Element-wise greater-than',
    op: 'bin_map',
    outputs: [
      {
        description: null,
        name: 'element-wise greater than of input variables',
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
  },
  {
    category: 'Operators',
    description:
      'Rounds a time series up to the nearest integer greater than or equal to the current value',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Round up',
    op: 'ceil',
    outputs: [
      {
        description: null,
        name: 'Up-rounded version of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Given an interval, values of the timeseries outside the interval are clipped to the interval edges.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Clip(low, high)',
    op: 'clip',
    outputs: [
      {
        description: null,
        name: 'Clipped version of the input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [
      {
        default_value: null,
        description: null,
        name: 'lower limit of the clipping interval',
        options: null,
        param: 'low',
        type: 'float',
      },
      {
        default_value: null,
        description: null,
        name: 'upper limit of the clipping interval',
        options: null,
        param: 'high',
        type: 'float',
      },
    ],
  },
  {
    category: 'Operators',
    description: 'Calculates the trigonometric cosine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Cos',
    op: 'cos',
    outputs: [
      {
        description: null,
        name: 'trigonometric cosine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic cosine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Cosh',
    op: 'cosh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic cosine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
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
    op: 'differentiate',
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
  },
  {
    category: 'Operators',
    description: 'Converts angles from degrees to radians',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Degrees to radians',
    op: 'deg2rad',
    outputs: [
      {
        description: null,
        name: 'radians converted input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Divide two time series or numbers. If the time series in the denominator contains zeros, all instances are dropped\nfrom the final result.',
    inputs: [
      {
        description: null,
        name: 'Numerator time-series or number.',
        param: 'a',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'Denominator time-series or number.',
        param: 'b',
        types: ['ts', 'const'],
      },
    ],
    name: 'Division',
    op: 'div',
    outputs: [
      {
        description: null,
        name: 'Division of input variables.',
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
  },
  {
    category: 'Operators',
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
    op: 'exp',
    outputs: [
      {
        description: null,
        name: 'exponential of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Rounds a time series down to the nearest integer smaller than or equal to the current value',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Round down',
    op: 'floor',
    outputs: [
      {
        description: null,
        name: 'Down-rounded version of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
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
    op: 'trapezoidal_integration',
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
  },
  {
    category: 'Operators',
    description: 'Element-wise inverse of time series or numbers',
    inputs: [
      {
        description: null,
        name: 'time-series or numbers',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Inverse',
    op: 'inv',
    outputs: [
      {
        description: null,
        name: 'Inverse of input variables',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
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
    op: 'log',
    outputs: [
      {
        description: null,
        name: 'natural logarithm of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the logarithm with base 10 of a time series',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Log base 10',
    op: 'log10',
    outputs: [
      {
        description: null,
        name: 'logarithm with base 10 of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the logarithm with base 2 of a time series',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Log base 2',
    op: 'log2',
    outputs: [
      {
        description: null,
        name: 'logarithm with base 2 of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description:
      'Calculates the logarithm with base \u201cn\u201d of a time series',
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
    op: 'logn',
    outputs: [
      {
        description: null,
        name: 'Element-wise logarithm of input variables',
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
  },
  {
    category: 'Operators',
    description: 'Computes the maximum value of two timeseries or numbers',
    inputs: [
      {
        description: null,
        name: 'First time-series or number',
        param: 'x1',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'Second time-series or number',
        param: 'x2',
        types: ['ts', 'const'],
      },
    ],
    name: 'Element-wise maximum',
    op: 'maximum',
    outputs: [
      {
        description: null,
        name: 'Maximum of input variables',
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
  },
  {
    category: 'Operators',
    description: 'Computes the minimum value of two timeseries',
    inputs: [
      {
        description: null,
        name: 'First time-series or number',
        param: 'x1',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'Second time-series or number',
        param: 'x2',
        types: ['ts', 'const'],
      },
    ],
    name: 'Element-wise minimum',
    op: 'minimum',
    outputs: [
      {
        description: null,
        name: 'Minimum of input variables',
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
  },
  {
    category: 'Operators',
    description: 'Modulo of time series or numbers',
    inputs: [
      {
        description: null,
        name: 'dividend time-series or number',
        param: 'a',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'divisor time-series or number',
        param: 'b',
        types: ['ts', 'const'],
      },
    ],
    name: 'Modulo',
    op: 'mod',
    outputs: [
      {
        description: null,
        name: 'Modulo of input variables.',
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
  },
  {
    category: 'Operators',
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
    op: 'mul',
    outputs: [
      {
        description: null,
        name: 'pandas.Series : Multiplication of both input variables.',
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
  },
  {
    category: 'Operators',
    description: 'Negation of time series or numbers',
    inputs: [
      {
        description: null,
        name: 'time-series or numbers',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Negation',
    op: 'neg',
    outputs: [
      {
        description: null,
        name: 'Negation of input variables',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Power of time series or numbers.',
    inputs: [
      {
        description: null,
        name: 'base time-series or number',
        param: 'a',
        types: ['ts', 'const'],
      },
      {
        description: null,
        name: 'exponent time-series or number',
        param: 'b',
        types: ['ts', 'const'],
      },
    ],
    name: 'Power',
    op: 'power',
    outputs: [
      {
        description: null,
        name: 'Exponentation of input variables.',
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
  },
  {
    category: 'Operators',
    description: 'Converts angles from radiants to degrees.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Radians to degrees',
    op: 'rad2deg',
    outputs: [
      {
        description: null,
        name: 'degree converted input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Rounds a time series to a given number of decimals',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Round',
    op: 'round',
    outputs: [
      {
        description: null,
        name: 'Rounded input time series',
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
  },
  {
    category: 'Operators',
    description: 'Element-wise indication of the sign of a time series',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Sign',
    op: 'sign',
    outputs: [
      {
        description: null,
        name: 'Element-wise indication of the sign of the input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the trigonometric sine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Sin',
    op: 'sin',
    outputs: [
      {
        description: null,
        name: 'trigonometric sine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic sine of a time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Sinh',
    op: 'sinh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic sine of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Square root of time series or numbers',
    inputs: [
      {
        description: null,
        name: 'time-series or numbers',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Square root',
    op: 'sqrt',
    outputs: [
      {
        description: null,
        name: 'Square root of input variables',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
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
    op: 'sub',
    outputs: [
      {
        description: null,
        name: 'Difference between both input variables.',
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
  },
  {
    category: 'Operators',
    description: 'Calculates the trigonometric tangent of a timeseries.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Tan',
    op: 'tan',
    outputs: [
      {
        description: null,
        name: 'trigonometric tangent of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
  {
    category: 'Operators',
    description: 'Calculates the hyperbolic tangent of time series.',
    inputs: [
      {
        description: null,
        name: 'time-series',
        param: 'x',
        types: ['ts', 'const'],
      },
    ],
    name: 'Tanh',
    op: 'tanh',
    outputs: [
      {
        description: null,
        name: 'hyperbolic tangent of input time series',
        types: ['ts', 'const'],
      },
    ],
    parameters: [],
  },
] as Operation[];
