import { LINEWALK_DATA_VERSION } from '../src';
import getClient from '../src/utils/getClient';

import createEventForSiteIfDoesntExist from './utils/createEventForSiteIfDoesntExist';
import createEventForUnitIfDoesntExist from './utils/createEventForUnitIfDoesntExist';

const createSiteUnitEvents = async (argv) => {
  const { unit, site } = argv as unknown as {
    site: string;
    unit: string;
  };

  const client = await getClient();

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
