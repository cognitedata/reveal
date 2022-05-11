import { ComponentProps, useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import { Chart } from 'models/chart/types';
import { useDeleteChart, useUpdateChart } from 'hooks/charts-storage';
import { useNavigate } from 'hooks/navigation';
import { duplicate } from 'models/chart/updates';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useIsChartOwner } from 'hooks/user';
import { makeDefaultTranslations } from 'utils/translations';
import Dropdown from 'components/Dropdown/Dropdown';
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

  type DropdownOptions = ComponentProps<
    typeof Dropdown.Uncontrolled
  >['options'];

  const ownerMenuItems: DropdownOptions = [
    {
      label: t.Rename,
      icon: 'Edit',
      onClick: () => setIsEditingName(true),
    },
    {
      label: t.Delete,
      icon: 'Delete',
      onClick: () => handleDeleteChart(),
    },
  ];

  const readOnlyMenuItems: DropdownOptions = [
    {
      label: t.Duplicate,
      icon: 'Duplicate',
      onClick: () => handleDuplicateChart(),
    },
  ];

  const dropdownMenu = (
    <Dropdown.Uncontrolled
      title={chart.name}
      options={
        isChartOwner
          ? [...ownerMenuItems, ...readOnlyMenuItems]
          : readOnlyMenuItems
      }
      btnProps={{ icon: 'EllipsisVertical' }}
    />
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
