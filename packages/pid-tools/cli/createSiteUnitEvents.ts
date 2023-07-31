import { LINEWALK_DATA_VERSION } from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';

import createEventForSiteIfDoesntExist from './utils/createEventForSiteIfDoesntExist';
import createEventForUnitIfDoesntExist from './utils/createEventForUnitIfDoesntExist';

export interface SiteAndUnit {
  site: string;
  unit: string;
}

const createSiteUnitEvents = async (argv: any) => {
  const typedArgv = argv as SiteAndUnit & MsalClientOptions;

  const { site, unit } = typedArgv;
  const client = await getMsalClient(typedArgv);

  // eslint-disable-next-line no-console
  console.log(`Ensuring that events for site ${site} and unit ${unit} exist`);
  await createEventForSiteIfDoesntExist(client, {
    version: LINEWALK_DATA_VERSION,
    site,
  });

  await createEventForUnitIfDoesntExist(client, {
    version: LINEWALK_DATA_VERSION,
    site,
    unit,
  });
  // eslint-disable-next-line no-console
  console.log(`${site} and ${unit} exist.`);
};

export default createSiteUnitEvents;
