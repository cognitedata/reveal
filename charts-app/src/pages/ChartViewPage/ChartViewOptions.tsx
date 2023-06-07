import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Switch,
  Tooltip,
} from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
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
  translations,
  setStackedMode,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <>
      <Tooltip
        content={`${showGridlines ? t['Hide gridlines'] : t['Show gridlines']}`}
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
            handleSettingsToggle(CHART_SETTINGS_KEYS.SHOW_MIN_MAX, !showMinMax)
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
    </>
  );
};

export default ChartViewOptions;
