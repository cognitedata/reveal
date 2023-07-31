import uniqBy from 'lodash/uniqBy';

import {
  DIAGRAM_PARSER_SITE_KEY,
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_UNIT_KEY,
} from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';

import { SiteAndUnit } from './createSiteUnitEvents';

const deleteDiagramParserFiles = async (argv: any) => {
  const { site, unit } = argv as SiteAndUnit;
  const client = await getMsalClient(argv as MsalClientOptions);

  const allFiles1 = await client.files
    .list({
      filter: {
        metadata: {
          [DIAGRAM_PARSER_SOURCE]: 'true',
          [DIAGRAM_PARSER_SITE_KEY]: site,
          [DIAGRAM_PARSER_UNIT_KEY]: unit,
        },
      },
    })
    .autoPagingToArray({ limit: Infinity });

  const allFiles2 = await client.files
    .list({
      filter: {
        source: DIAGRAM_PARSER_SOURCE,
        metadata: {
          [DIAGRAM_PARSER_SITE_KEY]: site,
          [DIAGRAM_PARSER_UNIT_KEY]: unit,
        },
      },
    })
    .autoPagingToArray({ limit: Infinity });

  const relevantFiles = uniqBy([...allFiles2, ...allFiles1], (f) => f.id);

  const relevantFileIds = relevantFiles.map((file) => ({ id: file.id }));

  // eslint-disable-next-line no-console
  console.log(`Deleting ${relevantFileIds.length} files for unit ${unit}`);

  await client.files.delete(relevantFileIds);
};

export default deleteDiagramParserFiles;
