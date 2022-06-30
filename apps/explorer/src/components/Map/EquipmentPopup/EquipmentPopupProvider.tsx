import { PersonMutate } from 'domain/node/internal/types';

import { Equipment, Person } from 'graphql/generated';
import React, { createContext, useCallback, useMemo, useState } from 'react';

export interface EquipmentContextState {
  externalId: string;
  name: string;
  isBroken: boolean;
  owner: Partial<Person>;
  selected: Partial<Pick<PersonMutate, 'name' | 'externalId'>>;
}
export const EquipmentContext = createContext<{
  formState: EquipmentContextState;
  updateFields: (newState: Partial<EquipmentContextState>) => void;
}>({
  formState: {
    externalId: '',
    name: '',
    isBroken: false,
    owner: {},
    selected: {},
  },
  updateFields: () => null,
});

export const EquipmentPopupProvider: React.FC<
  React.PropsWithChildren<{ data: Partial<Equipment> }>
> = ({ children, data }) => {
  const [formState, setFormState] = useState<EquipmentContextState>({
    externalId: data.externalId || '',
    name: data.name || '',
    isBroken: !!data.isBroken,
    owner: {
      externalId: data.person?.externalId || '',
      name: data.person?.name || '',
    },
    selected: {
      externalId: data.person?.externalId || '',
      name: data.person?.name || '',
    },
  });
  const updateFields = useCallback(
    (newState: Partial<EquipmentContextState>) =>
      setFormState((previousState) => ({
        ...previousState,
        ...newState,
      })),
    []
  );
  const fields = useMemo(
    () => ({
      formState,
      updateFields,
    }),
    [formState]
  );

  return (
    <EquipmentContext.Provider value={fields}>
      {children}
    </EquipmentContext.Provider>
  );
};
