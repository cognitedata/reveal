import React from 'react';
import styled from 'styled-components/macro';
import { Link, useHistory } from 'react-router-dom';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';

import thumb from 'assets/thumb.png';
import { useDeleteChart, useUpdateChart } from 'hooks/firebase';
import { nanoid } from 'nanoid';
import { useLoginStatus } from 'hooks';
import { duplicate } from 'utils/charts';

export type ViewOption = 'list' | 'grid';

const formatOwner = (email: string) => email.split('@')[0];

interface ChartListItemProps {
  chart: Chart;
  view: ViewOption;
}

const ChartListItem = ({ chart, view }: ChartListItemProps) => {
  const history = useHistory();
  const { data: login } = useLoginStatus();
  const { mutateAsync: updateChart } = useUpdateChart();
  const { mutate: deleteChart } = useDeleteChart();

  const handleRenameChart = () => {
    // eslint-disable-next-line no-alert
    const name = prompt('Rename chart', chart.name) || chart.name;
    updateChart({ chart: { ...chart, name } });
  };

  const handleDeleteChart = () => {
    deleteChart(chart.id);
  };

  const handleDuplicateChart = () => {
    if (login?.user) {
      const newChart = duplicate(chart, login.user);
      updateChart({ chart: newChart }).then(() =>
        history.push(`/${newChart.id}`)
      );
    }
  };

  const mockPreview = (
    <img
      style={{
        width: '100%',
        border: '1px solid #ddd',
      }}
      src={thumb}
      alt={chart.name}
    />
  );

  const dropdownMenu = (
    <Dropdown
      content={
        <Menu>
          <Menu.Header>
            <span style={{ wordBreak: 'break-word' }}>{chart.name}</span>
          </Menu.Header>
          <Menu.Item onClick={() => handleRenameChart()} appendIcon="Edit">
            <span>Rename</span>
          </Menu.Item>
          <Menu.Item onClick={() => handleDeleteChart()} appendIcon="Delete">
            <span>Delete</span>
          </Menu.Item>
          <Menu.Item
            onClick={() => handleDuplicateChart()}
            appendIcon="Duplicate"
          >
            <span>Duplicate</span>
          </Menu.Item>
        </Menu>
      }
    >
      <Button variant="ghost" icon="VerticalEllipsis" />
    </Dropdown>
  );

  if (view === 'list') {
    return (
      <ListViewWrapper>
        <ListViewLink to={`/${chart.id}`}>
          <ListViewImage>{mockPreview}</ListViewImage>
          <ListViewName>{chart.name}</ListViewName>
          <ListViewOwner>{formatOwner(chart.user)}</ListViewOwner>
        </ListViewLink>
        <div>{dropdownMenu}</div>
      </ListViewWrapper>
    );
  }

  return (
    <GridViewWrapper>
      <Link to={`/${chart.id}`}>
        <div>{mockPreview}</div>
      </Link>
      <GridViewFooter>
        <GridViewLink to={`/${chart.id}`}>
          <GridViewOwner>{formatOwner(chart.user)}</GridViewOwner>
          <GridViewName>{chart.name}</GridViewName>
        </GridViewLink>
        <div>{dropdownMenu}</div>
      </GridViewFooter>
    </GridViewWrapper>
  );
};

const ListViewWrapper = styled.div`
  width: 100%;
  margin: 0 20px 20px 20px;
  padding: 16px;
  border: 1px solid #dedede;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const ListViewLink = styled(Link)`
  flex-grow: 1;
  display: flex;
  align-items: center;
  color: var(--cogs-text-color);
  &:hover {
    color: var(--cogs-text-color);
  }
`;

const ListViewImage = styled.div`
  width: 100px;
  flex-grow: 0;
`;

const ListViewName = styled.div`
  width: 40%;
  margin-left: 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--cogs-text-color);
`;

const ListViewOwner = styled.div`
  flex-grow: 1;
  margin-left: 16px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
`;

const GridViewWrapper = styled.div`
  width: calc(25% - 40px);
  margin: 20px;
  padding: 16px;
  border: 1px solid #dedede;
  border-radius: 4px;
`;

const GridViewFooter = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
`;

const GridViewLink = styled(Link)`
  flex-grow: 1;
  color: var(--cogs-text-color);
  &:hover {
    color: var(--cogs-text-color);
  }
`;

const GridViewOwner = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
`;

const GridViewName = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--cogs-text-color);
`;

export default ChartListItem;
