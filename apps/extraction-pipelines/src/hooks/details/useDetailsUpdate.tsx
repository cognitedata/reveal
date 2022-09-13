import { useMutation, useQueryClient } from 'react-query';
import { Extpipe, ExtpipeFieldName, ExtpipeFieldValue } from 'model/Extpipe';
import { ErrorVariations } from 'model/SDKErrors';
import { ExtpipeUpdateSpec, saveUpdate } from 'utils/ExtpipesAPI';
import { FieldValues } from 'react-hook-form';
import { useSDK } from '@cognite/sdk-provider';

export type UpdateSpec = {
  id: number;
  fieldName: ExtpipeFieldName;
  fieldValue: ExtpipeFieldValue;
};

export type DetailsUpdateContext = {
  items: ExtpipeUpdateSpec[];
  id: number;
};
export const useDetailsUpdate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation<Extpipe, ErrorVariations, DetailsUpdateContext>({
    mutationFn: ({ items }) => {
      return saveUpdate(sdk, items);
    },
    onMutate: (vars) => {
      queryClient.cancelQueries(['extpipe', vars.id]);
      const previous: Extpipe | undefined = queryClient.getQueryData([
        'extpipe',
        vars.id,
      ]);
      if (previous) {
        const fields = mapUpdateToPartialExtpipe(vars);
        const update = Object.assign({}, previous, ...fields);
        queryClient.setQueryData(['extpipe', vars.id], update);
      }
      return previous;
    },
    onError: (_, vars, previous) => {
      if (previous) {
        queryClient.setQueryData(['extpipe', vars.id], previous);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries(['extpipe', vars.id]);
    },
  });
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
  fieldName,
  fieldValue,
}: UpdateSpec): DetailsUpdateContext => {
  return {
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
};
export const rootUpdate = ({
  extpipe,
  name,
}: RootUpdateParams): ((field: FieldValues) => DetailsUpdateContext) => {
  return (field: FieldValues) => {
    return createUpdateSpec({
      id: extpipe.id,
      fieldValue: field[name],
      fieldName: name,
    });
  };
};
