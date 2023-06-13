import { useMemo, useState } from 'react';

import { matchSorter } from 'match-sorter';

import { InputExp } from '@cognite/cogs.js';

import { translationKeys } from '../../../common/i18n/translationKeys';
import { GeneralDetails } from '../../../components/details';
import { Widget } from '../../../components/widget/Widget';
import { useTranslation } from '../../../hooks/useTranslation';

import { PropertiesProps } from './PropertiesWidget';
import { flattenProperties } from './utils';

export const PropertiesExpanded: React.FC<PropertiesProps> = ({ data }) => {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const properties = useMemo(() => flattenProperties(data), [data]);

  const results = useMemo(() => {
    if (!inputValue) return properties;

    return matchSorter(properties, inputValue, { keys: ['key', 'value'] });
  }, [properties, inputValue]);

  return (
    <Widget expanded>
      <Widget.Header>
        <InputExp
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t(
            translationKeys.propertiesWidgetFilterByPlaceholder,
            'Filter by name'
          )}
          icon="Search"
          clearable
        />
      </Widget.Header>

      <Widget.Body>
        <GeneralDetails>
          {results.map(({ key, value }) => {
            return <GeneralDetails.Item key={key} name={key} value={value} />;
          })}
        </GeneralDetails>
      </Widget.Body>
    </Widget>
  );
};
