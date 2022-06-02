/**
 * ChartView Header
 */

import {
  Button,
  Icon,
  Tooltip,
  Dropdown,
  Menu,
  Switch,
} from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Elements } from 'react-flow-renderer';
import { useIsChartOwner } from 'hooks/user';

import {
  NodeDataDehydratedVariants,
  NodeTypes,
} from 'components/NodeEditor/V2/types';

import DateRangeSelector from 'components/DateRangeSelector';
import TimePeriodSelector from 'components/TimePeriodSelector/TimePeriodSelector';
import { Chart, ChartWorkflowV2 } from 'models/chart/types';
import { trackUsage } from 'services/metrics';
import { getEntryColor } from 'utils/colors';

import { addWorkflow } from 'models/chart/updates';
import { SetterOrUpdater } from 'recoil';
import { makeDefaultTranslations } from 'utils/translations';
import {
  Header,
  WarningAlert,
  Divider,
  DropdownTitle,
  DropdownWrapper,
  RangeWrapper,
  RangeColumn,
  MenuItemText,
} from './elements';

const CHART_SETTINGS_KEYS = {
  SHOW_Y_AXIS: 'showYAxis',
  SHOW_MIN_MAX: 'showMinMax',
  SHOW_GRIDLINES: 'showGridlines',
  MERGE_UNITS: 'mergeUnits',
};

const defaultTranslations = makeDefaultTranslations(
  'Add time series',
  'Add calculation',
  'Imports',
  'Import calculations',
  'View only. Duplicate to edit.',
  'Hide gridlines',
  'Show gridlines',
  'Hide min/max',
  'Show min/max',
  'Y axes',
  'Y axis',
  'Show Y axes',
  'Merge units',
  'Disable stacking',
  'Enable stacking'
);

type Props = {
  chart: Chart;
  stackedMode: boolean;
  showSearch: boolean;
  showYAxis: boolean;
  showMinMax: boolean;
  showGridlines: boolean;
  mergeUnits: boolean;
  setChart: SetterOrUpdater<Chart | undefined>;
  setStackedMode: (diff: boolean) => void;
  setShowSearch: (diff: boolean) => void;
  openNodeEditor: () => void;
  openFileSelector: () => void;
  setSelectedSourceId: (diff: string) => void;
  translations?: typeof defaultTranslations;
};

