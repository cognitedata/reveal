import { useState } from 'react';

import { useLoadDataSource } from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import sdk from '@cognite/cdf-sdk-singleton';

import { downloadAsExcel, downloadAsJSON } from './helpers';

type DownloadReportOptions = {
  fileType: 'JSON' | 'EXCEL';
};

/** Start the process of downloading the validity report for a data source.
 * The report can be downloaded as a JSON file or as an EXCEL file. */
export const useDownloadReport = () => {
  const { t } = useTranslation('useDownloadReport');

  const [downloadLoading, setDownloadLoading] = useState(false);

  const { dataSource, isLoading: dsLoading } = useLoadDataSource();

  const isLoading = dsLoading || downloadLoading;

  const downloadReport = async ({ fileType }: DownloadReportOptions) => {
    if (!dataSource) return;

    setDownloadLoading(true);
    try {
      const fileUrl = await sdk.files.getDownloadUrls([
        { externalId: dataSource.externalId },
      ]);
      const downloadUrl = fileUrl[0].downloadUrl;
      const fileName = `Data validation report ${dataSource.dataModelId}`;

      if (fileType === 'JSON') {
        await downloadAsJSON(downloadUrl, fileName);
      } else {
        await downloadAsExcel(downloadUrl, fileName);
      }
    } catch (err: any) {
      Notification({
        type: 'error',
        message: t(
          'data_quality_error_report',
          'Something went wrong. The report could not be downloaded.'
        ),
        errors: err.toString(),
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return { downloadReport, isLoading };
};
