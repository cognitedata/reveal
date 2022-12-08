import { Dropdown, Menu, Detail } from '@cognite/cogs.js';
import { useState } from 'react';
import {
  BenchmarkingTypeFilterButton,
  BenchmarkingTypeFilterDropdown,
  MenuItem,
} from 'components/BenchmarkingTypeFilter/elements';
import { BenchmarkingWaterCourses } from '@cognite/power-ops-api-types';
import { BenchmarkingTypeOption as BenchmarkingTypeFilterOption } from 'types';

type Props = {
  value: BenchmarkingTypeFilterOption | undefined;
  filterOptions: BenchmarkingWaterCourses['methods'];
  onChange: (value: BenchmarkingTypeFilterOption) => void;
};

export const BenchmarkingTypeSelect = ({
  value,
  filterOptions,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [dropDownInstance, setDropDownInstance] = useState<any>();

  return (
    <BenchmarkingTypeFilterDropdown>
      <Dropdown
        className="benchmarking-type-dropdown"
        onClickOutside={() => {
          dropDownInstance?.hide();
        }}
        onMount={(instance) => {
          setDropDownInstance(instance);
        }}
        onHide={() => setOpen(false)}
        content={
          <Menu
            onClick={() => {
              setOpen(!open);
              dropDownInstance?.hide();
            }}
            style={{ marginTop: '8px' }}
          >
            <Menu.Item
              selected={value === 'absolute'}
              onClick={() => onChange('absolute')}
              appendIcon={value === 'absolute' ? 'Checkmark' : undefined}
            >
              Absolute
            </Menu.Item>
            <Menu.Submenu
              content={
                <Menu>
                  <Detail>Baseline method</Detail>
                  {filterOptions.map((method) => {
                    return (
                      <Menu.Item
                        selected={value === method.value}
                        key={method.value}
                        appendIcon={
                          value === method.value ? 'Checkmark' : undefined
                        }
                        onClick={() => onChange(method.value)}
                      >
                        {method.label}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
            >
              <MenuItem
                aria-selected={value !== 'absolute'}
                aria-label="Difference"
              >
                <div>
                  Difference
                  {value !== 'absolute' && (
                    <p>
                      {filterOptions.find((method) => method.label === value)
                        ?.label || value}
                    </p>
                  )}
                </div>
              </MenuItem>
            </Menu.Submenu>
          </Menu>
        }
      >
        <BenchmarkingTypeFilterButton
          data-testid="benchmarking-type-button"
          className="benchmarking-type-button"
          type={open ? 'tertiary' : 'secondary'}
          onClick={() => setOpen(!open)}
          icon={open ? 'ChevronUp' : 'ChevronDown'}
          iconPlacement="right"
          aria-label="Type"
        >
          <div>
            <strong>Type:&nbsp;</strong>
            <span className="type-text">
              {value !== 'absolute' ? `Difference - ${value}` : 'Absolute'}
            </span>
          </div>
        </BenchmarkingTypeFilterButton>
      </Dropdown>
    </BenchmarkingTypeFilterDropdown>
  );
};
