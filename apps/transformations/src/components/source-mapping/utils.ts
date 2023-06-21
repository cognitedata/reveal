import { QueryClient } from '@tanstack/react-query';
import { fetchSchema } from '@transformations/hooks';
import {
  ColumnProfile,
  getRawProfile,
} from '@transformations/hooks/profiling-service';
import {
  Destination,
  isFDMDestination,
  Schema,
  TransformationRead,
} from '@transformations/types';
import {
  getSparkColumnType,
  MAPPING_MODE_MAGIC_STRING,
  SQL_FORMATTER_OPTIONS,
  TransformationMapping,
} from '@transformations/utils';
import isPlainObject from 'lodash/isPlainObject';
import omit from 'lodash/omit';
import { format } from 'sql-formatter';

import {
  SourceColumnCandidate,
  suggestSchemaMapping,
} from '@cognite/schema-matching';
import { CogniteClient } from '@cognite/sdk';

export const isMappingMode = (query?: string): boolean => {
  const enabledString = mappingModeEnableString(true);
  return Boolean(query?.split('\n')?.[0]?.includes(enabledString));
};

const mappingModeEnableString = (enabled: boolean) =>
  `${MAPPING_MODE_MAGIC_STRING}: ${enabled}`;

export const defaultTransformationMapping: TransformationMapping =
  Object.freeze({ version: 1, enabled: true, sourceType: 'raw', mappings: [] });

export const getUpdateMapping = (
  transformation: TransformationRead,
  mapping: TransformationMapping
) => {
  return {
    update: {
      query: {
        set: getQuery(mapping, transformation.destination),
      },
    },
    id: transformation.id,
  };
};

export const getQuery = (
  mapping: TransformationMapping,
  destination: TransformationRead['destination']
) => {
  const m = omit(mapping, ['enabled']);
  return format(
    `/* ${mappingModeEnableString(mapping.enabled)} */
/* ${JSON.stringify(m)} */
${getSQLQuery(mapping, destination)}`,
    SQL_FORMATTER_OPTIONS
  );
};

// this type is not the same for all structs, but it is the only type we can get
// for fields in fdm destinations
const FDM_MAGIC_STRUCT_SQL_TYPES = [
  'STRUCT<STRING:STRING>',
  'STRUCT<space:string, externalId:string>',
  'STRUCT<`space`:STRING, `externalId`:STRING>',
];

const getSQLQuery = (
  mapping: TransformationMapping,
  destination: TransformationRead['destination']
) => {
  const selects = mapping.mappings
    .filter(({ from, to }) => !!from && !!to)
    .map(({ from, to, asType }) => {
      let f: string;
      if (
        asType &&
        FDM_MAGIC_STRUCT_SQL_TYPES.includes(asType) &&
        isFDMDestination(destination)
      ) {
        f = `node_reference('${destination.instanceSpace}', \`${from}\`)`;
      } else {
        f = !!asType ? `cast(\`${from}\` as ${asType})` : `\`${from}\``;
      }
      return `${f} as ${to}`;
    })
    .join(',\n');

  if (!selects) {
    return '';
  }

  const from =
    mapping.sourceType === 'fdm'
      ? `from  ${fdmFromStatement(mapping)}`
      : `from \`${mapping.sourceLevel1}\`.\`${mapping.sourceLevel2}\``;

  return `
select
${selects}
${from};`;
};

const fdmFromStatement = (mapping: TransformationMapping) => {
  const level1 = mapping.sourceLevel1?.split('.');
  const space = level1?.[0];
  const dataModelVersion = level1?.[2];

  return `cdf_nodes("${space}", "${mapping.sourceLevel2}", "${dataModelVersion}")`;
};

export const parseTransformationMapping = (
  s: string
): TransformationMapping => {
  const enabled = isMappingMode(s);
  const line = s.split('\n')[1];

  const data: TransformationMapping = {
    enabled,
    ...JSON.parse(line.slice(2, -2)),
  };

  const sourceTypes = ['raw', 'clean', 'fdm'];

  if (!isPlainObject(data)) {
    throw new Error('Mapping was not a valid object');
  }

  if (!sourceTypes.includes(data.sourceType)) {
    throw new Error('Mapping sourceType is not valid');
  }

  return data;
};

