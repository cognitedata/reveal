import { IntrospectionObjectType, IntrospectionQuery } from 'graphql';
import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { config } from '../../../config';
import { CdfMockDatabase } from '../../../types';
import { filterCollection, getType } from '../../../utils';
import { camelize } from '../../../utils/text-utils';

export interface BuildQueryResolversParams {
  version: number;
  templategroups_id: string;
  tablesList: string[];
  parsedSchema: IntrospectionQuery;
  db: CdfMockDatabase;
}
export const buildQueryResolvers = (params: BuildQueryResolversParams) => {
  const resolvers = {
    Query: {},
  };

  params.tablesList.forEach((table) => {
    resolvers.Query[`${camelize(table)}Query`] = (prm, filterParams) => {
      const store = CdfDatabaseService.from(params.db, 'templates');

      const template = store.find({
        templategroups_id: params.templategroups_id,
        version: params.version,
      });
      const data = template.db[table];

      if (!data) {
        console.warn(
          'No data found for',
          params.templategroups_id,
          params.version,
          data
        );
        return { items: [] };
      }

      const filters =
        filterParams && filterParams.filter ? filterParams.filter : {};

      let items = filterCollection(data, filters, params.parsedSchema);

      if (filterParams.limit) {
        items = (items as any[]).slice(0, filterParams.limit);
      }

      return {
        items,
        cursor: '',
      };
    };

    const tableResolver = {};

    const builtInTypes = config.builtInTypes;

    (
      params.parsedSchema['__schema'].types.find(
        (type) => type.name === table
      ) as IntrospectionObjectType
    ).fields.map((field) => {
      const mutedKind =
        field.type.kind === 'NON_NULL' ? field.type.ofType : field.type;
      const mutedType = field.type as any;
      const fieldKind = mutedKind.kind;
      const fieldSchemaType = mutedType.ofType
        ? getType(mutedType.ofType)
        : (field.type as any).name;

      if (fieldKind === 'OBJECT' && builtInTypes.includes(fieldSchemaType)) {
        tableResolver[field.name] = (ref, prms) => {
          const storeKey = fieldSchemaType.toLowerCase() + 's';
          const builtInTypeStore = CdfDatabaseService.from(params.db, storeKey);
          return builtInTypeStore.getState()[0];
        };
      }
      if (fieldKind === 'LIST' && builtInTypes.includes(fieldSchemaType)) {
        tableResolver[field.name] = (ref, prms) => {
          const storeKey = fieldSchemaType.toLowerCase() + 's';
          const builtInTypeStore = CdfDatabaseService.from(params.db, storeKey);
          return builtInTypeStore.getState();
        };
      }
      // if (
      //   field.type.kind === 'LIST' &&
      //   builtInTypes.includes(field.type.ofType))
      // ) {
      //   return `${field.name}: _ConditionalOpNumber`;
      // } else if (field.type.kind === 'SCALAR') {
      //   return `${field.name}: ${field.type.name}`;
      // }
    });

    resolvers[table] = tableResolver;
  });

  return resolvers;
};
