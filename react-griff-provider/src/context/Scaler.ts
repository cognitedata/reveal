import React from 'react';
import { AxisDomainsByItemId, Collection, Series } from '../types';
import { OnDomainsUpdated } from '../Scaler';

export type Scaler = {
  series: Series[];
  collections: Collection[];
  updateDomains: (
    changedDomainsById: AxisDomainsByItemId,
    callback: OnDomainsUpdated
  ) => void;
  domainsByItemId: Record<string, unknown>;
  subDomainsByItemId: Record<string, unknown>;
};

const ScalerContext = React.createContext<Scaler>({
  series: [],
  collections: [],
  domainsByItemId: {},
  subDomainsByItemId: {},
  updateDomains: () => null,
});

export default ScalerContext;
