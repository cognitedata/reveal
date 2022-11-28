import { ComponentProps, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { Button, Dropdown, Popconfirm, toast, Tooltip } from '@cognite/cogs.js';
import { useNavigate } from 'react-router-dom';
import { useDeleteChart, useUpdateChart } from 'hooks/charts-storage';
import { duplicate, updateChartDateRange } from 'models/chart/updates';
import { trackUsage } from 'services/metrics';
import { useUserInfo } from 'hooks/useUserInfo';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import DownloadDropdown from 'components/DownloadDropdown/DownloadDropdown';
import { useTranslations } from 'hooks/translations';
import { useIsChartOwner } from 'hooks/user';
import {
  downloadCalculations,
  downloadImage,
  toggleDownloadChartElements,
} from 'utils/charts';
import useScreenshot from 'use-screenshot-hook';
import CSVModal from 'components/CSVModal/CSVModal';
import { createInternalLink } from 'utils/link';
import { isProduction } from 'utils/environment';
import { currentDateRangeLocale } from 'config/locale';
import ConnectedSharingDropdown from 'components/SharingDropdown/ConnectedSharingDropdown';
import config from 'config/config';
import {
  StyledMenu,
  HorizontalDivider,
  StyledMenuButton,
  StyledMenuButtonDelete,
  StyledMenuDuplicate,
  PopupText,
  PopupContainer,
} from './elements';

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
      'Delete chart',
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
      move(createInternalLink(newChart.id));
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
    move(createInternalLink());
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

  if (config.isFusion) {
    const popperOptions = {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [-550, 10],
          },
        },
      ],
    };
    return (
      <>
        <Dropdown
          content={
            <StyledMenu className="downloadChartHide">
              <StyledMenuButton type="ghost">
                <ConnectedSharingDropdown
                  label={t.Share}
                  popperOptions={popperOptions}
                />
              </StyledMenuButton>
              <StyledMenuButton type="ghost">
                <DownloadDropdown
                  label={t['Download Chart']}
                  translations={dropdownTranslations}
                  onDownloadCalculations={
                    isProduction ? undefined : handleDownloadCalculations
                  }
                  onDownloadImage={handleDownloadImage}
                  onCsvDownload={() => setIsCSVModalVisible(true)}
                />
              </StyledMenuButton>
              <StyledMenuDuplicate
                icon="Duplicate"
                type="ghost"
                onClick={handleDuplicateChart}
              >
                {t.Duplicate}
              </StyledMenuDuplicate>
              <HorizontalDivider />
              <PopupContainer>
                <Popconfirm
                  content={
                    <PopupText>
                      {t['Are you sure you want to delete this chart?']}
                    </PopupText>
                  }
                  onConfirm={handleDeleteChart}
                  disabled={!isOwner}
                >
                  <StyledMenuButtonDelete
                    icon="Delete"
                    type="ghost"
                    onClick={() => {}}
                  >
                    {t['Delete chart']}
                  </StyledMenuButtonDelete>
                </Popconfirm>
              </PopupContainer>
            </StyledMenu>
          }
        >
          <Button icon="EllipsisHorizontal" iconPlacement="right">
            Actions
          </Button>
        </Dropdown>
        <CSVModal
          isOpen={isCSVModalVisible}
          onClose={() => setIsCSVModalVisible(false)}
          translations={CSVModalTranslations}
          dateFrom={new Date(chart.dateFrom)}
          dateTo={new Date(chart.dateTo)}
          onDateChange={handleDateChange}
          locale={currentDateRangeLocale()}
        />
      </>
    );
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
          content={
            <div style={{ margin: '1em' }}>
              {t['Are you sure you want to delete this chart?']}
            </div>
          }
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
        locale={currentDateRangeLocale()}
      />
    </div>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
