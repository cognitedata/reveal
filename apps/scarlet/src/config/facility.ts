import config from 'utils/config';
import { Facility } from 'types';

/**
 * id and datasetId for the facility objects can be obtained from CDF.
 * Important: ensure that obtained CDF params match with its project

 * id and datasetId can be found in following CDF view:
 * explore data -> assets -> select project -> select facility
 * You there find a summary containing "External ID" which is this context is the id,
 * and the "Data Set" from what one can obtain the datasetId
 */

export const facilityList = (project: string): Facility[] =>
  [
    {
      id: '2',
      path: 'borger',
      name: 'Borger',
      shortName: 'Borger',
      datasetId: 4809044228760729,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi-dev',
    },
    {
      id: '86104',
      path: 'sweeny',
      name: 'Sweeny',
      shortName: 'Sweeny',
      datasetId: 2688254680312305,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi-dev',
    },
    {
      id: '125095',
      path: 'u1test',
      name: 'U1Test',
      shortName: 'U1Test',
      datasetId: 1771976604628956,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi-dev',
    },
    {
      id: '11282',
      path: 'sweeny',
      name: 'Sweeny',
      shortName: 'Sweeny',
      datasetId: 2560456674711232,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi',
    },
  ].filter((item) => item.env.includes(config.env) && item.project === project);

export const defaultFacility = (project: string) => facilityList(project)[0];
