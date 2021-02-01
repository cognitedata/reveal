export const well = {
  id: 2,
  externalId: 'ex_id',
  parentId: 3,
  name: 'well_name',
  description: 'well_description',
  metadata: {
    active_indicator: 'N',
    basin_name: '',
    country_name: 'United States of America',
    create_time: '',
    create_user: '',
    crs_epsg_orig: '',
    crs_epsg_transform_orig: '',
    current_crs_name: 'WGS84',
    current_operator: '',
    on_off_shore: '',
    operatorDiv: 'BUS0000000007',
    spud_date: '',
    state_name: '',
    type: 'Well',
    water_depth: '',
    water_depth_unit: '',
    well_legal_name: '608114071200',
    well_remark: '',
    x_coordinate: '-90.309669',
    y_coordinate: '27.154096'
  },
  source: 'source',
  lastUpdatedTime: '2020-07-07T14:58:43.268Z',
  createdTime: '2020-04-23T01:16:51.134Z',
  rootId: 5,
  parentExternalId: 'Well',
  dataSetId: 111
};

export const wellbore = {
  id: 33,
  externalId: 'wellbore_external_id',
  parentId: 2,
  name: 'wellbore_name',
  description: 'wellbore description',
  metadata: {
    bh_x_coordinate: '-90.0140000000000',
    bh_y_coordinate: '27.2240000000000',
    elevation_type: 'KB',
    elevation_value: '82.00000',
    elevation_value_unit: 'ft',
  },
  source: 'source',
  lastUpdatedTime: '2020-05-12T16:54:21.192Z',
  createdTime: '2020-05-01T19:47:08.876Z',
  rootId: 11,
  parentExternalId: 'ex_id',
  dataSetId: 111
};

