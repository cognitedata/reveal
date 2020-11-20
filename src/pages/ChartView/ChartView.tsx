import React, { useEffect, useState } from 'react';
import { Button, Icon, toast } from '@cognite/cogs.js';
import useSelector from 'hooks/useSelector';
import { chartSelectors } from 'reducers/charts';
import { useParams } from 'react-router-dom';
import NodeEditor from 'components/NodeEditor';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import useDispatch from 'hooks/useDispatch';
import {
  fetchWorkflowsForChart,
  createNewWorkflow,
} from 'reducers/workflows/api';
import useEnsureData from 'hooks/useEnsureData';
import searchSlice from 'reducers/search';
import collectionsSlice from 'reducers/collections';
import { saveExistingChart } from 'reducers/charts/api';
import ChartComponent from 'components/Chart';
import {
  Header,
  TopPaneWrapper,
  BottomPaneWrapper,
  ChartViewContainer,
  ToolbarWrapper,
  ContentWrapper,
  ToolbarItem,
  ToolbarIcon,
  ChartContainer,
  SourceListWrapper,
  SourcesTitle,
  SourceList,
  SourceButtonContainer,
  SourceItem,
  SourceCircle,
  ChartWrapper,
} from './elements';

type ChartViewProps = {
  chartId?: string;
};

const ChartView = ({ chartId: propsChartId }: ChartViewProps) => {
  const hasData = useEnsureData();
  const dispatch = useDispatch();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>();
  const { chartId = propsChartId } = useParams<{ chartId: string }>();
  const chart = useSelector((state) =>
    chartSelectors.selectById(state, String(chartId))
  );

  useEffect(() => {
    if (chart?.workflowIds) {
      dispatch(fetchWorkflowsForChart(chart?.workflowIds));
      // Run the existing workflows here
    }
  }, [chart?.id]);

  useEffect(() => {
    if (chart) {
      dispatch(searchSlice.actions.setActiveChartId(chart.id));
    }
  }, [chart?.id]);

  const onNewWorkflow = () => {
    if (chart) {
      dispatch(createNewWorkflow(chart));
    }
  };

  const handleClickSearch = () => {
    dispatch(searchSlice.actions.showSearch());
  };

  const handleClickCollections = () => {
    dispatch(collectionsSlice.actions.showCollections());
  };

  const handleClickSave = async () => {
    if (chart) {
      try {
        await dispatch(saveExistingChart(chart));
        toast.success('Successfully saved nothing!');
      } catch (e) {
        toast.error('Unable to save - try again!');
      }
    }
  };

  if (!hasData) {
    return <Icon type="Loading" />;
  }

  if (!chart) {
    return (
      <div>This chart does not seem to exist. You might not have access</div>
    );
  }

  const timeseriesItems = chart.timeSeriesIds?.map((timeseriesId) => {
    return (
      <SourceItem>
        <SourceCircle />
        {timeseriesId}
      </SourceItem>
    );
  });

  const workflowItems = chart.workflowIds?.map((workflowId) => {
    return (
      <SourceItem onClick={() => setActiveWorkflowId(workflowId)}>
        <SourceCircle />
        {workflowId}
      </SourceItem>
    );
  });

  return (
    <ChartViewContainer id="chart-view">
      <ContentWrapper>
        <Header>
          <hgroup>
            <h1>{chart?.name}</h1>
            <h4>by {chart?.user}</h4>
          </hgroup>
          <section className="actions">
            <Button
              icon="Checkmark"
              type="primary"
              onClick={() => handleClickSave()}
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
        <ChartContainer>
          <ToolbarWrapper>
            <ToolbarItem onClick={() => handleClickSearch()}>
              <ToolbarIcon type="Search" />
            </ToolbarItem>
            <ToolbarItem onClick={() => handleClickCollections()}>
              <ToolbarIcon type="Folder" />
            </ToolbarItem>
          </ToolbarWrapper>
          <SourceListWrapper>
            <SourcesTitle>Time Series</SourcesTitle>
            <SourceList>{timeseriesItems}</SourceList>
            <SourceButtonContainer>
              <Button
                onClick={() => handleClickSearch()}
                icon="Plus"
                iconPlacement="right"
              >
                Add
              </Button>
            </SourceButtonContainer>
            <SourcesTitle>Workflows</SourcesTitle>
            <SourceList>{workflowItems}</SourceList>
            <SourceButtonContainer>
              <Button
                onClick={() => onNewWorkflow()}
                icon="Plus"
                iconPlacement="right"
              >
                Create
              </Button>
            </SourceButtonContainer>
          </SourceListWrapper>
          <SplitPaneLayout>
            <TopPaneWrapper className="chart">
              <ChartWrapper>
                <ChartComponent chart={chart} />
              </ChartWrapper>
            </TopPaneWrapper>
            <BottomPaneWrapper className="table">
              <NodeEditor workflowId={activeWorkflowId} />
            </BottomPaneWrapper>
          </SplitPaneLayout>
        </ChartContainer>
      </ContentWrapper>
    </ChartViewContainer>
  );
};

export default ChartView;
