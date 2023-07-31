import { useState } from 'react';
import { Button, Drawer, Input } from '@cognite/cogs.js';
import { CogniteClient, Timeseries } from '@cognite/sdk';
import debounce from 'lodash/debounce';

type TimeSeriesSearchSidebarProps = {
  visible: boolean;
  onClose: () => void;
  onAddTimeSeries: (timeSeries: Timeseries) => void;
  client: CogniteClient;
};

const TimeSeriesSearchSidebar = ({
  visible,
  onClose,
  onAddTimeSeries,
  client,
}: TimeSeriesSearchSidebarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Timeseries[]>([]);

  const onSearch = async (query: string) => {
    const results = await client.timeseries.search({
      search: {
        name: query,
      },
      limit: 20,
    });
    setResults(results);
  };

  const debouncedSearch = debounce(onSearch, 500);

  const onQuery = (query: string) => {
    setQuery(query);
    debouncedSearch(query);
  };

  const onTimeseriesClick = async (timeSeries: Timeseries) => {
    onAddTimeSeries(timeSeries);
  };

  const renderResults = () => {
    if (!query) {
      return null;
    }
    if (results.length <= 0) {
      return <div>No results</div>;
    }

    return results.map((timeseries) => (
      <div key={timeseries.id} style={{ width: '100%', marginBottom: 8 }}>
        <Button onClick={() => onTimeseriesClick(timeseries)} block>
          {timeseries.name}
        </Button>
      </div>
    ));
  };

  return (
    <Drawer
      visible={visible}
      footer={null}
      width={360}
      onClose={() => onClose()}
      title="Add a Timeseries from CDF"
    >
      <Input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        style={{ width: '100%' }}
      />
      {renderResults()}
    </Drawer>
  );
};

export default TimeSeriesSearchSidebar;
