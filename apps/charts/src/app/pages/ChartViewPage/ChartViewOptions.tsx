import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Switch,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';

import { DropdownTitle, DropdownWrapper } from './elements';

type Props = {
  stackedMode: boolean;
  setStackedMode: (diff: boolean) => void;
  showYAxis: boolean;
  showMinMax: boolean;
  showGridlines: boolean;
  mergeUnits: boolean;
  handleSettingsToggle: (str: string, val: boolean) => void;
  translations?: typeof defaultTranslations;
};

const CHART_SETTINGS_KEYS = {
  SHOW_Y_AXIS: 'showYAxis',
  SHOW_MIN_MAX: 'showMinMax',
  SHOW_GRIDLINES: 'showGridlines',
  MERGE_UNITS: 'mergeUnits',
};

const defaultTranslations = makeDefaultTranslations(
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

const ChartViewOptions = ({
  stackedMode,
  showYAxis,
  showMinMax,
  showGridlines,
  mergeUnits,
  handleSettingsToggle,
  setStackedMode,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ChartView').t,
  };

  return (
    <>
      <Tooltip
        content={`${showGridlines ? t['Hide gridlines'] : t['Show gridlines']}`}
      >
        <Button
          icon="GridLines"
          type={showGridlines ? 'ghost-accent' : 'ghost'}
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
          type={showMinMax ? 'ghost-accent' : 'ghost'}
          aria-label="view"
          onClick={() =>
            handleSettingsToggle(CHART_SETTINGS_KEYS.SHOW_MIN_MAX, !showMinMax)
          }
          style={{ marginLeft: 4 }}
        />
      </Tooltip>
      <Tooltip content={t['Y axes']} position="top">
        <Dropdown
          content={
            <Menu>
              <DropdownWrapper>
                <DropdownTitle>{t['Y axis']}</DropdownTitle>
                <Switch
                  name="toggleYAxis"
                  checked={showYAxis}
                  onChange={() =>
                    handleSettingsToggle(
                      CHART_SETTINGS_KEYS.SHOW_Y_AXIS,
                      !showYAxis
                    )
                  }
                  label={t['Show Y axes']}
                  style={{ marginBottom: 15 }}
                />

                <Switch
                  name="toggleUnitMerging"
                  checked={mergeUnits}
                  onChange={() =>
                    handleSettingsToggle(
                      CHART_SETTINGS_KEYS.MERGE_UNITS,
                      !mergeUnits
                    )
                  }
                  label={t['Merge units']}
                />
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
          type={stackedMode ? 'ghost-accent' : 'ghost'}
          onClick={() => setStackedMode(!stackedMode)}
          aria-label="view"
          style={{ marginLeft: 4 }}
        />
      </Tooltip>
    </>
  );
};

export default ChartViewOptions;
