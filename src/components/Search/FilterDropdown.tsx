import { Checkbox, Menu, Select, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';

export const defaultTranslations = makeDefaultTranslations(
  'Filters',
  'Show empty equipment tags',
  'Types of data',
  'Time series',
  'Step time series',
  'String time series',
  'String time series are currently not supported',
  'Facility'
);

export type SearchFilterSettings = {
  isShowEmptyChecked: boolean;
  isTimeseriesChecked: boolean;
  isStepChecked?: boolean;
  isStringChecked: boolean;
};

type FilterDropdownProps = {
  availableFacilities: Asset[];
  selectedFacility?: string;
  settings: SearchFilterSettings;
  onFilterChange: (field: string, val?: boolean) => void;
  onFacilityChange: (facilityExternalId: string) => void;
  translations?: typeof defaultTranslations;
};

const FilterDropdown = ({
  availableFacilities,
  selectedFacility,
  settings,
  onFilterChange,
  onFacilityChange,
  translations,
}: FilterDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };

  const facilityOptions: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    ...availableFacilities.map((facility) => ({
      value: facility.externalId!,
      label: facility.name,
    })),
  ];

  const selectedFacilityOption =
    facilityOptions.find((facility) => facility.value === selectedFacility) ||
    facilityOptions[0];

  return (
    <FilterMenu>
      <Menu.Header>{t.Facility}</Menu.Header>
      <Select
        value={selectedFacilityOption}
        options={facilityOptions}
        onChange={({ value }: { label: string; value: string }) =>
          onFacilityChange(value)
        }
      />
      <Spacing height={8} />
      <Menu.Divider />
      <Menu.Header>{t.Filters}</Menu.Header>
      <Checkbox
        name="showEmpty"
        defaultChecked={settings.isShowEmptyChecked}
        onChange={(val) => onFilterChange('isShowEmptyChecked', val)}
      >
        {t['Show empty equipment tags']}
      </Checkbox>
      <Menu.Divider />
      <Menu.Header>{t['Types of data']}</Menu.Header>
      <Checkbox
        name="ts"
        defaultChecked={settings.isTimeseriesChecked}
        onChange={(val) => onFilterChange('isTimeseriesChecked', val)}
      >
        {t['Time series']}
      </Checkbox>
      <Checkbox
        name="step"
        defaultChecked={settings.isStepChecked}
        onChange={(val) => onFilterChange('isStepChecked', val || undefined)}
      >
        {t['Step time series']}
      </Checkbox>
      <Tooltip content={t['String time series are currently not supported']}>
        <Checkbox name="string" disabled>
          {t['String time series']}
        </Checkbox>
      </Tooltip>
    </FilterMenu>
  );
};

const Spacing = styled.div<{ height: number }>`
  height: ${(props) => (props.height ? props.height : 0)}px;
`;

const FilterMenu = styled(Menu)`
  .cogs-checkbox {
    margin: 5px 10px;

    &.disabled {
      color: var(--cogs-greyscale-grey5);
    }
  }
`;

export default FilterDropdown;
