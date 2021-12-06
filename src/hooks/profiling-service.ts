import { zip } from 'lodash';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery, UseQueryOptions } from 'react-query';

import { useActiveTableContext } from 'contexts';
import { ALL_FILTER } from 'hooks/table-filters';
import { baseKey } from 'hooks/sdk-queries';

export const rawProfileKey = (db: string, table: string, limit?: number) => [
  baseKey,
  db,
  table,
  'raw-profile',
  { limit: limit || 'all' },
];

export type StringProfile = {
  count: number;
  distinctCount: number;
  lengthHistogram: [number[], number[]];
  lengthRange: [number, number];
  valueCounts: [string[], number[]];
};
export type NumberProfile = {
  count: number;
  distinctCount: number;
  histogram: [number[], number[]];
  valueCounts: Record<string, number>;
  valueRange: [number, number];
  mean: number;
  median: number;
  std: number;
};
export type BooleanProfile = {
  count: number;
  trueCount: number;
};
export type ObjectProfile = {
  keyCountRange: [number, number];
  keyCountHistogram: [number[], number[]];
};
export type VectorProfile = {
  lengthRange: [number, number];
  lengthHistogram: [number[], number[]];
};

export type ColumnProfile = {
  type: 'String' | 'Number' | 'Boolean' | 'Object' | 'Vector';
  label: string;
  count: number;
  distinctCount?: number;
  nullCount: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  histogram?: Count[];
  counts?: Count[];
  profile:
    | StringProfile
    | NumberProfile
    | BooleanProfile
    | ObjectProfile
    | VectorProfile
    | null;
};

export type Profile = {
  rowCount: number;
  columns: ColumnProfile[];
};

export type Count = {
  value: string;
  count: number;
};

type C = 'string' | 'number' | 'boolean' | 'object' | 'vector';
type RawColumn = {
  count: number;
  nullCount: number;
  string: null | StringProfile;
  number: null | NumberProfile;
  boolean: null | BooleanProfile;
  object: null | ObjectProfile;
  vector: null | VectorProfile;
};
export type RawProfile = {
  rowCount: number;
  columns: Record<string, RawColumn>;
};

function transformStringProfile(
  label: string,
  column: RawColumn
): ColumnProfile {
  const profile = column.string;
  const {
    distinctCount,
    lengthRange = [],
    lengthHistogram = [[], []],
    valueCounts = [[], []],
  } = (profile || {}) as StringProfile;
  const counts = zip(...valueCounts)
    .map(([value, count]) => ({
      value: value as string,
      count: count as number,
    }))
    .sort((a, b) => {
      if (a.value === '<other>') {
        return 1;
      } else if (b.value === '<other>') {
        return -1;
      } else {
        return b.count - a.count;
      }
    });
  const histogram = zip(...lengthHistogram).map(([length, count]) => ({
    value: length?.toString() as string,
    count: count as number,
  }));
  return {
    type: 'String',
    label,
    count: column.count,
    min: lengthRange[0],
    max: lengthRange[1],
    histogram,
    nullCount: column.nullCount,
    distinctCount,
    counts,
    profile,
  };
}

function transformNumberProfile(
  label: string,
  column: RawColumn
): ColumnProfile {
  const profile = column.number;
  const {
    distinctCount,
    mean,
    median,
    std,
    valueCounts = {},
    valueRange = [],
    histogram = [[], []],
  } = (profile || {}) as NumberProfile;

  const counts = Object.keys(valueCounts)
    .map((key) => ({
      value: key as string,
      count: valueCounts[key] as number,
    }))
    .sort((a, b) => b.count - a.count);

  const formattedHistogram = zip(...histogram).map(([length, count]) => ({
    value: length?.toString() as string,
    count: count as number,
  }));

  return {
    type: 'Number',
    label,
    count: column.count,
    min: valueRange[0],
    max: valueRange[1],
    mean: mean ? Number(mean.toFixed(1)) : undefined,
    median: median ? Number(median.toFixed(1)) : undefined,
    std: std ? Number(std.toFixed(1)) : undefined,
    histogram: formattedHistogram,
    nullCount: column.nullCount,
    distinctCount,
    counts,
    profile,
  };
}