export const getDefaultMapping = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  transformation: Pick<TransformationRead, 'destination' | 'conflictMode'>
) => {
  const schema = await fetchSchema(
    sdk,
    queryClient,
    transformation.destination,
    transformation.conflictMode
  );
  const mappings = schema?.map(({ name, sqlType }) => ({
    from: '',
    to: name,
    asType: sqlType,
  }));

  return {
    ...defaultTransformationMapping,
    mappings,
  };
};

export const getTransformationMapping = (s: string) => {
  try {
    return parseTransformationMapping(s);
  } catch {
    return undefined;
  }
};

export type Suggestion = {
  from: string;
  to: {
    label: string;
    type?: string;
  }[];
};

export const suggestRawMappings = async (
  mapping: TransformationMapping,
  exactMapping: boolean,
  sdk: CogniteClient,
  client: QueryClient
) => {
  const suggestions: Suggestion[] = [];
  if (mapping.sourceLevel1 && mapping.sourceLevel2) {
    const profile = await getRawProfile({
      database: mapping.sourceLevel1,
      table: mapping.sourceLevel2,
      sdk,
      client,
    });
    const suggestedMapping = exactMapping
      ? new Map<string, SourceColumnCandidate[]>(
          mapping.mappings.map((m) => {
            const matches = profile.columns
              .filter((c) => c.label.toLowerCase() === m.to.toLowerCase())
              ?.map((c) => ({ sourceColumn: c.label, highConfidence: true }));
            return [m.to, matches];
          })
        )
      : await suggestSchemaMapping(
          profile.columns.map((c) => ({ name: c.label, type: c.type })),
          mapping.mappings.map((m) => ({
            name: m.to,
            type: m.asType ?? 'String',
          })),
          3,
          sdk,
          10000
        );

    suggestedMapping.forEach((v, k) => {
      if (v.length > 0) {
        suggestions.push({
          from: k,
          to: v
            .filter((candidate) => candidate.highConfidence)
            .map((candidate) => ({
              label: candidate.sourceColumn,
              type: profile.columns.find(
                (c) => c.label == candidate.sourceColumn
              )?.type,
            })),
        });
        suggestedMapping.delete(k);
      }
    });
  }
  return suggestions;
};

export const suggestFDMMappings = async (
  mapping: TransformationMapping,
  exactMapping: boolean,
  sdk: CogniteClient,
  client: QueryClient
) => {
  const suggestions: Suggestion[] = [];
  if (mapping.sourceLevel1 && mapping.sourceLevel2) {
    const [space, _, version] = mapping?.sourceLevel1?.split('.') || [];
    const source: Destination = {
      type: 'nodes',
      instanceSpace: space,
      view: {
        externalId: mapping?.sourceLevel2,
        version,
        space,
      },
    };
    const sourceSchema = await fetchSchema(sdk, client, source!, 'abort');

    const suggestedMappings = exactMapping
      ? new Map<string, SourceColumnCandidate[]>(
          mapping.mappings.map((m) => {
            const matches = sourceSchema
              .filter((s) => s.name.toLowerCase() === m.to.toLowerCase())
              ?.map((s) => ({ sourceColumn: s.name, highConfidence: true }));
            return [m.to, matches];
          })
        )
      : await suggestSchemaMapping(
          sourceSchema?.map((s) => ({ name: s.name, type: s.sqlType })) || [],
          mapping.mappings.map((m) => ({
            name: m.to,
            type: m.asType ?? 'String',
          })),
          1,
          sdk,
          10000
        );

    suggestedMappings.forEach((v, k) => {
      if (v.length > 0) {
        suggestions.push({
          from: k,
          to: v
            .filter((candidate) => candidate.highConfidence)
            .map((candidate) => ({ label: candidate.sourceColumn })),
        });
      }
    });
  }
  return suggestions;
};

