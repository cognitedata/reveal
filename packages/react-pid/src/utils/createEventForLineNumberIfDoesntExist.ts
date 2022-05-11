import { CogniteClient } from '@cognite/sdk';
import {
  getLineReviewEventExternalId,
  LINE_REVIEW_EVENT_TYPE,
  LINEWALK_VERSION_KEY,
} from '@cognite/pid-tools';

const createEventForLineNumberIfDoesntExist = async (
  client: CogniteClient,
  {
    version,
    lineNumber,
    unit,
  }: { version: string; lineNumber: string; unit: string }
) => {
  // Delete existing
  try {
    const events = await client.events.retrieve([
      {
        externalId: getLineReviewEventExternalId(version, lineNumber, unit),
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
        externalId: getLineReviewEventExternalId(version, lineNumber, unit),
      },
    ]);
  } catch (error) {
    // Silent
  }

  // Create new
  await client.events.create([
    {
      externalId: getLineReviewEventExternalId(version, lineNumber, unit),
      type: LINE_REVIEW_EVENT_TYPE,
      metadata: {
        [LINEWALK_VERSION_KEY]: version,
        lineNumber,
        unit,
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
