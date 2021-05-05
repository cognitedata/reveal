import { useMutation, useQueryClient } from 'react-query';
import {
  Integration,
  IntegrationFieldName,
  IntegrationFieldValue,
} from 'model/Integration';
import { IntegrationError } from 'model/SDKErrors';
import { IntegrationUpdateSpec, saveUpdate } from 'utils/IntegrationsAPI';
import { FieldValues } from 'react-hook-form';

export type UpdateSpec = {
  id: number;
  project: string;
  fieldName: IntegrationFieldName;
  fieldValue: IntegrationFieldValue;
};

export type DetailsUpdateContext = {
  project: string;
  items: IntegrationUpdateSpec[];
  id: number;
};
export const useDetailsUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<Integration, IntegrationError, DetailsUpdateContext>(
    ({ project, items }) => {
      return saveUpdate(project, items);
    },
    {
      onMutate: (vars) => {
        queryClient.cancelQueries(['integration', vars.id, vars.project]);
        const previous: Integration | undefined = queryClient.getQueryData([
          'integration',
          vars.id,
          vars.project,
        ]);
        if (previous) {
          const fields = mapUpdateToPartialIntegration(vars);
          const update = Object.assign({}, previous, ...fields);
          queryClient.setQueryData(
            ['integration', vars.id, vars.project],
            update
          );
        }
        return previous;
      },
      onError: (_, vars, previous) => {
        if (previous) {
          queryClient.setQueryData(
            ['integration', vars.id, vars.project],
            previous
          );
        }
      },
      onSettled: (_, __, vars) => {
        queryClient.invalidateQueries(['integration', vars.id, vars.project]);
      },
    }
  );
};

export const mapUpdateToPartialIntegration = (
  spec: DetailsUpdateContext
): Partial<Integration>[] => {
  const u = Object.entries(spec.items[0].update);
  return u.map(([k, v]) => {
    return { [k]: v.set };
  });
};

export const createUpdateSpec = ({
  id,
  project,
  fieldName,
  fieldValue,
}: UpdateSpec): DetailsUpdateContext => {
  return {
    project,
    id,
    items: [
      {
        id: `${id}`,
        update: { [fieldName]: { set: fieldValue } },
      },
    ],
  };
};
type RootUpdateParams = {
  integration: Integration;
  name: IntegrationFieldName;
  project: string;
};
export const rootUpdate = ({
  integration,
  name,
  project,
}: RootUpdateParams): ((field: FieldValues) => DetailsUpdateContext) => {
  return (field: FieldValues) => {
    return createUpdateSpec({
      id: integration.id,
      project,
      fieldValue: field[name],
      fieldName: name,
    });
  };
};
