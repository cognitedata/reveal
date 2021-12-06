import { useMutation, useQueryClient } from 'react-query';
import { Extpipe, ExtpipeFieldName, ExtpipeFieldValue } from 'model/Extpipe';
import { ErrorVariations } from 'model/SDKErrors';
import { ExtpipeUpdateSpec, saveUpdate } from 'utils/ExtpipesAPI';
import { FieldValues } from 'react-hook-form';

export type UpdateSpec = {
  id: number;
  project: string;
  fieldName: ExtpipeFieldName;
  fieldValue: ExtpipeFieldValue;
};

export type DetailsUpdateContext = {
  project: string;
  items: ExtpipeUpdateSpec[];
  id: number;
};
export const useDetailsUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<Extpipe, ErrorVariations, DetailsUpdateContext>(
    ({ project, items }) => {
      return saveUpdate(project, items);
    },
    {
      onMutate: (vars) => {
        queryClient.cancelQueries(['extpipe', vars.id, vars.project]);
        const previous: Extpipe | undefined = queryClient.getQueryData([
          'extpipe',
          vars.id,
          vars.project,
        ]);
        if (previous) {
          const fields = mapUpdateToPartialExtpipe(vars);
          const update = Object.assign({}, previous, ...fields);
          queryClient.setQueryData(['extpipe', vars.id, vars.project], update);
        }
        return previous;
      },
      onError: (_, vars, previous) => {
        if (previous) {
          queryClient.setQueryData(
            ['extpipe', vars.id, vars.project],
            previous
          );
        }
      },
      onSettled: (_, __, vars) => {
        queryClient.invalidateQueries(['extpipe', vars.id, vars.project]);
      },
    }
  );
};

export const mapUpdateToPartialExtpipe = (
  spec: DetailsUpdateContext
): Partial<Extpipe>[] => {
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
  extpipe: Extpipe;
  name: ExtpipeFieldName;
  project: string;
};
export const rootUpdate = ({
  extpipe,
  name,
  project,
}: RootUpdateParams): ((field: FieldValues) => DetailsUpdateContext) => {
  return (field: FieldValues) => {
    return createUpdateSpec({
      id: extpipe.id,
      project,
      fieldValue: field[name],
      fieldName: name,
    });
  };
};
