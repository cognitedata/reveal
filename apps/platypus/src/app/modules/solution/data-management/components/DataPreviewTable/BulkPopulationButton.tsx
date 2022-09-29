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

import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';

import { useTransformationMutate } from '../../hooks/useTransformationAPI';

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
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );

  const { selectedType } = useSelector<DataManagementState>(
    (state) => state.dataManagement
  );

  const typeKey = `${selectedType?.name}_${selectedDataModelVersion.version}`;

  const { mutate } = useTransformationMutate(typeKey, dataModelExternalId);

  const missingPermissions = getMissingPermissions();

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
          mutate();
          setIsTransformationModalOpen(true);
        }}
      >
        {t('load-data-button', 'Load data in bulk')}
      </Button>
    </Tooltip>
  );
};
