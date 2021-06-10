import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, toast } from '@cognite/cogs.js';

import { Chart } from 'reducers/charts/types';
import { useDeleteChart, useUpdateChart } from 'hooks/firebase';
import { useIsChartOwner, useNavigate } from 'hooks';
import { duplicate } from 'utils/charts';

import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { ListViewItem } from './ListViewItem';
import { GridViewItem } from './GridViewItem';

export type ViewOption = 'list' | 'grid';

interface ChartListItemProps {
  chart: Chart;
  view: ViewOption;
}

const ChartListItem = ({ chart, view }: ChartListItemProps) => {
  const move = useNavigate();

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

  useEffect(() => {
    if (renameError) {
      toast.error('Unable to rename chart - Try again!', {
        toastId: 'rename-chart',
      });
    }
  }, [renameError]);

  const handleDeleteChart = () => {
    deleteChart(chart.id);
  };

  useEffect(() => {
    if (deleteError) {
      toast.error('Unable to delete chart - Try again!', {
        toastId: 'delete-chart',
      });
    }
  }, [deleteError]);

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
        <Menu onClick={closeMenu}>
          <Menu.Header>
            <span style={{ wordBreak: 'break-word' }}>{chart.name}</span>
          </Menu.Header>
          {isChartOwner && (
            <>
              <Menu.Item
                onClick={() => setIsEditingName(true)}
                appendIcon="Edit"
              >
                <span>Rename</span>
              </Menu.Item>
              <Menu.Item
                onClick={() => handleDeleteChart()}
                appendIcon="Delete"
              >
                <span>Delete</span>
              </Menu.Item>
            </>
          )}
          <Menu.Item
            onClick={() => handleDuplicateChart()}
            appendIcon="Duplicate"
          >
            <span>Duplicate</span>
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        type="ghost"
        icon="VerticalEllipsis"
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

export default ChartListItem;
