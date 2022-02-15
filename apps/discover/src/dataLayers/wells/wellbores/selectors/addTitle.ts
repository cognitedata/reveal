import { Wellbore } from '@cognite/sdk-wells-v2';

export const addTitle = <T extends Wellbore>(wellbore: T) => {
  const title =
    wellbore.description === wellbore.name
      ? wellbore.name
      : `${wellbore.description} ${wellbore.name}`;

  return {
    ...wellbore,
    title,
  };
};
