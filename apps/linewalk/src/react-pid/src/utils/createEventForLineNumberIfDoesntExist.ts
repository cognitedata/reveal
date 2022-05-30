import { CogniteClient } from '@cognite/sdk';
import {
  DIAGRAM_PARSER_SITE_KEY,
  DIAGRAM_PARSER_UNIT_KEY,
  getLineReviewEventExternalId,
  LINE_REVIEW_EVENT_TYPE,
  LINEWALK_VERSION_KEY,
} from '@cognite/pid-tools';

const createEventForLineNumberIfDoesntExist = async (
  client: CogniteClient,
  {
    version,
    lineNumber,
    site,
    unit,
  }: { version: string; lineNumber: string; site: string; unit: string }
) => {
  // Delete existing
  try {
    const events = await client.events.retrieve([
      {
        externalId: getLineReviewEventExternalId(
          version,
          site,
          unit,
          lineNumber
        ),
      },
    ]);

    if (
      events.length === 1 &&
      events?.[0]?.metadata?.lineNumber === lineNumber &&
      events?.[0]?.metadata?.unit === unit
    ) {
      return;
    }
  } catch (error) {
    // Silent
  }

  try {
    // eslint-disable-next-line no-await-in-loop
    await client.events.delete([
      {
        externalId: getLineReviewEventExternalId(
          version,
          site,
          unit,
          lineNumber
        ),
      },
    ]);
  } catch (error) {
    // Silent
  }

  // Create new
  await client.events.create([
    {
      externalId: getLineReviewEventExternalId(version, site, unit, lineNumber),
      type: LINE_REVIEW_EVENT_TYPE,
      metadata: {
        [LINEWALK_VERSION_KEY]: version,
        lineNumber,
        [DIAGRAM_PARSER_SITE_KEY]: site,
        [DIAGRAM_PARSER_UNIT_KEY]: unit,
        assignee: 'Garima',
        status: 'OPEN',
        system: 'unknown',
        comment: '',
        state: JSON.stringify({
          discrepancies: [],
          textAnnotations: [],
        }),
      },
    },
  ]);
};

export default createEventForLineNumberIfDoesntExist;
