import capitalize from 'lodash/capitalize';

export const formatRigName = (rigName: string) => {
  return rigName.replace(/\w+/g, capitalize);
};
