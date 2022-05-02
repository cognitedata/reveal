import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useTranslation } from 'react-i18next';

import { TS_FIX_ME } from 'core';
import noop from 'lodash/noop';
import layers from 'utils/zindex';

import { Input } from '@cognite/cogs.js';

import { Tooltip } from 'components/Tooltip/TooltipSlowly';
import { MarginRightSmallContainer } from 'styles/layout';

import { TypeaheadResult } from '../hooks/useLayers';

import {
  SearchableAssetSuggestion,
  MapSearchContainer,
  LicenseWrapper,
} from './elements';

const TOOLTIP_TEXT = 'Search by license';

function normalizeMixedDataValue(value: string) {
  const padding = '000000000000000';
  // Loop over all numeric values in the string and
  // replace them with a value of a fixed-width for
  // both leading (integer) and trailing (decimal)
  // padded zeroes.
  // eslint-disable-next-line no-param-reassign
  value = value.replace(/(\d+)((\.\d+)+)?/g, (_$0, integer, decimal, $3) => {
    // If this numeric value has "multiple"
    // decimal portions, then the complexity
    // is too high for this simple approach -
    // just return the padded integer.
    if (decimal !== $3) {
      return padding.slice(integer.length) + integer + decimal;
    }
    // eslint-disable-next-line no-param-reassign
    decimal = decimal || '.0';
    return (
      padding.slice(integer.length) +
      integer +
      decimal +
      padding.slice(decimal.length)
    );
  });
  return value;
}

interface Props {
  onSelect: (item: any) => void;
  placeholder?: string;
  items?: TypeaheadResult[]; // data items to populate the autosuggest
}

const theme = {
  container: { position: 'relative' },
  suggestionsList: { margin: 0, padding: 16, listStyleType: 'none' },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: layers.MAP_TOP_BUTTONS,
    marginTop: 8,
    left: 0,
    right: 0,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  suggestion: {
    display: 'block',
    cursor: 'pointer',
  },
};

export const SearchableAssets: React.FC<Props> = React.memo(
  ({ onSelect, placeholder = '', items = [] }) => {
    const { t } = useTranslation('Search');

    const [textValueState, setTextValueState] = useState('');
    const [suggestions, setSuggestions] = useState<TypeaheadResult[]>([]);

    const filterSuggestions = (event: TS_FIX_ME) => {
      const filtered = items
        .filter((item) => item.title.includes(event.value))
        .sort((a, b) => {
          const aMixed = normalizeMixedDataValue(a.title);
          const bMixed = normalizeMixedDataValue(b.title);
          return aMixed < bMixed ? -1 : 1;
        });
      setSuggestions([...filtered]);
    };

    const renderSuggestion = (suggestion: any, { isHighlighted }: any) => {
      return (
        <SearchableAssetSuggestion isHighlighted={isHighlighted}>
          <div>
            {suggestion.title} - <i>{suggestion.type}</i>
          </div>
        </SearchableAssetSuggestion>
      );
    };

    const renderInputComponent = (inputProps: TS_FIX_ME) => {
      const { inputRef = noop, ref, ...other } = inputProps;
      const inputprops = {
        inputRef: (node: TS_FIX_ME) => {
          ref(node);
          inputRef(node);
        },
      };

      const props = { ...other, inputprops };
      return (
        <Tooltip title={t(TOOLTIP_TEXT) as string}>
          <LicenseWrapper>
            <Input placeholder={placeholder} {...props} />
          </LicenseWrapper>
        </Tooltip>
      );
    };

    const renderLicenseInput = React.useMemo(
      () => (
        <MapSearchContainer>
          <Autosuggest
            suggestions={suggestions}
            getSuggestionValue={(suggestion: TypeaheadResult) =>
              suggestion.title
            }
            renderSuggestion={renderSuggestion}
            focusInputOnSuggestionClick={false}
            onSuggestionsClearRequested={() => setSuggestions([])}
            renderInputComponent={renderInputComponent}
            onSuggestionsFetchRequested={filterSuggestions}
            inputProps={{
              value: textValueState,
              onChange: (event: TS_FIX_ME) =>
                setTextValueState(event.target.value),
            }}
            onSuggestionSelected={(_event, e2) => {
              setTextValueState(e2.suggestion.title);
              if (onSelect) onSelect(e2.suggestion);
            }}
            theme={theme as any}
            renderSuggestionsContainer={(options) => (
              <div {...options.containerProps}>{options.children}</div>
            )}
          />
        </MapSearchContainer>
      ),
      [textValueState, suggestions]
    );

    return (
      <MarginRightSmallContainer data-testid="map-input-search">
        {renderLicenseInput}
      </MarginRightSmallContainer>
    );
  }
);
