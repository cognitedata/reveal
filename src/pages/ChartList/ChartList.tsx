import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Icon,
  Input,
  Tabs,
  SegmentedControl,
  Select,
  toast,
} from '@cognite/cogs.js';
import { Chart } from 'models/chart/types';
import { useMyCharts, usePublicCharts, useUpdateChart } from 'hooks/firebase';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';
import { useNavigate } from 'hooks/navigation';
import ChartListItem, { ViewOption } from 'components/ChartListItem';
import { OpenInCharts } from 'components/OpenInCharts';
import { trackUsage } from 'services/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useResetRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { CHART_VERSION } from '../../config/config';

const defaultTranslations = makeDefaultTranslations(
  'Name',
  'Owner',
  'Updated',
  'Could not load charts',
  'Failed to load Operations',
  'Please reload the page',
  'New charts',
  'Filter charts',
  'My charts',
  'Public charts',
  'Sort by',
  'Preview',
  'New chart'
);

type ActiveTabOption = 'mine' | 'public';
type SortOptionValues = 'name' | 'owner' | 'updatedAt';
type SelectSortOption = { value: SortOptionValues; label: string };

const nameSorter = (a: Chart, b: Chart) => {
  return a.name.localeCompare(b.name);
};

const ownerSorter = (a: Chart, b: Chart) => {
  return a.user.localeCompare(b.user);
};

const updatedAtSorter = (a: Chart, b: Chart) => {
  if (!a.updatedAt && !b.updatedAt) return 0;
  if (!a.updatedAt) return 1;
  if (!b.updatedAt) return -1;
  return b.updatedAt - a.updatedAt;
};

