import { AccessAction, useAccessControl } from '@data-quality/hooks';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Flex, Icon, Menu, Tooltip } from '@cognite/cogs.js';

import { useDownloadReport, useReportAvailability } from './hooks';

export const DownloadReport = () => {
  const { t } = useTranslation('DownloadReport');

  const { downloadReport, isLoading: downloadingReport } = useDownloadReport();
  const {
    disabledMessage,
    isDisabled,
    isLoading: loadingReport,
  } = useReportAvailability();
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
                {t('data_quality_as_JSON', 'as JSON')}
              </Menu.Item>
              <Menu.Item
                icon="DocumentSpreadsheet"
                onClick={() => downloadReport({ fileType: 'EXCEL' })}
              >
                {t('data_quality_as_EXCEL', 'as EXCEL')}
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
              {t('data_quality_report_download', 'Download report')}
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
            {t('data_quality_report_download', 'Download report')}
          </Button>
        </Tooltip>
      )}

      <Tooltip
        content={t(
          'data_quality_report_help',
          'A validity report contains all the data instances checked during validation that failed at least one of the conditions set in the rules.'
        )}
        wrapped
      >
        <Icon
          aria-label={t(
            'data_quality_report_help_label',
            'Show information about what a report represents'
          )}
          type="Help"
        />
      </Tooltip>
    </Flex>
  );
};
