import { CogniteClient } from '@cognite/sdk';

import {
  DIAGRAM_PARSER_SITE_KEY,
  DIAGRAM_PARSER_UNIT_KEY,
  getUnitEventExternalId,
  LINE_REVIEW_UNIT_EVENT_TYPE,
  LINEWALK_VERSION_KEY,
} from '../../src';

const createEventForUnitIfDoesntExist = async (
  client: CogniteClient,
  { version, site, unit }: { version: string; site: string; unit: string }
) => {
  // Delete existing
  try {
    const events = await client.events.retrieve([
      {
        externalId: getUnitEventExternalId(version, site, unit),
      },
    ]);

    if (events.length === 1 && events?.[0]?.metadata?.unit === unit) {
      return;
    }
  } catch (error) {
    // Silent
  }

  try {
    // eslint-disable-next-line no-await-in-loop
    await client.events.delete([
      {
        externalId: getUnitEventExternalId(version, site, unit),
      },
    ]);
  } catch (error) {
    // Silent
  }

  // Create new
  await client.events.create([
    {
      externalId: getUnitEventExternalId(version, site, unit),
      type: LINE_REVIEW_UNIT_EVENT_TYPE,
      metadata: {
        [LINEWALK_VERSION_KEY]: version,
        [DIAGRAM_PARSER_SITE_KEY]: site,
        [DIAGRAM_PARSER_UNIT_KEY]: unit,
      },
    },
  ]);
};

export default createEventForUnitIfDoesntExist;
