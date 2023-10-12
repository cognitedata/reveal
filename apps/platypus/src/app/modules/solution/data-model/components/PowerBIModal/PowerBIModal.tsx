import { getProject } from '@cognite/cdf-utilities';
import { Button, Flex, Modal } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { FormLabel } from '../../../../../components/FormLabel/FormLabel';
import { Notification } from '../../../../../components/Notification/Notification';
import { useTranslation } from '../../../../../hooks/useTranslation';

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

export const getODataFDMProjectField = (
  dataModel: DataModelMetadata
): string => {
  return `${getProject()}/models/spaces/${dataModel.space}/datamodels/${
    dataModel.externalId
  }/versions/${dataModel.version}`;
};

export const getODataFDMEnvironmentField = (baseUrl: string): string => {
  return `${baseUrl}/${odataVersion}`;
};

/**
 * Last released version of 'OData for fdm service' https://cognitedata.atlassian.net/l/cp/vrMSNwoR
 */
const odataVersion = '20230821';

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
 * - getProject()
 * Component uses {@link @cognite/sdk-provider} functions
 * - useSDK().getBaseUrl()
 */
export const PowerBIModal: React.FC<PowerBIModalProps> = (props) => {
  const { t } = useTranslation('DataModelPowerBIModal');
  const projectField = getODataFDMProjectField(props.dataModel);

  const sdk = useSDK();
  const environmentField = getODataFDMEnvironmentField(sdk.getBaseUrl());

  const handleCopyProjectClick = () => {
    navigator.clipboard.writeText(projectField);
    Notification({
      type: 'success',
      message: t(
        'data_model_powerbi_modal_copied_toast_message',
        'Copied to clipboard'
      ),
    });
  };

  const handleCopyEnvironmentClick = () => {
    navigator.clipboard.writeText(environmentField || '');
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
      title={t(
        'data_model_powerbi_modal_title',
        'Settings to connect the data model to Power BI'
      )}
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
              {projectField}
            </StyledEndpoint>
            <Button onClick={handleCopyProjectClick} icon="Copy">
              {t('data_model_powerbi_modal_copy_button_text', 'Copy')}
            </Button>
          </Flex>
        </StyledWrapper>
        <StyledWrapper>
          <FormLabel size="large">
            {t('data_model_powerbi_modal_environment', 'CDF: Environment')}
          </FormLabel>
          <Flex>
            <StyledEndpoint data-cy="powerbi-env">
              {environmentField}
            </StyledEndpoint>
            <Button onClick={handleCopyEnvironmentClick} icon="Copy">
              {t('data_model_powerbi_modal_copy_button_text', 'Copy')}
            </Button>
          </Flex>
        </StyledWrapper>
      </div>
    </Modal>
  );
};
