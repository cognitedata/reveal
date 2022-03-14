import { useEffect } from 'react';
import styled from 'styled-components/macro';
import { Button, Popconfirm, toast, Tooltip } from '@cognite/cogs.js';
import { useNavigate } from 'hooks/navigation';
import { useDeleteChart, useUpdateChart } from 'hooks/firebase';
import { duplicate } from 'models/chart/updates';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';
import { trackUsage } from 'services/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import DownloadDropdown from 'components/DownloadDropdown/DownloadDropdown';
import { useTranslations } from 'hooks/translations';
import { useIsChartOwner } from 'hooks/user';

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
    DownloadDropdown.csvModalTranslationKeys,
    'DownloadCSVModal'
  );

  const { t: sharingDropdownTranslations } = useTranslations(
    SharingDropdown.translationKeys,
    'SharingDropdown'
  );

  const move = useNavigate();
  const [chart] = useRecoilState(chartAtom);
  const { data: login } = useUserInfo();

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

  if (!chart) {
    return <></>;
  }

  return (
    <div
      className="cogs-topbar--item downloadChartHide"
      style={{ padding: '0 3px' }}
    >
      <Tooltip content={t.Share}>
        <SharingDropdown
          chart={chart}
          disabled={!isOwner}
          translations={sharingDropdownTranslations}
        />
      </Tooltip>
      <Divider />
      <Tooltip content={t['Download Chart']}>
        <DownloadDropdown
          chart={chart}
          translations={dropdownTranslations}
          csvModalTranslations={CSVModalTranslations}
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
    </div>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
