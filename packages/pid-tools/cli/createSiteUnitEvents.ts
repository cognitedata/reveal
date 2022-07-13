import { LINEWALK_DATA_VERSION } from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';

import createEventForSiteIfDoesntExist from './utils/createEventForSiteIfDoesntExist';
import createEventForUnitIfDoesntExist from './utils/createEventForUnitIfDoesntExist';

const createSiteUnitEvents = async (argv: any) => {
  const { site, unit } = argv as {
    site: string;
    unit: string;
  };
  const client = await getMsalClient(argv as MsalClientOptions);

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
  console.log(`${site} and ${unit} exist.`);
};

export default createSiteUnitEvents;
