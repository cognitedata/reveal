import { useMemo, useState } from 'react';

import {
  GeneralDetails,
  EmptyState,
  ErrorState,
  Widget,
} from '@fdx/components';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { flattenProperties } from '@fdx/shared/utils/properties';
import { matchSorter } from 'match-sorter';

import { InputExp } from '@cognite/cogs.js';

import { PropertiesProps } from './PropertiesWidget';

export const PropertiesExpanded: React.FC<PropertiesProps> = ({
  data,
  state,
}) => {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const properties = useMemo(() => flattenProperties(data), [data]);

  const results = useMemo(() => {
    if (!inputValue) return properties;

    return matchSorter(properties, inputValue, { keys: ['key', 'value'] });
  }, [properties, inputValue]);

  const renderContent = () => {
    if (state === 'error') {
      return (
        <ErrorState
          title={t('WIDGET_ERROR_TITLE')}
          body={t('WIDGET_ERROR_BODY')}
        />
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState
          title={t('PROPERTIES_WIDGET_EMPTY_TITLE')}
          body={t('PROPERTIES_WIDGET_EMPTY_BODY', { query: inputValue })}
        />
      );
    }

    return results.map(({ key, value }) => {
      return <GeneralDetails.Item key={key} name={key} value={value} />;
    });
  };

  return (
    <Widget expanded>
      <Widget.Header>
        <InputExp
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('PROPERTIES_WIDGET_SEARCH_INPUT_PLACEHOLDER')}
          icon="Search"
          clearable
        />
      </Widget.Header>

      <Widget.Body>
        <GeneralDetails>{renderContent()}</GeneralDetails>
      </Widget.Body>
    </Widget>
  );
};
