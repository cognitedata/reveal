import React from 'react';
import { Button, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import { chartSelectors } from 'reducers/charts';
import { useParams } from 'react-router-dom';
import { Header } from './elements';

type ChartViewProps = {
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );

  if (!chart) {
    return (
      <div>This chart does not seem to exist. You might not have access</div>
    );
  }

  return (
    <div id="chart-view">
      <Header>
        <hgroup>
          <h1>{chart?.name}</h1>
          <h4>by Anon User</h4>
        </hgroup>
        <section className="actions">
          <Button
            icon="Checkmark"
            type="primary"
            onClick={() => {
              toast.success('Successfully saved nothing!');
            }}
          >
            Save
          </Button>
          <Button icon="Share" variant="ghost">
            Share
          </Button>
          <Button icon="Download" variant="ghost">
            Export
          </Button>
        </section>
      </Header>
    </div>
  );
};

export default ChartView;