export const mappedWellbore = {
  id: 44,
  externalId: 'wellbore_external_id',
  parentId: 2,
  name: 'wellbore_name',
  description: 'wellbore description',
  metadata: {
    bh_x_coordinate: '-90.0140000000000',
    bh_y_coordinate: '27.2240000000000',
    e_type: 'KB',
    e_value: '82.00000',
    e_value_unit: 'ft',
  },
  source: 'source',
  lastUpdatedTime: '2020-05-12T16:54:21.192Z',
  createdTime: '2020-05-01T19:47:08.876Z',
  rootId: 11,
  parentExternalId: 'ex_id',
  dataSetId: 111
}
export const trajectory = {
  id: 123,
  name: 'Wellpath',
  description: '',
  assetId: 44,
  externalId: 'trajectory_external_id',
  metadata: {
    acscan_md_min: '0.0',
    tortuosity_type: '3.0',
    b_interp: '',
    final_error: '',
    bh_tvd: '0.0',
    source: 'trajectory_source',
    final_north: '0.0',
    planned_azimuth: '1.36729343094278',
    type: 'Trajectory',
    b_range: 'Y',
    acscan_md_max: '0.0',
    vs_north: '0.0',
    ko_tvd: '',
    effective_date: '2019-01-29T00:00:00',
    tortuosity_period: '100.0',
    interpolation_interval: '',
    object_state: 'ACTUAL',
    create_date: '2019-01-29T16:06:08',
    create_app_id: 'COMPASS',
    final_east: '0.0',
    create_user_id: 'some_user_id',
    bh_md: '0.0',
    interpolate: '',
    is_definitive: '',
    version: '',
    update_date: '2019-01-29T16:06:08',
    is_readonly: 'Y',
    definitive_path: '',
    tortuosity: '0.0',
    name: 'Wellpath',
    ko_north: '',
    average_dogleg: '0.0',
    ko_md: '6519.013038',
    acscan_ratio_max: '0.0',
    is_survey_program_read_only: '',
    maximum_dls_value: '0.0',
    update_user_id: 'updated_some_user_id',
    b_ratio: '',
    update_app_id: 'COMPASS',
    directional_difficulty_index: '0.0',
    maximum_dls_depth: '0.0',
    definitive_version: '',
    use_actual_data: '',
    acscan_radius_max: '0.0',
    ko_east: '',
    vs_east: '0.0',
    remarks: '',
    use_planned_program: 'N'
  },
  columns: [
    {
      name: 'sequence_no',
      externalId: 'sequence_no',
      valueType: 'LONG',
      metadata: {},
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'azimuth',
      externalId: 'azimuth',
      valueType: 'DOUBLE',
      metadata: {
        unit: '°'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'inclination',
      externalId: 'inclination',
      valueType: 'DOUBLE',
      metadata: {
        unit: '°'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'md',
      externalId: 'md',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'tvd',
      externalId: 'tvd',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'x_offset',
      externalId: 'x_offset',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'y_offset',
      externalId: 'y_offset',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'definitive_survey_id',
      externalId: 'definitive_survey_id',
      valueType: 'STRING',
      metadata: {},
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_yy',
      externalId: 'covariance_yy',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'ellipse_vertical',
      externalId: 'ellipse_vertical',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_yz',
      externalId: 'covariance_yz',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_zz',
      externalId: 'covariance_zz',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_xx',
      externalId: 'covariance_xx',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'data_entry_mode',
      externalId: 'data_entry_mode',
      valueType: 'LONG',
      metadata: {},
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_xy',
      externalId: 'covariance_xy',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'dogleg_severity',
      externalId: 'dogleg_severity',
      valueType: 'DOUBLE',
      metadata: {
        unit: '°/100ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'dogleg_severity_max',
      externalId: 'dogleg_severity_max',
      valueType: 'DOUBLE',
      metadata: {
        unit: '°/100ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'covariance_xz',
      externalId: 'covariance_xz',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft²'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'ellipse_east',
      externalId: 'ellipse_east',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'ellipse_north',
      externalId: 'ellipse_north',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'casing_radius',
      externalId: 'casing_radius',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'in'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'global_lateral_error',
      externalId: 'global_lateral_error',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    },
    {
      name: 'vertical_sect',
      externalId: 'vertical_sect',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'ft'
      },
      createdTime: '2020-06-19T17:10:06.732Z',
      lastUpdatedTime: '2020-06-19T17:10:06.732Z'
    }
  ],
  createdTime: '2020-06-19T17:10:06.732Z',
  lastUpdatedTime: '2020-06-19T17:10:06.732Z',
  dataSetId: 111
};

export const trajectoryData = {
  id: 123,
  externalId: 'trajectory_external_id',
  columns: [
    {
      externalId: 'md',
      valueType: 'DOUBLE',
      name: 'md'
    },
    {
      externalId: 'azimuth',
      valueType: 'DOUBLE',
      name: 'azimuth'
    },
    {
      externalId: 'inclination',
      valueType: 'DOUBLE',
      name: 'inclination'
    },
    {
      externalId: 'tvd',
      valueType: 'DOUBLE',
      name: 'tvd'
    },
    {
      externalId: 'x_offset',
      valueType: 'DOUBLE',
      name: 'x_offset'
    },
    {
      externalId: 'y_offset',
      valueType: 'DOUBLE',
      name: 'y_offset'
    }
  ],
  rows: [
    {
      values: [
        6519.013038,
        1.36729343094278,
        0,
        6519.013038,
        0,
        0
      ],
      rowNumber: 0
    },
    {
      values: [
        6772.5635451,
        316.917293430943,
        1.17,
        6772.54592409652,
        -1.76822390452704,
        1.89070879555479
      ],
      rowNumber: 1
    },
    {
      values: [
        6786.68357334,
        309.107293430943,
        1.1,
        6786.66318964342,
        -1.9718615877911,
        2.08148889956385
      ],
      rowNumber: 2
    },
    {
      values: [
        6940.33388064,
        309.677293430943,
        0.12,
        6940.30291623872,
        -3.24016212697282,
        3.11453977432942
      ],
      rowNumber: 3
    },
    {
      values: [
        7076.50415298,
        90.0572934309428,
        0.16,
        7076.47301429133,
        -3.1597829722048,
        3.20539274610241
      ],
      rowNumber: 4
    },
    {
      values: [
        7210.39442076,
        30.9272934309428,
        0.09,
        7210.36300276999,
        -2.91879161276675,
        3.29541175671755
      ],
      rowNumber: 5
    },
    {
      values: [
        7345.12469022,
        89.2272934309428,
        0.1,
        7345.09311607343,
        -2.74684341613982,
        3.38776920779488
      ],
      rowNumber: 6
    },
    {
      values: [
        7480.07496012,
        126.067293430943,
        0.15,
        7480.04308105549,
        -2.48629757426603,
        3.28535774146932
      ],
      rowNumber: 7
    },
    {
      values: [
        7616.72523342,
        155.727293430943,
        0.01,
        7616.69318852105,
        -2.33680637978183,
        3.16917714051658
      ],
      rowNumber: 8
    },
    {
      values: [
        7749.82549962,
        83.6872934309428,
        0.14,
        7749.79331868231,
        -2.17040502192363,
        3.17646876079473
      ],
      rowNumber: 9
    },
    {
      values: [
        7888.37577672,
        118.167293430943,
        0.12,
        7888.34325920844,
        -1.8742534948055,
        3.12659178739641
      ],
      rowNumber: 10
    },
    {
      values: [
        8021.20604238,
        105.817293430943,
        0.09,
        8021.1733019875,
        -1.6512527466422,
        3.03249440635998
      ],
      rowNumber: 11
    },
    {
      values: [
        8156.22631242,
        55.0172934309428,
        0.06,
        8156.19346842937,
        -1.49130003097554,
        3.04412208192909
      ],
      rowNumber: 12
    },
    {
      values: [
        8290.2665805,
        138.207293430943,
        0.15,
        8290.23355163208,
        -1.31686510760276,
        2.95354547558845
      ],
      rowNumber: 13
    },
    {
      values: [
        8425.23685044,
        271.697293430943,
        0.04,
        8425.2036847257,
        -1.24621471741466,
        2.82321851424761
      ],
      rowNumber: 14
    },
    {
      values: [
        8562.45712488,
        250.357293430943,
        0.26,
        8562.42340959131,
        -1.58731703136136,
        2.71997839816354
      ],
      rowNumber: 15
    },
    {
      values: [
        8695.40739078,
        149.727293430943,
        0.06,
        8695.37321432764,
        -1.83632415230588,
        2.55845621985924
      ],
      rowNumber: 16
    },
    {
      values: [
        8829.2176584,
        127.257293430943,
        0.12,
        8829.18331446523,
        -1.68947477076655,
        2.41311596156938
      ],
      rowNumber: 17
    },
    {
      values: [
        8963.92792782,
        74.5972934309428,
        0.05,
        8963.89344341348,
        -1.52052777845085,
        2.34332559157546
      ],
      rowNumber: 18
    },
    {
      values: [
        9100.40820078,
        108.257293430943,
        0.15,
        9100.37349989245,
        -1.2934572754327,
        2.30317340092824
      ],
      rowNumber: 19
    },
    {
      values: [
        9239.2184784,
        84.7472934309428,
        0.14,
        9239.18334511052,
        -0.95202583032974,
        2.26177454176292
      ],
      rowNumber: 20
    },
    {
      values: [
        9369.78873954,
        82.0772934309428,
        0.13,
        9369.75324377558,
        -0.646460965186164,
        2.29679593366456
      ],
      rowNumber: 21
    },
    {
      values: [
        9504.6190092,
        131.367293430943,
        0.06,
        9504.58333828282,
        -0.441978773234875,
        2.271223115775
      ],
      rowNumber: 22
    },
    {
      values: [
        9639.14927826,
        98.7672934309428,
        0.16,
        9639.11335266734,
        -0.203469738214365,
        2.1960397309187
      ],
      rowNumber: 23
    },
    {
      values: [
        9774.72954942,
        302.337293430943,
        0.57,
        9774.6917866093,
        -0.586183201273377,
        2.52792302638916
      ],
      rowNumber: 24
    },
    {
      values: [
        9910.09982016,
        304.877293430943,
        1.85,
        9910.02906426246,
        -2.94779209164453,
        4.13763753653383
      ],
      rowNumber: 25
    },
    {
      values: [
        10044.93008982,
        306.007293430943,
        3.23,
        10044.723618827,
        -7.80619977226305,
        7.61536293803538
      ],
      rowNumber: 26
    },
    {
      values: [
        10179.7203594,
        307.857293430943,
        4.65,
        10179.1919304925,
        -15.1921725224923,
        13.2010751197506
      ],
      rowNumber: 27
    },
    {
      values: [
        10315.19063034,
        311.957293430943,
        6.46,
        10314.0209152219,
        -25.1957708991374,
        21.6668665789752
      ],
      rowNumber: 28
    },
    {
      values: [
        10450.33090062,
        315.577293430943,
        8.4,
        10448.0208236773,
        -37.7594949784401,
        33.8005163559663
      ],
      rowNumber: 29
    },
    {
      values: [
        10585.80117156,
        318.087293430943,
        10.6,
        10581.6255678548,
        -53.0106018440831,
        50.1417779024835
      ],
      rowNumber: 30
    },
    {
      values: [
        10637.10127416,
        318.737293430943,
        11.44,
        10631.9792919209,
        -59.5178277399424,
        57.4773653631635
      ],
      rowNumber: 31
    }
  ]
};