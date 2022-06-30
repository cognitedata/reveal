import { Room } from 'graphql/generated';
import React, { createContext, useCallback, useMemo, useState } from 'react';

interface RoomContextState {
  name: string;
  description: string;
  isBookable: boolean;
}
export const RoomContext = createContext<{
  formState: RoomContextState;
  updateFields: (newState: Partial<RoomContextState>) => void;
}>({
  formState: { name: '', description: '', isBookable: true },
  updateFields: () => null,
});

export const RoomPopupProvider: React.FC<
  React.PropsWithChildren<{ data: Room }>
> = ({ children, data }) => {
  const [formState, setFormState] = useState<RoomContextState>({
    name: data.name || '',
    description: data.description || '',
    isBookable: !!data.isBookable,
  });

  const updateFields = useCallback(
    (newState: Partial<RoomContextState>) =>
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

  return <RoomContext.Provider value={fields}>{children}</RoomContext.Provider>;
};
