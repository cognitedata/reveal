import { DocumentType } from 'modules/documentSearch/types';

export const useDataLayer = ({ docs }: { docs: DocumentType[] }) => {
  return {
    ...docs,
  };
};
