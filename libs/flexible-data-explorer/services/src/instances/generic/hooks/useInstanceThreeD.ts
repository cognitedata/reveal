import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { DataModelV2, Instance } from '@fdx/shared/types/services';

import { useInstanceRelationshipQuery } from '../queries/useInstanceRelationshipQuery';

/**
 * Currently, this hooks in being used to determine whether
 * a data type have a field that is a 3d model, furthermore,
 * querying the respective relationship to identify if its
 * linked to a 3d model node, or not (null).
 */
export const useInstanceThreeDEntryQuery = (
  instance?: Instance,
  dataModel?: DataModelV2
) => {
  const client = useFDM();

  const dataModelFromInstance = client.getDataModelByDataType(
    instance?.dataType ?? ''
  );

  const has3dModelField = client
    .getTypesByDataType(instance?.dataType)
    ?.fields.some((item) => {
      return item.isThreeD;
    });

  const result = useInstanceRelationshipQuery(
    {
      field: 'inModel3d',
      type: 'Cdf3dModel',
    },
    undefined,
    {
      instance,
      model: dataModel ?? dataModelFromInstance,
    },
    {
      enabled: has3dModelField,
    }
  );

  return result;
};
