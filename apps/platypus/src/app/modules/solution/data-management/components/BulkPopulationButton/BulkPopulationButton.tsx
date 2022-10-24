import { Button, Tooltip } from '@cognite/cogs.js';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataManagementState } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { useParams } from 'react-router-dom';

import { useDataManagementPageUI } from '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI';

import useTransformationCreateMutation from '@platypus-app/modules/solution/data-management/hooks/useTransformationCreateMutation';
import { suggestTransformationProperties } from '@platypus-core/domain/transformation';

export const BulkPopulationButton = () => {
  const { t } = useTranslation('BulkPopulationButton');
  const { setIsTransformationModalOpen, getMissingPermissions } =
    useDataManagementPageUI();

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const { dataModelExternalId } = useParams<{
    dataModelExternalId: string;
  }>();

  const { selectedType } = useSelector<DataManagementState>(
    (state) => state.dataManagement
  );

  // we need data model version to get version number because
  // selectedVersionNumber can be "latest"
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );

  const createTransformationMutation = useTransformationCreateMutation();

  const missingPermissions = getMissingPermissions();

  if (!selectedType) {
    return null;
  }

  const { externalId: transformationExternalId, name: transformationName } =
    suggestTransformationProperties({
      dataModelExternalId,
      numExistingTransformations: 0,
      typeName: selectedType.name,
      version: selectedDataModelVersion.version,
    });

  return (
    <Tooltip
      disabled={missingPermissions.length === 0}
      content={t(
        'transformation-acl-message',
        `You do not have enough permissions to load data. Missing permissions: [${missingPermissions}]`
      )}
    >
      <Button
        icon="ExternalLink"
        iconPlacement="right"
        onClick={() => {
          createTransformationMutation.mutate(
            {
              dataModelExternalId,
              transformationExternalId,
              transformationName,
              typeName: selectedType.name,
              version: selectedDataModelVersion.version,
            },
            {
              onSuccess: (transformation) => {
                setIsTransformationModalOpen(true, transformation.id);
              },
            }
          );
        }}
      >
        {t('load-data-button', 'Load data in bulk')}
      </Button>
    </Tooltip>
  );
};
