import { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, toast } from '@cognite/cogs.js';
import { Chart } from 'models/chart/types';
import { useDeleteChart, useUpdateChart } from 'hooks/firebase';
import { useNavigate } from 'hooks/navigation';
import { duplicate } from 'models/chart/updates';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useIsChartOwner } from 'hooks/user';
import { makeDefaultTranslations } from 'utils/translations';
import { ListViewItem } from './ListViewItem';
import { GridViewItem } from './GridViewItem';

export type ViewOption = 'list' | 'grid';

interface ChartListItemProps {
  chart: Chart;
  view: ViewOption;
  translations?: typeof defaultTranslations;
}

const defaultTranslations = makeDefaultTranslations(
  'Unable to rename chart - Try again!',
  'Unable to delete chart - Try again!',
  'Rename',
  'Delete',
  'Duplicate'
);

const ChartListItem = ({ chart, view, translations }: ChartListItemProps) => {
  const move = useNavigate();
  const t = { ...defaultTranslations, ...translations };

  const { data: login } = useUserInfo();
  const { mutateAsync: updateChart, isError: renameError } = useUpdateChart();
  const { mutate: deleteChart, isError: deleteError } = useDeleteChart();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const isChartOwner = useIsChartOwner(chart);

  const handleRenameChart = (name: string) => {
    updateChart({ ...chart, name });
    setIsEditingName(false);
  };

  const translatedRenameError = t['Unable to rename chart - Try again!'];
  const translatedDeleteError = t['Unable to delete chart - Try again!'];

  useEffect(() => {
    if (renameError) {
      toast.error(translatedRenameError, {
        toastId: 'rename-chart',
      });
    }
  }, [renameError, translatedRenameError]);

  const handleDeleteChart = () => {
    deleteChart(chart.id);
  };

  useEffect(() => {
    if (deleteError) {
      toast.error(translatedDeleteError, {
        toastId: 'delete-chart',
      });
    }
  }, [deleteError, translatedDeleteError]);

  const handleDuplicateChart = () => {
    if (login?.id) {
      const newChart = duplicate(chart, login);
      updateChart(newChart).then(() => move(`/${newChart.id}`));
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const dropdownMenu = (
    <Dropdown
      visible={isMenuOpen}
      onClickOutside={closeMenu}
      content={
        <Menu onClick={closeMenu} style={{ width: 150 }}>
          <Menu.Header>
            <span style={{ wordBreak: 'break-word' }}>{chart.name}</span>
          </Menu.Header>
          {isChartOwner && (
            <>
              <Menu.Item
                onClick={() => setIsEditingName(true)}
                appendIcon="Edit"
              >
                <span>{t.Rename}</span>
              </Menu.Item>
              <Menu.Item
                onClick={() => handleDeleteChart()}
                appendIcon="Delete"
              >
                <span>{t.Delete}</span>
              </Menu.Item>
            </>
          )}
          <Menu.Item
            onClick={() => handleDuplicateChart()}
            appendIcon="Duplicate"
          >
            <span>{t.Duplicate}</span>
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        type="ghost"
        icon="EllipsisVertical"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="more"
      />
    </Dropdown>
  );

  if (view === 'list') {
    return (
      <ListViewItem
        chart={chart}
        dropdownMenu={dropdownMenu}
        handleRenameChart={handleRenameChart}
        isEditingName={isEditingName}
        cancelEdition={() => setIsEditingName(false)}
      />
    );
  }

  return (
    <GridViewItem
      chart={chart}
      dropdownMenu={dropdownMenu}
      handleRenameChart={handleRenameChart}
      isEditingName={isEditingName}
      cancelEdition={() => setIsEditingName(false)}
    />
  );
};

ChartListItem.translationKeys = Object.keys(defaultTranslations);

export default ChartListItem;