const ChartList = () => {
  const move = useNavigate();
  const { data: login } = useUserInfo();
  const myCharts = useMyCharts();
  const pubCharts = usePublicCharts();
  const resetChart = useResetRecoilState(chartAtom);
  const [_isLoadingOperations, operationsError, _operations] =
    useAvailableOps();
  const [loading, setLoading] = useState(true);

  const { t, translationReady } = useTranslations(
    Object.keys(defaultTranslations),
    'ChartList'
  );
  const { t: listItemTranslations, translationReady: translationReady2 } =
    useTranslations(ChartListItem.translationKeys, 'ChartListItem');

  useEffect(() => {
    resetChart();
  }, [resetChart]);

  const allCharts = useMemo(() => {
    const mine = myCharts.data || [];
    const pub = pubCharts.data || [];

    return pub.concat(mine.filter((c) => !pub.find((pc) => c.id === pc.id)));
  }, [myCharts.data, pubCharts.data]);

  const error = myCharts.isError || pubCharts.isError;
  const sortOptions: SelectSortOption[] = [
    { value: 'name', label: t.Name },
    { value: 'owner', label: t.Owner },
    { value: 'updatedAt', label: t.Updated },
  ];

  const [filterText, setFilterText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTabOption>('mine');
  const [sortOption, setSortOption] = useState<SelectSortOption>(
    sortOptions[2]
  );
  const [viewOption, setViewOption] = useState<ViewOption>('list');

  useEffect(() => {
    trackUsage('PageView.ChartList');
  }, []);

  useEffect(() => {
    trackUsage('ChartList.TabChange', { tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    setLoading(
      (myCharts.isFetching && !myCharts.isFetched) ||
        (pubCharts.isFetching && !pubCharts.isFetched) ||
        !translationReady ||
        !translationReady2
    );
  }, [
    myCharts.isFetched,
    myCharts.isFetching,
    pubCharts.isFetched,
    pubCharts.isFetching,
    translationReady,
    translationReady2,
  ]);

  const { mutateAsync: updateChart } = useUpdateChart();

  const handleNewChart = async () => {
    if (!login?.id) {
      return;
    }
    const dateFrom = subDays(new Date(), 30);
    dateFrom.setHours(0, 0);
    const dateTo = new Date();
    dateTo.setHours(23, 59);
    const id = uuidv4();
    const newChart: Chart = {
      id,
      user: login?.id,
      userInfo: login,
      name: 'New chart',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timeSeriesCollection: [],
      workflowCollection: [],
      dateFrom: dateFrom.toJSON(),
      dateTo: dateTo.toJSON(),
      public: false,
      version: CHART_VERSION,
      settings: {
        showYAxis: true,
        showMinMax: false,
        showGridlines: true,
        mergeUnits: false,
      },
    };
    await updateChart(newChart);

    trackUsage('ChartList.CreateChart');
    move(`/${id}`);
  };

  const nameFilter = (chart: Chart) =>
    chart.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());

  const renderList = () => {
    let chartsToRender = allCharts;

    if (activeTab === 'mine') {
      // Filter to only show charts where the
      // current user is the owner. Remove this
      // filter when firebase security rules are
      // in place
      chartsToRender = myCharts.data || [];
    } else if (activeTab === 'public') {
      chartsToRender = pubCharts.data || [];
    }

    if (filterText) {
      chartsToRender = chartsToRender.filter(nameFilter);
    }

    if (sortOption.value === 'name') {
      chartsToRender.sort(nameSorter);
    } else if (sortOption.value === 'owner') {
      chartsToRender.sort(ownerSorter);
    } else {
      chartsToRender.sort(updatedAtSorter);
    }

    return chartsToRender.map((chart) => (
      <ChartListItem
        key={chart.id}
        chart={chart}
        view={viewOption}
        translations={listItemTranslations}
      />
    ));
  };

  const renderError = () => {
    return (
      <div>
        <p>{t['Could not load charts']}</p>
        <pre>{`${myCharts.error || pubCharts.error}`}</pre>
      </div>
    );
  };

  if (operationsError instanceof Error) {
    toast.error(
      <ErrorToast
        title={t['Failed to load Operations']}
        text={t['Please reload the page']}
      />,
      {
        autoClose: false,
        closeOnClick: false,
      }
    );
  }

  return (
    <div id="chart-list" style={{ padding: 16, width: '100%' }}>
      <div style={{ margin: 20 }}>
        <Button type="primary" icon="Add" onClick={handleNewChart}>
          {t['New chart']}
        </Button>
      </div>
      <div style={{ margin: 20 }}>
        <Input
          size="large"
          placeholder={t['Filter charts']}
          icon="Search"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      <div
        style={{ margin: 20, display: 'flex', justifyContent: 'space-between' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey as ActiveTabOption)}
        >
          <Tabs.TabPane key="mine" tab={<span>{t['My charts']}</span>} />
          <Tabs.TabPane key="public" tab={<span>{t['Public charts']}</span>} />
        </Tabs>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 200 }}>
            <Select
              title={`${t['Sort by']}:`}
              icon="ArrowDown"
              value={sortOption}
              placeholder={t.Updated}
              onChange={(option: SelectSortOption) => setSortOption(option)}
              options={sortOptions}
            />
          </div>
          <div style={{ marginLeft: 16 }}>
            <SegmentedControl
              currentKey={viewOption}
              onButtonClicked={(key) => setViewOption(key as ViewOption)}
            >
              <SegmentedControl.Button key="grid">
                <Icon type="Grid" />
              </SegmentedControl.Button>
              <SegmentedControl.Button key="list">
                <Icon type="List" />
              </SegmentedControl.Button>
            </SegmentedControl>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        {loading && <Icon type="Loader" />}
      </div>
      {viewOption === 'list' && (
        <ListHeader>
          <div style={{ width: 120 }}>{t.Preview}</div>
          <div style={{ width: '40%', marginLeft: 16 }}>{t.Name}</div>
          <div style={{ flexGrow: 1 }}>{t.Owner}</div>
          <div style={{ width: 127 }}>{t.Updated}</div>
        </ListHeader>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {error && renderError()}
        {!error && !loading && renderList()}
      </div>
      <OpenInCharts />
    </div>
  );
};

const ListHeader = styled.div`
  display: flex;
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  text-transform: uppercase;
  margin: 0 20px 10px 20px;
  padding: 0 16px;
`;

export default ChartList;
