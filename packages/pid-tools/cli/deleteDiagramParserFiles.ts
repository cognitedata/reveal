import uniqBy from 'lodash/uniqBy';

import { DIAGRAM_PARSER_SOURCE } from '../src';
import getClient from '../src/utils/getClient';

const deleteDiagramParserFiles = async (argv: any) => {
  const { unit } = argv as unknown as { unit: string };

  const client = await getClient();
  const allFiles1 = await client.files
    .list({
      filter: {
        metadata: {
          [DIAGRAM_PARSER_SOURCE]: 'true',
        },
      },
    })
    .autoPagingToArray({ limit: Infinity });

  const allFiles2 = await client.files
    .list({
      filter: {
        source: DIAGRAM_PARSER_SOURCE,
      },
    })
    .autoPagingToArray({ limit: Infinity });

  const relevantFiles = uniqBy(
    [...allFiles2, ...allFiles1].filter((file) => file.name.includes(unit)),
    (f) => f.id
  );

  const relevantFileIds = relevantFiles.map((file) => ({ id: file.id }));

  console.log(`Deleting ${relevantFileIds.length} files for unit ${unit}`);

  await client.files.delete(relevantFileIds);
};

export default deleteDiagramParserFiles;
