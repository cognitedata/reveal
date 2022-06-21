import { CasingAssemblyTableView } from '../Table/types';
import { CasingSchematicView } from '../types';

export const adaptToCasingAssemblyTableView = (
  casings: CasingSchematicView[]
): CasingAssemblyTableView[] => {
  return casings.flatMap(({ wellboreName, casingAssemblies }) =>
    casingAssemblies.map((casingAssembly) => ({
      ...casingAssembly,
      wellboreName,
    }))
  );
};
