import { CogniteClient } from '@cognite/sdk';

import {
  LINE_REVIEW_SITE_EVENT_TYPE,
  getSiteEventExternalId,
  LINEWALK_DATA_VERSION,
  LINEWALK_VERSION_KEY,
  DIAGRAM_PARSER_SITE_KEY,
} from '../../src';

const createEventForSiteIfDoesntExist = async (
  client: CogniteClient,
  { version, site }: { version: string; site: string }
) => {
  // Delete existing
  try {
    const events = await client.events.retrieve([
      {
        externalId: getSiteEventExternalId(LINEWALK_DATA_VERSION, site),
      },
    ]);

    if (events.length === 1 && events?.[0]?.metadata?.site === site) {
      return;
    }
  } catch (error) {
    // Silent
  }

  try {
    // eslint-disable-next-line no-await-in-loop
    await client.events.delete([
      {
        externalId: getSiteEventExternalId(version, site),
      },
    ]);
  } catch (error) {
    // Silent
  }

  // Create new
  await client.events.create([
    {
      externalId: getSiteEventExternalId(version, site),
      type: LINE_REVIEW_SITE_EVENT_TYPE,
      metadata: {
        [LINEWALK_VERSION_KEY]: version,
        [DIAGRAM_PARSER_SITE_KEY]: site,
      },
    },
  ]);
};

export default createEventForSiteIfDoesntExist;