const ChartViewHeader = ({
  chart,
  showSearch,
  stackedMode,
  showYAxis,
  showMinMax,
  showGridlines,
  mergeUnits,
  setChart,
  setStackedMode,
  setShowSearch,
  openNodeEditor,
  openFileSelector,
  setSelectedSourceId,
  translations,
}: Props) => {
  const { data: login } = useUserInfo();
  const isChartOwner = useIsChartOwner(chart);
  const t = { ...defaultTranslations, ...translations };

  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
    trackUsage('ChartView.OpenSearch');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }, [setShowSearch]);

  const handleSettingsToggle = useCallback(
    (key: string, value: boolean) => {
      setChart((oldChart) => ({
        ...oldChart!,
        settings: {
          showYAxis,
          showMinMax,
          showGridlines,
          mergeUnits,
          [key]: value,
        },
      }));
    },
    [mergeUnits, setChart, showGridlines, showMinMax, showYAxis]
  );

  const handleClickNewWorkflow = useCallback(() => {
    if (!chart) {
      return;
    }

    const newWorkflowId = uuidv4();

    /**
     * The current template is just an output node
     * that's added for you (but it could be anything!)
     */
    const elementsTemplate: Elements<NodeDataDehydratedVariants> = [
      {
        id: uuidv4(),
        type: NodeTypes.OUTPUT,
        position: { x: 400, y: 150 },
      },
    ];

    const newWorkflow: ChartWorkflowV2 = {
      version: 'v2',
      id: newWorkflowId,
      name: 'New Calculation',
      color: getEntryColor(chart.id, newWorkflowId),
      flow: {
        elements: elementsTemplate,
        position: [0, 0],
        zoom: 1,
      },
      lineWeight: 1,
      lineStyle: 'solid',
      enabled: true,
      createdAt: Date.now(),
      unit: '',
      preferredUnit: '',
      settings: { autoAlign: true },
    };

    setChart((oldChart) => addWorkflow(oldChart!, newWorkflow));
    setSelectedSourceId(newWorkflowId);
    openNodeEditor();
    trackUsage('ChartView.AddCalculation');
  }, [chart, setChart, openNodeEditor, setSelectedSourceId]);

  const handleImportCalculationsClick = useCallback(async () => {
    openFileSelector();
  }, [openFileSelector]);

  return (
    <Header className="downloadChartHide">
      <section className="actions">
        {!showSearch && (
          <Button icon="Add" type="primary" onClick={handleOpenSearch}>
            {t['Add time series']}
          </Button>
        )}
        <Button icon="Function" type="ghost" onClick={handleClickNewWorkflow}>
          {t['Add calculation']}
        </Button>
        <Dropdown
          content={
            <Menu>
              <Menu.Header>{t.Imports}</Menu.Header>
              <Menu.Item
                appendIcon="Function"
                onClick={handleImportCalculationsClick}
              >
                <MenuItemText>{t['Import calculations']}</MenuItemText>
              </Menu.Item>
            </Menu>
          }
        >
          <Button
            icon="EllipsisHorizontal"
            type="ghost"
            aria-label="view"
            style={{ paddingRight: 8, marginLeft: 4 }}
          />
        </Dropdown>
      </section>
      {login?.id && !isChartOwner && (
        <section>
          <WarningAlert
            type="warning"
            message={t['View only. Duplicate to edit.']}
            icon={<Icon type="Info" />}
            showIcon
          />
        </section>
      )}
      <section className="daterange">
        <Tooltip
          content={`${
            showGridlines ? t['Hide gridlines'] : t['Show gridlines']
          }`}
        >
          <Button
            icon="GridLines"
            type={showGridlines ? 'link' : 'ghost'}
            aria-label="view"
            onClick={() =>
              handleSettingsToggle(
                CHART_SETTINGS_KEYS.SHOW_GRIDLINES,
                !showGridlines
              )
            }
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Tooltip
          content={`${showMinMax ? t['Hide min/max'] : t['Show min/max']}`}
        >
          <Button
            icon="Timeseries"
            type={showMinMax ? 'link' : 'ghost'}
            aria-label="view"
            onClick={() =>
              handleSettingsToggle(
                CHART_SETTINGS_KEYS.SHOW_MIN_MAX,
                !showMinMax
              )
            }
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Tooltip content={t['Y axes']}>
          <Dropdown
            content={
              <Menu>
                <DropdownWrapper>
                  <DropdownTitle>{t['Y axis']}</DropdownTitle>
                  <Switch
                    name="toggleYAxis"
                    value={showYAxis}
                    onChange={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.SHOW_Y_AXIS,
                        !showYAxis
                      )
                    }
                    style={{ marginBottom: 15 }}
                  >
                    {t['Show Y axes']}
                  </Switch>
                  <Switch
                    name="toggleUnitMerging"
                    value={mergeUnits}
                    onChange={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.MERGE_UNITS,
                        !mergeUnits
                      )
                    }
                  >
                    {t['Merge units']}
                  </Switch>
                </DropdownWrapper>
              </Menu>
            }
          >
            <>
              <Button
                icon="YAxis"
                type="ghost"
                aria-label="view"
                style={{ paddingRight: 8, marginLeft: 4 }}
              >
                <Icon type="CaretDown" />
              </Button>
            </>
          </Dropdown>
        </Tooltip>
        <Tooltip
          content={`${
            stackedMode ? t['Disable stacking'] : t['Enable stacking']
          }`}
        >
          <Button
            icon="StackedChart"
            type={stackedMode ? 'link' : 'ghost'}
            onClick={() => setStackedMode(!stackedMode)}
            aria-label="view"
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Divider />
        <RangeWrapper>
          <RangeColumn>
            <TimePeriodSelector />
          </RangeColumn>
          <RangeColumn>
            <DateRangeSelector />
          </RangeColumn>
        </RangeWrapper>
      </section>
    </Header>
  );
};

ChartViewHeader.translationKeys = Object.keys(defaultTranslations);
export default ChartViewHeader;
