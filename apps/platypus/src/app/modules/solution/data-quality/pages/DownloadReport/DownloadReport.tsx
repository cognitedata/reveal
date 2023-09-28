import {
  AccessAction,
  ValidationStatus,
  useAccessControl,
} from '@data-quality/hooks';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Flex, Icon, Menu, Tooltip } from '@cognite/cogs.js';

import { useDownloadReport, useReportAvailability } from './hooks';

type DownloadReportProps = {
  validationStatus: ValidationStatus;
};

export const DownloadReport = ({ validationStatus }: DownloadReportProps) => {
  const { t } = useTranslation('DownloadReport');

  const { downloadReport, isLoading: downloadingReport } = useDownloadReport();
  const {
    disabledMessage,
    isDisabled,
    isLoading: loadingReport,
  } = useReportAvailability(validationStatus);
  const {
    isLoading: loadingAccess,
    canDownloadReport,
    useErrorMessage,
  } = useAccessControl();

  const isLoading = downloadingReport || loadingReport || loadingAccess;

  const accessErrorMessage = useErrorMessage(AccessAction.DOWNLOAD_REPORT);

  return (
    <Flex alignItems="center" direction="row" gap={8}>
      {canDownloadReport ? (
        // Show the drop-down when the user has access to download
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                icon="DocumentCode"
                onClick={() => downloadReport({ fileType: 'JSON' })}
              >
                {t('data_quality_as_JSON', '')}
              </Menu.Item>
              <Menu.Item
                icon="DocumentSpreadsheet"
                onClick={() => downloadReport({ fileType: 'EXCEL' })}
              >
                {t('data_quality_as_EXCEL', '')}
              </Menu.Item>
            </Menu>
          }
          disabled={isDisabled || isLoading}
          hideOnSelect
        >
          <Tooltip content={disabledMessage} disabled={!isDisabled}>
            <Button
              icon="DocumentDownload"
              iconPlacement="right"
              disabled={isDisabled || isLoading}
              loading={isLoading}
              type="secondary"
            >
              {t('data_quality_report_download', '')}
            </Button>
          </Tooltip>
        </Dropdown>
      ) : (
        // Show a disabled button when there is no access
        <Tooltip content={accessErrorMessage} wrapped>
          <Button
            icon="DocumentDownload"
            iconPlacement="right"
            disabled
            loading={isLoading}
            type="tertiary"
          >
            {t('data_quality_report_download', '')}
          </Button>
        </Tooltip>
      )}

      <Tooltip content={t('data_quality_report_help', '')} wrapped>
        <Icon
          aria-label={t('data_quality_report_help_label', '')}
          type="Help"
        />
      </Tooltip>
    </Flex>
  );
};
