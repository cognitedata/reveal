import { useState, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';

import every from 'lodash/every';
import includes from 'lodash/includes';
import isString from 'lodash/isString';
import { v1 } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { Tooltip } from 'components/Tooltip';

import { Header, ExtraLabels } from '../interfaces';

import { Container, Title, TitleWrapper } from './elements';

export interface Item {
  text: string;
  key: string;
}

type OptionType = string | Item;

interface Props<T> {
  onValueChange: (vals: string[]) => void;
  selectedValues: string[];
  options: T[];
  header?: Header;
  extraLabels?: ExtraLabels;
  scrollable?: boolean;
  enableSelectAll?: boolean;
}

export const CheckBoxes = <T extends string | Item>(props: Props<T>) => {
  const {
    onValueChange,
    options,
    selectedValues = [],
    header,
    extraLabels = {},
    scrollable = false,
    enableSelectAll = false,
  } = props;

  const [allOptionsSelected, setAllOptionsSelected] = useState<boolean>(false);
  const isOptionsString = every(options, isString);

  const optionsToStringArray = (options: T[]) => options.map(optionToString);

  const optionToString = (option: T) =>
    isOptionsString ? String(option) : (option as Item).key;

  useEffect(
    () => setAllOptionsSelected(options.length === selectedValues.length),
    [options, selectedValues]
  );

  const handleSelection = (option: string) => {
    if (selectedValues.includes(option)) {
      onValueChange(selectedValues.filter((opt) => opt !== option));
    } else {
      onValueChange([...selectedValues, option]);
    }
  };

  const handleSelectAll = () =>
    allOptionsSelected
      ? onValueChange([])
      : onValueChange(optionsToStringArray(options));

  const createCheckBoxElement = (
    option: OptionType,
    selected: boolean,
    onValChange: (key: string) => void,
    extraOptionToDisplay = ''
  ) => {
    // name should be unique across other groups
    const id = v1();
    const isOptionString = isString(option);
    const key = isOptionString ? option : (option as Item).key;
    const displayText = isOptionString ? option : (option as Item).text;
    return (
      <Container key={key}>
        <Checkbox
          name={`${key}_${id}`}
          checked={selected}
          onChange={() => onValChange(key as string)}
          data-testid={key}
        >
          {`${displayText} ${extraOptionToDisplay}`}
        </Checkbox>
      </Container>
    );
  };

  const renderHeader = !!header?.title && (
    <TitleWrapper>
      <Tooltip title={header?.tooltip || ''} enabled={!!header?.tooltip}>
        <Title>{header?.title}</Title>
      </Tooltip>
    </TitleWrapper>
  );

  const renderSelectAllCheckboxAsOption =
    enableSelectAll &&
    createCheckBoxElement('All', allOptionsSelected, handleSelectAll);

  const content = options.map((option) =>
    createCheckBoxElement(
      option,
      includes(selectedValues, optionToString(option)),
      handleSelection,
      extraLabels[optionToString(option) || '']
    )
  );
  const scrollStyle = { height: renderHeader ? 'calc(100% - 36px)' : '100%' };
  const scrollableContent = (
    <Scrollbars style={scrollStyle}>{content}</Scrollbars>
  );
  const renderContent = scrollable ? scrollableContent : content;

  return (
    <>
      {renderHeader}
      {renderSelectAllCheckboxAsOption}
      {renderContent}
    </>
  );
};
