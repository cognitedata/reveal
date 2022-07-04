import { ComponentProps, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { Button, Popconfirm, toast, Tooltip } from '@cognite/cogs.js';
import { useNavigate } from 'hooks/navigation';
import { useDeleteChart, useUpdateChart } from 'hooks/charts-storage';
import { trackUsage } from 'services/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/charts/charts/atoms/atom';
import DownloadDropdown from 'components/DownloadDropdown/DownloadDropdown';
import { useTranslations } from 'hooks/translations';
import { useIsChartOwner } from 'hooks/user';
import {
  downloadCalculations,
  downloadImage,
  toggleDownloadChartElements,
} from 'utils/charts';
import useScreenshot from 'use-screenshot-hook';
import CSVModal from 'components/DownloadDropdown/CSVModal';
import { isProduction } from 'models/charts/config/utils/environment';
import ConnectedSharingDropdown from 'containers/SharingDropdown/ConnectedSharingDropdown';
import {
  duplicate,
  updateChartDateRange,
} from 'models/charts/charts/selectors/updates';
import Locale from 'models/charts/user-preferences/classes/Locale';

export const ChartActions = () => {
  const { t } = useTranslations(
    [
      'Chart could not be deleted!',
      'Chart could not be saved!',
      'There was a problem deleting the chart. Try again!',
      'Share',
      'Download Chart',
      'Duplicate',
      'Delete',
      'Are you sure you want to delete this chart?',
    ],
    'ChartActions'
  );
  const { t: dropdownTranslations } = useTranslations(
    DownloadDropdown.translationKeys,
    'DownloadDropdown'
  );
  const { t: CSVModalTranslations } = useTranslations(
    CSVModal.translationKeys,
    'DownloadCSVModal'
  );

  const move = useNavigate();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { data: login } = useUserInfo();
  const { takeScreenshot } = useScreenshot();
  const [isCSVModalVisible, setIsCSVModalVisible] = useState(false);

  const {
    mutateAsync: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  const {
    mutate: deleteChart,
    isError: deleteError,
    error: deleteErrorMsg,
  } = useDeleteChart();

  const isOwner = useIsChartOwner(chart);

  const deleteErrorText = t['Chart could not be deleted!'];
  const saveErrorText = t['Chart could not be saved!'];

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteErrorText, {
        toastId: 'delete-error',
      });
    }
    if (deleteError && deleteErrorMsg) {
      toast.error(JSON.stringify(deleteErrorMsg, null, 2), {
        toastId: 'delete-error-body',
      });
    }
  }, [deleteError, deleteErrorMsg, deleteErrorText]);

  useEffect(() => {
    if (updateError) {
      toast.error(saveErrorText, { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg, saveErrorText]);

  const handleDuplicateChart = async () => {
    if (chart && login?.id) {
      const newChart = duplicate(chart, login);
      await updateChart(newChart);
      trackUsage('ChartView.DuplicateChart', { isOwner });
      move(`/${newChart.id}`);
    }
  };

  const handleDeleteChart = async () => {
    if (chart) {
      deleteChart(chart.id, {
        onSuccess: onDeleteSuccess,
        onError: onDeleteError,
      });
    }
  };

  const onDeleteSuccess = () => {
    move('/');
  };

  const onDeleteError = () => {
    toast.error(t['There was a problem deleting the chart. Try again!'], {
      toastId: 'chart-delete',
    });
  };

  const handleDownloadCalculations = () => {
    const calculations = chart?.workflowCollection || [];
    downloadCalculations(calculations, chart?.name);
  };

  const handleDownloadImage = () => {
    const height = toggleDownloadChartElements(true);
    takeScreenshot('png').then((image) => {
      toggleDownloadChartElements(false, height);
      downloadImage(image, chart?.name);
    });
  };

  const handleDateChange: ComponentProps<typeof CSVModal>['onDateChange'] = ({
    startDate,
    endDate,
  }) => {
    if (startDate || endDate) {
      setChart((oldChart: any) =>
        updateChartDateRange(oldChart!, startDate, endDate)
      );
      trackUsage('ChartView.DateChange', { source: 'daterange' });
    }
  };

  if (!chart) {
    return <></>;
  }

  return (
    <div
      className="cogs-topbar--item downloadChartHide"
      style={{ padding: '0 3px' }}
    >
      <Tooltip content={t.Share}>
        <ConnectedSharingDropdown />
      </Tooltip>
      <Divider />
      <Tooltip content={t['Download Chart']}>
        <DownloadDropdown
          translations={dropdownTranslations}
          onDownloadCalculations={
            isProduction ? undefined : handleDownloadCalculations
          }
          onDownloadImage={handleDownloadImage}
          onCsvDownload={() => setIsCSVModalVisible(true)}
        />
      </Tooltip>
      <Divider />
      <Tooltip content={t.Duplicate}>
        <Button
          icon="Copy"
          type="ghost"
          onClick={handleDuplicateChart}
          aria-label="copy"
        />
      </Tooltip>
      <Divider />
      <Tooltip content={t.Delete}>
        <Popconfirm
          content={t['Are you sure you want to delete this chart?']}
          onConfirm={handleDeleteChart}
          disabled={!isOwner}
        >
          <Button
            icon="Delete"
            type="ghost"
            disabled={!isOwner}
            aria-label="delete"
          />
        </Popconfirm>
      </Tooltip>
      <CSVModal
        isOpen={isCSVModalVisible}
        onClose={() => setIsCSVModalVisible(false)}
        translations={CSVModalTranslations}
        dateFrom={new Date(chart.dateFrom)}
        dateTo={new Date(chart.dateTo)}
        onDateChange={handleDateChange}
        locale={Locale.currentDateFnsLocale}
      />
    </div>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