function transformBooleanProfile(
  label: string,
  column: RawColumn
): ColumnProfile {
  const profile = column.boolean;
  const { trueCount } = (profile || {}) as BooleanProfile;
  const { count, nullCount } = column;
  const falseCount = count - trueCount - nullCount;

  const counts = [
    { value: 'True', count: trueCount },
    { value: 'False', count: falseCount },
  ];
  return {
    type: 'Boolean',
    label,
    count: column.count,
    counts,
    nullCount: column.nullCount,
    profile: column.boolean,
  };
}

function transformObjectProfile(
  label: string,
  column: RawColumn
): ColumnProfile {
  return {
    type: 'Object',
    label,
    count: column.count,
    nullCount: column.nullCount,
    profile: column.object,
  };
}

function transformVectorProfile(
  label: string,
  column: RawColumn
): ColumnProfile {
  return {
    type: 'Vector',
    label,
    count: column.count,
    nullCount: column.nullCount,
    profile: column.vector,
  };
}

function transformProfile(p: RawProfile): Profile {
  const datatypes: C[] = ['string', 'number', 'boolean', 'object', 'vector'];

  const columns: ColumnProfile[] = Object.entries(p.columns).map(
    ([label, column]) => {
      const biggestDataTypeColumn = datatypes
        .map((type) => {
          return {
            type,
            count: !!column[type]
              ? // TODO: change to column count, distincCount is not present in all
                ((column[type] || {}) as any).distinctCount || 0
              : -1,
          };
        })
        .sort((a, b) => b.count - a.count)[0].type;
      switch (biggestDataTypeColumn) {
        case 'string': {
          return transformStringProfile(label, column);
        }
        case 'number': {
          return transformNumberProfile(label, column);
        }
        case 'boolean': {
          return transformBooleanProfile(label, column);
        }
        case 'vector': {
          return transformVectorProfile(label, column);
        }
        case 'object': {
          return transformObjectProfile(label, column);
        }
        default: {
          throw new Error('Unknown profile');
        }
      }
    }
  );

  return {
    rowCount: p.rowCount,
    columns,
  };
}

type RawProfileRequest = {
  database: string;
  table: string;
};
export function useQuickProfile(
  { database, table }: RawProfileRequest,
  options?: Omit<UseQueryOptions<Profile>, 'retry'>
) {
  return useRawProfile({ database, table, limit: 1000 }, options);
}
export const FULL_PROFILE_LIMIT = 1000000;
export function useFullProfile(
  { database, table }: RawProfileRequest,
  options?: Omit<UseQueryOptions<Profile>, 'retry'>
) {
  return useRawProfile({ database, table, limit: FULL_PROFILE_LIMIT }, options);
}

function useRawProfile(
  {
    database,
    table,
    limit,
  }: {
    database: string;
    table: string;
    limit: number;
  },
  options?: Omit<UseQueryOptions<Profile>, 'retry'>
) {
  const sdk = useSDK();
  return useQuery<Profile>(
    rawProfileKey(database, table, limit),
    () =>
      sdk
        .post<RawProfile>(`/api/v1/projects/${sdk.project}/profiler/raw`, {
          data: {
            database,
            table,
            limit,
          },
        })
        .then((response) => transformProfile(response.data)),
    {
      ...options,
      retry: false,
    }
  );
}

type ColumnTypeCount = Partial<
  Record<ColumnProfile['type'] | typeof ALL_FILTER, number>
>;

export const useColumnType = () => {
  const { database, table } = useActiveTableContext();
  const { data = { columns: [] } } = useRawProfile({
    database,
    table,
    limit: 1000,
  });

  const getColumn = (dataKey: string | undefined) => {
    const column = dataKey
      ? data.columns.find((c) => c.label === dataKey)
      : null;
    return column;
  };

  const getColumnType = (dataKey: string | undefined) => {
    const column = getColumn(dataKey);

    return column?.type || 'Unknown';
  };

  const getColumnTypeCounts = (): ColumnTypeCount => {
    if (!data.columns.length) return {};
    const columnsTypes: ColumnProfile['type'][] = data.columns
      .filter(Boolean)
      .map((column) => column.type);
    const columnsTypeCounts = columnsTypes.reduce(
      (typeCounts: ColumnTypeCount, currType: ColumnProfile['type']) => {
        if (!currType) return typeCounts;
        if (typeCounts[currType])
          typeCounts[currType] = typeCounts[currType]! + 1;
        else typeCounts[currType] = 1;
        return typeCounts;
      },
      { [ALL_FILTER]: data.columns.length } as ColumnTypeCount
    );
    return columnsTypeCounts;
  };

  return { getColumn, getColumnType, getColumnTypeCounts };
};
