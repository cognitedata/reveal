import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import {
  keywordCompletionSource,
  schemaCompletionSource,
  SQLConfig,
  SQLDialect,
} from '@codemirror/lang-sql';
import { LanguageSupport } from '@codemirror/language';
import { QueryClient } from '@tanstack/react-query';
import {
  QUICK_PROFILE_LIMIT,
  SPARK_SQL_SCHEMA_DUMMY_COLUMN_TYPE,
} from '@transformations/common';
import {
  Profile,
  rawProfileQueryFn,
  rawProfileQueryKey,
} from '@transformations/hooks/profiling-service';
import {
  removeSurroundingBackticks,
  sparkFnCompletions,
} from '@transformations/utils';

import { CogniteClient } from '@cognite/sdk';

/**
 * This is a modified version of Spark SQL as is used in transformations.
 * There may be missing Spark features or some extra functionality.
 */
export const sparkSQLDialect = SQLDialect.define({
  keywords:
    'select insert update delete from where and or group by order limit offset having as case when else end type join on outer desc asc union create table primary key foreign not references default null inner cross natural database drop grant and boolean cube in java_method like mod not or reflect rollup string when into values',
  builtin: 'true false <= <=> == >=',
  types:
    'bigint tinyint smallint int numeric decimal date varchar char float double bit binary text set timestamp datetime money real number integer',
  backslashEscapes: true,
  slashComments: false,
  spaceAfterDashes: false,
  doubleQuotedStrings: true,
  operatorChars: '!%&*+-/<=>^|~',
  identifierQuotes: '`',
});

export type SparkSQLTableSchema = Record<string, string[]>;

const getTableProfile = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  dbName: string,
  tableName: string
): Promise<Profile | undefined> => {
  const queryKey = rawProfileQueryKey(dbName, tableName, QUICK_PROFILE_LIMIT);

  return queryClient.fetchQuery(queryKey, () =>
    rawProfileQueryFn(sdk, dbName, tableName, QUICK_PROFILE_LIMIT)
  );
};

export const getSparkSQLSupport = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  tableSchema: SparkSQLTableSchema
) => {
  const dbNames = Object.keys(tableSchema);
  const tableNames = Object.values(tableSchema).flatMap(
    (tableList) => tableList
  );

  const sqlConfig: SQLConfig = {
    schema: {
      ...Object.fromEntries(
        Object.entries(tableSchema).flatMap(([dbName, tableList]) => {
          return tableList.map((tableName) => [
            `${dbName}.${tableName}`,
            [
              {
                label: dbName,
                type: SPARK_SQL_SCHEMA_DUMMY_COLUMN_TYPE,
                detail: tableName,
              },
            ],
          ]);
        })
      ),
    },
    dialect: sparkSQLDialect,
  };

  return new LanguageSupport(sparkSQLDialect.language, [
    sparkSQLDialect.language.data.of({
      autocomplete: sparkFnCompletions,
    }),
    sparkSQLDialect.language.data.of({
      autocomplete: async (context: CompletionContext) => {
        const completionSource = schemaCompletionSource(sqlConfig);

        const unknownCompletion = completionSource(context);
        if (
          !(unknownCompletion as CompletionResult)?.options ||
          !Array.isArray((unknownCompletion as CompletionResult)?.options)
        ) {
          return unknownCompletion;
        }

        const completion = unknownCompletion as CompletionResult;

        if (
          completion.options[0]?.type === SPARK_SQL_SCHEMA_DUMMY_COLUMN_TYPE
        ) {
          const dbName = completion.options[0].label;
          const tableName = completion.options[0].detail;
          if (dbName && tableName) {
            const profile = await getTableProfile(
              sdk,
              queryClient,
              dbName,
              tableName
            );

            if (profile) {
              return {
                ...completion,
                options: profile.columns.map((column) => ({
                  label: column.label,
                  type:
                    typeof column.type === 'string'
                      ? column.type.toLowerCase()
                      : 'column',
                  detail: 'column',
                  apply: `\`${column.label}\``,
                })),
              };
            }
          }
          return null;
        }

        return {
          ...completion,
          options: completion.options.map((option) => {
            const label = removeSurroundingBackticks(option.label);

            if (dbNames.includes(label)) {
              return {
                ...option,
                apply: `\`${label}\``,
                type: 'database',
                detail: 'database',
              };
            }

            if (tableNames.includes(label)) {
              return {
                ...option,
                apply: `\`${label}\``,
                type: 'table',
                detail: 'table',
              };
            }

            return option;
          }),
        };
      },
    }),
    sparkSQLDialect.language.data.of({
      autocomplete: keywordCompletionSource(sparkSQLDialect, false),
    }),
  ]);
};
