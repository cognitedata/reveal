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
  domainsByItemId: {};
  subDomainsByItemId: {};
};

const ScalerContext = React.createContext<Scaler>({
  series: [],
  collections: [],
  domainsByItemId: {},
  subDomainsByItemId: {},
  updateDomains: () => null,
});

export default ScalerContext;
