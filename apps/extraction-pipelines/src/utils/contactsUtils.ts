import { IntegrationUpdateSpec } from './IntegrationsAPI';
import {
  IntegrationFieldName,
  IntegrationFieldValue,
} from '../model/Integration';

export const createUpdateSpec = ({
  id,
  fieldName,
  fieldValue,
}: {
  id: number;
  fieldName: IntegrationFieldName;
  fieldValue: IntegrationFieldValue;
}): IntegrationUpdateSpec[] => {
  return [
    {
      id: `${id}`,
      update: { [fieldName]: { set: fieldValue } },
    },
  ];
};
