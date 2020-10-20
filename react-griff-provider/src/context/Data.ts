import { createContext } from 'react';
import { Collection, Domain, Domains, Series } from '../types';

export type Data = {
  series: Series[];
  collections: Collection[];
  timeDomain: Domain;
  externalTimeDomain: Domain;
  timeSubDomain: Domain;
  externalTimeSubDomain: Domain;
  yAxisWidth?: number;
  limitTimeSubDomain?: (domain: Domain) => Domain;
  onUpdateDomains?: (domain: Domains) => void;
  timeSubDomainChanged: (domain: Domain) => void;
  registerCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  registerSeries: (series: Series) => void;
  updateSeries: (series: Series) => void;
};

const DataContext = createContext<Data>({
  series: [],
  collections: [],
  timeDomain: [Date.now() - 1000 * 60 * 60 * 24 * 365, 0],
  timeSubDomain: [0, 0],
  externalTimeDomain: [Date.now() - 1000 * 60 * 60 * 24 * 365, 0],
  externalTimeSubDomain: [0, 0],
  registerSeries: () => null,
  updateSeries: () => null,
  registerCollection: () => null,
  updateCollection: () => null,
  timeSubDomainChanged: () => null,
});

export default DataContext;
