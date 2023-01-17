import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  ChangeEvent,
  useMemo,
} from 'react';
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
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const CustomColumnFilter = forwardRef((props: IFilterParams, ref) => {
  const { t } = useTranslation('CustomColumnFilter');

  const columnName = props.colDef.field;
  const columnTypeName = props.context.dataModelType.fields.find(
    (field: { name: string | undefined }) => field.name === columnName
  ).type.name;
  const columnCustomFields = props.context.dataModelTypeDefs.types.find(
    (type: { name: any }) => type.name === columnTypeName
  ).fields;

  const [selectedField, setSelectedField] = useState<
    OptionType<(typeof columnCustomFields)[0]> | undefined
  >();
  const [selectedFilterOption, setSelectedFilterOption] = useState<
    OptionType<string | IFilterOptionDef> | undefined
  >();

  const [input, setInput] = useState<string>();
  const onInputChange = useMemo(
    () =>
      debounce((e) => {
        setInput(e.target.value);
      }, 500),
    []
  );

  const [rangeInput, setRangeInput] = useState<{
    gte?: number;
    lte?: number;
  }>({});
  const onRangeInputFromChange = useMemo(
    () =>
      debounce((e: ChangeEvent<HTMLInputElement>) => {
        setRangeInput(({ lte }) => ({ lte, gte: Number(e.target.value) }));
      }, 500),
    []
  );
  const onRangeInputToChange = useMemo(
    () =>
      debounce((e: ChangeEvent<HTMLInputElement>) => {
        setRangeInput(({ gte }) => ({ gte, lte: Number(e.target.value) }));
      }, 500),
    []
  );

  const fieldOptions = columnCustomFields
    .filter((field: any) => !field.type.custom)
    .map((field: any) => ({
      label: field.name,
      value: field,
    }));

  const selectedFieldType = COL_TYPES_MAP[
    selectedField?.value.type.name
  ] as string;

  const filterOptions: OptionType<string | IFilterOptionDef>[] =
    gridConfigService
      .getFilterParams(selectedFieldType)
      .filterParams.filterOptions.map((option: string | any) => ({
        label:
          typeof option === 'string'
            ? getFilterOptionLabel(option)
            : option.displayName,
        value: option,
      }));

  const doesSelectedFilterOptionRequireRangeInput =
    selectedFilterOption &&
    FILTER_OPTIONS_WITH_RANGE_INPUT.includes(selectedFilterOption.label);

  const doesSelectedFilterOptionRequireUserInput =
    selectedFilterOption &&
    !FILTER_OPTIONS_WITHOUT_INPUT.includes(
      (typeof selectedFilterOption.value === 'string'
        ? selectedFilterOption.value
        : selectedFilterOption.value?.displayName) || ''
    );

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      isFilterActive() {
        return (
          (!!selectedField &&
            !!selectedFilterOption &&
            (!!input ||
              (rangeInput.gte !== undefined &&
                rangeInput.lte !== undefined))) ||
          (!!selectedField &&
            !doesSelectedFilterOptionRequireUserInput &&
            !doesSelectedFilterOptionRequireRangeInput &&
            !input)
        );
      },
      getModel() {
        if (!this.isFilterActive()) {
          return null;
        }

        const selectedFilterOptionValue =
          typeof selectedFilterOption!.value === 'string'
            ? selectedFilterOption!.value
            : selectedFilterOption!.value!.displayKey;

        return {
          filter: {
            [selectedField!.label]: {
              [selectedFilterOptionValue as string]:
                doesSelectedFilterOptionRequireRangeInput ? rangeInput : input,
            },
          },
          filterType: selectedField!.label,
          type: selectedFilterOptionValue,
          filterTo: selectedField?.value.type.name,
        } as CustomFilterModel;
      },
    };
  });

  useEffect(() => {
    // when field, filter option, and the user input is populated
    if (!!selectedField && !!input && !!selectedFilterOption) {
      props.filterChangedCallback();
    }

    // when field and filter option are populated for the field that
    // does not require a user input i.e. blank or not blank
    if (
      !!selectedField &&
      !doesSelectedFilterOptionRequireUserInput &&
      !doesSelectedFilterOptionRequireRangeInput &&
      !input
    ) {
      props.filterChangedCallback();
    }

    // for filters that are using the range input,
    // update the grid after both from and to are filled out.
    if (
      !!selectedField &&
      doesSelectedFilterOptionRequireRangeInput &&
      rangeInput.gte !== undefined &&
      rangeInput.lte !== undefined
    ) {
      props.filterChangedCallback();
    }

    // when the filter is cleared
    if (
      !selectedField &&
      input === '' &&
      !selectedFilterOption &&
      rangeInput.gte === undefined &&
      rangeInput.lte === undefined
    ) {
      props.filterChangedCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, selectedFilterOption, rangeInput.gte, rangeInput.lte]);

  return (
    <S.CustomColumnFilter>
      <Select<(typeof columnCustomFields)[0]>
        className="ag-custom-component-popup"
        options={fieldOptions}
        onChange={(option: OptionType<(typeof columnCustomFields)[0]>) => {
          setSelectedFilterOption(undefined);
          setInput(undefined);
          setSelectedField(option);
        }}
        value={selectedField}
        placeholder={t(
          'custom-filter-select-field-dropdown',
          'Select field...'
        )}
      />
      <Select<string | IFilterOptionDef>
        className="ag-custom-component-popup"
        disabled={!selectedField}
        options={filterOptions}
        onChange={(option: OptionType<string | IFilterOptionDef>) => {
          setSelectedFilterOption(option);
        }}
        value={selectedFilterOption}
        placeholder={t(
          'custom-filter-select-filter-options',
          'Filter options...'
        )}
      />
      {doesSelectedFilterOptionRequireUserInput &&
        !doesSelectedFilterOptionRequireRangeInput && (
          <Input
            key="custom-filter-input"
            disabled={!selectedFilterOption}
            onChange={onInputChange}
            placeholder={t(
              'custom-filter-select-filter-input',
              'Filter value...'
            )}
            value={input}
          />
        )}
      {doesSelectedFilterOptionRequireRangeInput && (
        <>
          <Input
            key="custom-filter-range-input-from"
            disabled={!selectedFilterOption}
            onChange={onRangeInputFromChange}
            placeholder={t('custom-filter-select-range-from', 'From...')}
            type="number"
            value={rangeInput.gte}
          />
          <Input
            key="custom-filter-range-input-to"
            disabled={!selectedFilterOption}
            onChange={onRangeInputToChange}
            placeholder={t('custom-filter-select-range-to', 'To...')}
            type="number"
            value={rangeInput.lte}
          />
        </>
      )}
      <Button
        onClick={() => {
          setSelectedField(undefined);
          setSelectedFilterOption(undefined);
          setRangeInput({});
          setInput('');
        }}
      >
        {t('custom-filter-reset-button', 'Reset')}
      </Button>
    </S.CustomColumnFilter>
  );
});
