import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Flex, Icon, Menu, Tooltip } from '@cognite/cogs.js';

import { useDownloadReport } from './useDownloadReport';
import { useReportAvailability } from './useReportAvailability';

export const DownloadReport = () => {
  const { t } = useTranslation('DownloadReport');

  const { downloadReport, isLoading: downloadingReport } = useDownloadReport();
  const {
    disabledMessage,
    isDisabled,
    isLoading: loadingReport,
  } = useReportAvailability();

  const isLoading = downloadingReport || loadingReport;

  return (
    <Flex alignItems="center" direction="row" gap={8}>
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
            type="tertiary"
          >
            {t('data_quality_report_download', 'Download report')}
          </Button>
        </Tooltip>
      </Dropdown>
      <Tooltip
        content={t(
          'data_quality_report_help',
          'A validity report contains all the data instances checked during validation that failed at least one of the conditions set in the rules.'
        )}
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
