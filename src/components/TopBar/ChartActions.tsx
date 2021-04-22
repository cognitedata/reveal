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
      toast.error('Chart could not be deleted!');
    }
    if (deleteError && deleteErrorMsg) {
      toast.error(JSON.stringify(deleteErrorMsg, null, 2));
    }
  }, [deleteError, deleteErrorMsg]);

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!');
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2));
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
    toast.error('There was a problem deleting the chart. Try again!');
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
        <Button icon="Download" variant="ghost" disabled />
      </Tooltip>
      <Tooltip content="Duplicate">
        <Button icon="Copy" variant="ghost" onClick={handleDuplicateChart} />
      </Tooltip>
      <Divider />
      <Tooltip content="Delete">
        <Button
          icon="Trash"
          variant="ghost"
          onClick={handleDeleteChart}
          disabled={!isOwner}
        />
      </Tooltip>
      <Divider />
      <Tooltip content="Settings">
        <Button icon="Settings" variant="ghost" disabled />
      </Tooltip>
    </TopBar.Item>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
