import { CasingAssemblyTableView, CasingsView } from '../types';

export const adaptToCasingAssemblyTableView = (
  casings: CasingsView[]
): CasingAssemblyTableView[] => {
  return casings.flatMap(({ wellboreName, casingAssemblies }) =>
    casingAssemblies.map((casingAssembly) => ({
      ...casingAssembly,
      wellboreName,
    }))
  );
};
