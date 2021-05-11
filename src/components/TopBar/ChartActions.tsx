import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
import { Button, toast, Tooltip, TopBar } from '@cognite/cogs.js';
import { useLoginStatus } from 'hooks';
import { useChart, useDeleteChart, useUpdateChart } from 'hooks/firebase';
import { useHistory, useParams } from 'react-router-dom';
import { duplicate } from 'utils/charts';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';

export const ChartActions = () => {
  const history = useHistory();

  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { data: login } = useLoginStatus();

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

  const isOwner = login?.user === chart?.user;

  useEffect(() => {
    if (deleteError) {
      toast.error('Chart could not be deleted!', { toastId: 'delete-error' });
    }
    if (deleteError && deleteErrorMsg) {
      toast.error(JSON.stringify(deleteErrorMsg, null, 2), {
        toastId: 'delete-error-body',
      });
    }
  }, [deleteError, deleteErrorMsg]);

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!', { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg]);

  const handleDuplicateChart = async () => {
    if (chart && login?.user) {
      const newChart = duplicate(chart, login.user);
      await updateChart(newChart);
      history.push(`/${newChart.id}`);
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
    history.push('/');
  };

  const onDeleteError = () => {
    toast.error('There was a problem deleting the chart. Try again!', {
      toastId: 'chart-delete',
    });
  };

  if (!chart) {
    return <></>;
  }

  return (
    <TopBar.Item style={{ padding: '0 3px' }}>
      <Tooltip content="Share">
        <SharingDropdown chart={chart} disabled={!isOwner} />
      </Tooltip>
      <Tooltip content="Export">
        <Button icon="Download" type="ghost" disabled aria-label="download" />
      </Tooltip>
      <Tooltip content="Duplicate">
        <Button
          icon="Copy"
          type="ghost"
          onClick={handleDuplicateChart}
          aria-label="copy"
        />
      </Tooltip>
      <Divider />
      <Tooltip content="Delete">
        <Button
          icon="Trash"
          type="ghost"
          onClick={handleDeleteChart}
          disabled={!isOwner}
          aria-label="delete"
        />
      </Tooltip>
      <Divider />
      <Tooltip content="Settings">
        <Button icon="Settings" type="ghost" disabled aria-label="settings" />
      </Tooltip>
    </TopBar.Item>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