export const suggestCleanMappings = async (
  mapping: TransformationMapping,
  exactMapping: boolean,
  sdk: CogniteClient,
  client: QueryClient
) => {
  const suggestions: Suggestion[] = [];
  if (mapping.sourceLevel1 && mapping.sourceLevel2) {
    const source = { type: mapping?.sourceLevel2 } as unknown as Destination;
    const sourceSchema = await fetchSchema(sdk, client, source!, 'abort');

    const suggestedMappings = exactMapping
      ? new Map<string, SourceColumnCandidate[]>(
          mapping.mappings.map((m) => {
            const matches = sourceSchema
              .filter((s) => s.name.toLowerCase() === m.to.toLowerCase())
              ?.map((s) => ({ sourceColumn: s.name, highConfidence: true }));
            return [m.to, matches];
          })
        )
      : await suggestSchemaMapping(
          sourceSchema?.map((s) => ({ name: s.name, type: s.sqlType })) || [],
          mapping.mappings.map((m) => ({
            name: m.to,
            type: m.asType ?? 'String',
          })),
          3,
          sdk,
          10000
        );

    suggestedMappings.forEach((v, k) => {
      if (v.length > 0) {
        suggestions.push({
          from: k,
          to: v
            .filter((candidate) => candidate.highConfidence)
            .map((candidate) => ({
              label: candidate.sourceColumn,
              type: getSparkColumnType(
                sourceSchema.find((s) => s.name === candidate.sourceColumn)
                  ?.type
              ),
            })),
        });
      }
    });
  }
  return suggestions;
};

export const sqlChanged = (transformation: TransformationRead) => {
  const mapping = getTransformationMapping(transformation.query);
  if (mapping) {
    const currentSql = format(transformation.query, SQL_FORMATTER_OPTIONS)
      .split('\n')
      .slice(2)
      .join('\n');
    const generatedSql = getQuery(mapping, transformation.destination)
      .split('\n')
      .slice(2)
      .join('\n');
    return currentSql !== generatedSql;
  }
  return false;
};

export const isSourceRawTable = (transformation: TransformationRead) => {
  const mapping = getTransformationMapping(transformation.query);
  return (
    mapping?.sourceType === 'raw' &&
    !!mapping.sourceLevel1 &&
    !!mapping.sourceLevel2
  );
};

export const getSchemaType = (schema?: Schema): string | undefined => {
  if (!schema) {
    return undefined;
  }

  if (typeof schema.type === 'string') {
    return schema.type;
  }

  if (typeof schema.type === 'object') {
    return schema.type.type;
  }
};

const COMPLEX_SCHEMA_TYPES = ['array', 'map', 'struct'] as const;
type ComplexSchemaType = (typeof COMPLEX_SCHEMA_TYPES)[number];

export const isComplexSchemaType = (
  schemaType?: string
): schemaType is ComplexSchemaType => {
  return COMPLEX_SCHEMA_TYPES.some((t) => t === schemaType);
};

const COMPATIBILITY_MATRIX_COMPLEX_SCHEMA_TYPE_TO_COLUMN_TYPE: Record<
  ComplexSchemaType,
  ColumnProfile['type'][]
> = {
  array: ['Vector'],
  map: [],
  struct: [],
};

export const isSourceColumnCompatibleWithDestinationSchema = (
  sourceColumn?: ColumnProfile,
  destinationSchema?: Schema,
  isDestinationFDM: boolean = false
): boolean => {
  const destinationSchemaType = getSchemaType(destinationSchema);
  const hasComplexDestinationType = isComplexSchemaType(destinationSchemaType);

  // this is compatible due to our hacky mapping implementation atm
  if (isDestinationFDM && destinationSchemaType === 'struct') {
    return true;
  }

  if (!hasComplexDestinationType) {
    return true;
  }

  const columnType = sourceColumn?.type;

  return (
    !!destinationSchemaType &&
    !!columnType &&
    COMPATIBILITY_MATRIX_COMPLEX_SCHEMA_TYPE_TO_COLUMN_TYPE[
      destinationSchemaType
    ].includes(columnType)
  );
};

export const isSourceSchemaCompatibleWithDestinationSchema = (
  sourceSchema?: Schema,
  destinationSchema?: Schema,
  isDestinationFDM: boolean = false
): boolean => {
  const destinationSchemaType = getSchemaType(destinationSchema);
  const hasComplexDestinationType = isComplexSchemaType(destinationSchemaType);

  // this is compatible due to our hacky mapping implementation atm
  if (isDestinationFDM && destinationSchemaType === 'struct') {
    return true;
  }

  if (!hasComplexDestinationType) {
    return true;
  }

  const sourceSchemaType = getSchemaType(sourceSchema);

  return (
    !!destinationSchemaType &&
    !!sourceSchemaType &&
    destinationSchemaType === sourceSchemaType
  );
};
