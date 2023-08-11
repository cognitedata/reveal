import { FormLabel } from '@platypus-app/components/FormLabel/FormLabel';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { getCluster, getProject, getEnv } from '@cognite/cdf-utilities';
import { Button, Flex, Modal } from '@cognite/cogs.js';

import { StyledEndpoint, StyledWrapper } from './elements';

interface DataModelMetadata {
  space: string;
  externalId: string;
  version: string;
}

export interface PowerBIModalProps {
  dataModel: DataModelMetadata;
  onRequestClose: () => void;
}

export const getODataFDMServiceURL = (dataModel: DataModelMetadata): string => {
  return `https://${getCluster()}/odata/${odataVersion}/projects/${getProject()}/models/spaces/${
    dataModel.space
  }/datamodels/${dataModel.externalId}/versions/${dataModel.version}`;
};

/**
 * Last released version of 'OData for fdm service' https://cognitedata.atlassian.net/l/cp/vrMSNwoR
 */
const odataVersion = '21082023';

/**
 * PowerBI modal generates configuration for 'CDF Power BI connector'
 * based on the data model information and global information
 *
 * @param dataModel.space - space for the data model
 * @param dataModel.externalId - externalId for the data model
 * @param dataModel.version - version for the data model
 *
 * @remarks
 * Component uses {@link @cognite/cdf-utilities} functions
 * - getCluster()
 * - getProject()
 * - getEnv()
 */
export const PowerBIModal: React.FC<PowerBIModalProps> = (props) => {
  const { t } = useTranslation('DataModelPowerBIModal');
  const powerBIUrl = getODataFDMServiceURL(props.dataModel);
  const enviroment = getEnv();

  const handleCopyProjectClick = () => {
    navigator.clipboard.writeText(powerBIUrl);
    Notification({
      type: 'success',
      message: t(
        'data_model_powerbi_modal_copied_toast_message',
        'Copied to clipboard'
      ),
    });
  };

  const handleCopyEnviromentClick = () => {
    navigator.clipboard.writeText(enviroment || '');
    Notification({
      type: 'success',
      message: t(
        'data_model_powerbi_modal_copied_toast_message',
        'Copied to clipboard'
      ),
    });
  };

  return (
    <Modal
      visible
      title={t('data_model_powerbi_modal_title', 'Cognite Data Fusion (CDF)')}
      onOk={props.onRequestClose}
      onCancel={props.onRequestClose}
      hideFooter
    >
      <div>
        <StyledWrapper>
          <FormLabel size="large">
            {t('data_model_powerbi_modal_project_name', 'Project Name')}
          </FormLabel>
          <Flex>
            <StyledEndpoint data-cy="powerbi-project-name">
              {powerBIUrl}
            </StyledEndpoint>
            <Button onClick={handleCopyProjectClick} icon="Copy">
              {t('data_model_powerbi_modal_copy_button_text', 'Copy')}
            </Button>
          </Flex>
        </StyledWrapper>
        <StyledWrapper>
          <FormLabel size="large">
            {t('data_model_powerbi_modal_enviroment', 'CDF: Enviroment')}
          </FormLabel>
          <Flex>
            <StyledEndpoint data-cy="powerbi-env">{enviroment}</StyledEndpoint>
            <Button onClick={handleCopyEnviromentClick} icon="Copy">
              {t('data_model_powerbi_modal_copy_button_text', 'Copy')}
            </Button>
          </Flex>
        </StyledWrapper>
      </div>
    </Modal>
  );
};
