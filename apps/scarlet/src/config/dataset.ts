import { DataSetId } from 'types';

const DATA_SET_IDS: DataSetId[] = [
  {
    P66_ScarletScannerConfiguration: 5232416567932234,
    P66_U1Forms: 1537546103063503,
    P66_ScarletEquipmentState: 2966227008009845,
    project: 'accenture-p66-aimi-dev',
  },
  {
    P66_ScarletScannerConfiguration: 2012193327740557,
    P66_U1Forms: 3172752328247745,
    P66_ScarletEquipmentState: 4822446150055143,
    project: 'accenture-p66-aimi',
  },
];

export const datasetByProject = (project: string) => {
  const dataset = DATA_SET_IDS.find((dataSet) => dataSet.project === project);
  if (!dataset) throw Error(`No dataset for project: ${project}`);
  return dataset;
};
