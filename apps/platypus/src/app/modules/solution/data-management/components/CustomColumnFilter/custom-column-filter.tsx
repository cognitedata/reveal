import { Component } from 'react';
import { IFilterOptionDef, IFilterParams } from 'ag-grid-community';
import { Button, Input, OptionType, Select } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import { gridConfigService } from '@cognite/cog-data-grid';
import { CustomFilterModel } from '@cognite/cog-data-grid-root/lib/types';

import {
  COL_TYPES_MAP,
  FILTER_OPTIONS_WITHOUT_INPUT,
  FILTER_OPTIONS_WITH_RANGE_INPUT,
  getFilterOptionLabel,
} from '../../utils';

import * as S from './elements';
import { DataModelTypeDefsField } from '@platypus/platypus-core';

type CustomColumnFilterState = {
  selectedField?: OptionType<DataModelTypeDefsField>;
  selectedFilterOption?: OptionType<string | IFilterOptionDef>;
  inputValue: string;
  rangeInput: {
    gte?: number;
    lte?: number;
  };
};

export class CustomColumnFilter extends Component<
  IFilterParams,
  CustomColumnFilterState
> {
  constructor(props: IFilterParams) {
    super(props);

    this.state = {
      selectedField: undefined,
      selectedFilterOption: undefined,
      inputValue: '',
      rangeInput: {},
    };
  }

  debouncedFilterCallback = debounce(
    () => this.props.filterChangedCallback(),
    500
  );

  isFilterActive() {
    return (
      (!!this.state.selectedField &&
        !!this.state.selectedFilterOption &&
        (!!this.state.inputValue ||
          (this.state.rangeInput.gte !== undefined &&
            this.state.rangeInput.lte !== undefined))) ||
      (!!this.state.selectedField &&
        !this.doesSelectedFilterOptionRequireUserInput() &&
        !this.doesSelectedFilterOptionRequireRangeInput() &&
        !this.state.inputValue)
    );
  }

  getModel() {
    if (
      !this.isFilterActive() ||
      !this.state.selectedField ||
      !this.state.selectedField.value ||
      !this.state.selectedFilterOption?.value
    ) {
      return null;
    }

    const selectedFilterOptionValue =
      typeof this.state.selectedFilterOption.value === 'string'
        ? this.state.selectedFilterOption.value
        : this.state.selectedFilterOption.value!.displayKey;

    const model = {
      filter: {
        [this.state.selectedField.label]: {
          [selectedFilterOptionValue as string]:
            this.doesSelectedFilterOptionRequireRangeInput()
              ? this.state.rangeInput
              : this.state.inputValue,
        },
      },
      filterType: this.state.selectedField.label,
      type: selectedFilterOptionValue,
      filterTo: this.state.selectedField.value.type.name,
    } as CustomFilterModel;

    return model;
  }

  doesSelectedFilterOptionRequireUserInput() {
    return (
      this.state.selectedFilterOption &&
      !FILTER_OPTIONS_WITHOUT_INPUT.includes(
        (typeof this.state.selectedFilterOption.value === 'string'
          ? this.state.selectedFilterOption.value
          : this.state.selectedFilterOption.value?.displayName) || ''
      )
    );
  }

  doesSelectedFilterOptionRequireRangeInput() {
    return (
      this.state.selectedFilterOption &&
      FILTER_OPTIONS_WITH_RANGE_INPUT.includes(
        this.state.selectedFilterOption.label
      )
    );
  }

  render() {
    const columnName = this.props.colDef.field;
    const columnTypeName = this.props.context.dataModelType.fields.find(
      (field: { name: string | undefined }) => field.name === columnName
    ).type.name;
    const columnCustomFields = this.props.context.dataModelTypeDefs.types.find(
      (type: { name: any }) => type.name === columnTypeName
    ).fields;

    const fieldOptions = columnCustomFields
      .filter((field: any) => !field.type.custom)
      .map((field: any) => ({
        label: field.name,
        value: field,
      }));

    const selectedFieldType =
      this.state.selectedField?.value &&
      COL_TYPES_MAP[this.state.selectedField.value.type.name];

    const filterOptions: OptionType<string | IFilterOptionDef>[] =
      gridConfigService
        .getFilterParams(selectedFieldType || '')
        .filterParams.filterOptions.map((option: string | any) => ({
          label:
            typeof option === 'string'
              ? getFilterOptionLabel(option)
              : option.displayName,
          value: option,
        }));

    return (
      <S.CustomColumnFilter>
        <Select<(typeof columnCustomFields)[0]>
          className="ag-custom-component-popup"
          options={fieldOptions}
          onChange={(option: OptionType<(typeof columnCustomFields)[0]>) => {
            this.setState({
              inputValue: '',
              selectedField: option,
              selectedFilterOption: undefined,
            });
          }}
          value={this.state.selectedField}
          placeholder={this.props.context.t(
            'custom-filter-select-field-dropdown',
            'Select field...'
          )}
        />
        <Select<string | IFilterOptionDef>
          className="ag-custom-component-popup"
          disabled={!this.state.selectedField}
          options={filterOptions}
          onChange={(option: OptionType<string | IFilterOptionDef>) => {
            this.setState(
              {
                selectedFilterOption: option,
              },
              () => {
                // if option doesn't require input, filter
                if (
                  !this.doesSelectedFilterOptionRequireUserInput() &&
                  !this.doesSelectedFilterOptionRequireRangeInput()
                ) {
                  this.props.filterChangedCallback();
                }
              }
            );
          }}
          value={this.state.selectedFilterOption}
          placeholder={this.props.context.t(
            'custom-filter-select-filter-options',
            'Filter options...'
          )}
        />
        {this.doesSelectedFilterOptionRequireUserInput() &&
          !this.doesSelectedFilterOptionRequireRangeInput() && (
            <Input
              key="custom-filter-input"
              disabled={!this.state.selectedFilterOption}
              onChange={(e) => {
                this.setState(
                  {
                    inputValue: e.target.value,
                  },
                  () => {
                    this.debouncedFilterCallback();
                  }
                );
              }}
              placeholder={this.props.context.t(
                'custom-filter-select-filter-input',
                'Filter value...'
              )}
              value={this.state.inputValue}
            />
          )}
        {this.doesSelectedFilterOptionRequireRangeInput() && (
          <>
            <Input
              key="custom-filter-range-input-from"
              disabled={!this.state.selectedFilterOption}
              onChange={(e) => {
                this.setState(
                  (prevState) => {
                    return {
                      rangeInput: {
                        lte: prevState.rangeInput.lte,
                        gte: Number(e.target.value),
                      },
                    };
                  },
                  () => {
                    if (
                      this.state.rangeInput.gte !== undefined &&
                      this.state.rangeInput.lte !== undefined
                    ) {
                      this.debouncedFilterCallback();
                    }
                  }
                );
              }}
              placeholder={this.props.context.t(
                'custom-filter-select-range-from',
                'From...'
              )}
              type="number"
              value={this.state.rangeInput.gte}
            />
            <Input
              key="custom-filter-range-input-to"
              disabled={!this.state.selectedFilterOption}
              onChange={(e) => {
                this.setState(
                  (prevState) => {
                    return {
                      rangeInput: {
                        gte: prevState.rangeInput.gte,
                        lte: Number(e.target.value),
                      },
                    };
                  },
                  () => {
                    if (
                      this.state.rangeInput.gte !== undefined &&
                      this.state.rangeInput.lte !== undefined
                    ) {
                      this.debouncedFilterCallback();
                    }
                  }
                );
              }}
              placeholder={this.props.context.t(
                'custom-filter-select-range-to',
                'To...'
              )}
              type="number"
              value={this.state.rangeInput.lte}
            />
          </>
        )}
        <Button
          onClick={() => {
            // we only want to call filterChangedCallback if there was a filter set
            const isFiltered = !!this.getModel();

            this.setState(
              {
                selectedField: undefined,
                selectedFilterOption: undefined,
                rangeInput: {},
                inputValue: '',
              },
              () => {
                if (isFiltered) {
                  this.props.filterChangedCallback();
                }
              }
            );
          }}
        >
          {this.props.context.t('custom-filter-reset-button', 'Reset')}
        </Button>
      </S.CustomColumnFilter>
    );
  }
}
