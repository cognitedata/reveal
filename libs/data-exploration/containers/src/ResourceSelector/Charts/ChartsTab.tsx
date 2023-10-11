import { TabProps } from '@cognite/cogs.js';

import {
  InternalChartsFilters,
  useTranslation,
} from '@data-exploration-lib/core';

import { CounterTab } from '../../ResourceTabs/elements';
import { getChipRightPropsForResourceCounter } from '../../ResourceTabs/getChipRightPropsForResourceCounter';

import { useFilteredChartsData } from './hooks';
import { getQueriedChartsData } from './utils';
interface Props extends TabProps {
  query?: string;
  filter?: InternalChartsFilters;
}

export const ChartsTab = ({
  query = '',
  filter = { isPublic: undefined },
  ...rest
}: Props) => {
  const { t } = useTranslation();

  const { data: chartsData, isChartsLoading } = useFilteredChartsData(filter);
  const data = getQueriedChartsData(chartsData, query);
  const count = data.length;

  const chipRightProps = getChipRightPropsForResourceCounter(
    count,
    isChartsLoading
  );

  return (
    <CounterTab label={t('CHARTS', 'Charts')} {...chipRightProps} {...rest} />
  );
};
