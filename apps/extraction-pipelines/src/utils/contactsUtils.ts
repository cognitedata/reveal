import { IntegrationFieldName, IntegrationFieldValue } from 'model/Integration';
import { IntegrationUpdateSpec } from './IntegrationsAPI';

export type UpdateSpec = {
  id: number;
  fieldName: IntegrationFieldName;
  fieldValue: IntegrationFieldValue;
};
export const createUpdateSpec = ({
  id,
  fieldName,
  fieldValue,
}: UpdateSpec): IntegrationUpdateSpec[] => {
  return [
    {
      id: `${id}`,
      update: { [fieldName]: { set: fieldValue } },
    },
  ];
};
