import styled from 'styled-components';

import { Body, Flex, Overline } from '@cognite/cogs.js';

import { BasicPlaceholder } from '../../../../../../../components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '../../../../../../../components/Spinner/Spinner';
import { useTranslation } from '../../../../../../../hooks/useTranslation';
import {
  useLoadDataSource,
  useLoadDatapoints,
  useLoadRules,
} from '../../../../hooks';
import { emptyDatapoints } from '../../../../utils/validationTimeseries';

import { ValidationGraph } from './ValidationGraph';
import { ValidationStatistics } from './ValidationStatistics';

export const TotalValidityCard = () => {
  const { t } = useTranslation('TotalValidityCard');

  const { dataSource } = useLoadDataSource();
  const { error: errorRules, loadingRules, rules } = useLoadRules();
  const { datapoints, isLoading: loadingDatapoints } = useLoadDatapoints({
    target: 'dataSource',
    rules,
  });

  const isLoading = loadingRules || loadingDatapoints;
  const isError = errorRules;
  const noValidationScore = !datapoints || emptyDatapoints(datapoints);

  const renderContent = () => {
    if (isLoading)
      return (
        <div>
          <Spinner size={14} />
        </div>
      );

    if (isError || !dataSource)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_not_found_ds_validity',
            'Something went wrong. The validity score of the data source could not be loaded.'
          )}
        >
          <Body size="small">{JSON.stringify(errorRules)}</Body>
        </BasicPlaceholder>
      );

    if (noValidationScore)
      return (
        <Body muted size="x-small">
          <i>
            {t(
              'data_quality_no_score',
              'No score yet. Validate now to get the quality of your data.'
            )}
          </i>
        </Body>
      );

    return (
      <Flex direction="column">
        <ValidationStatistics dataSourceId={dataSource.externalId} />
        <ValidationGraph
          dataSourceId={dataSource.externalId}
          dsTimeseries={datapoints}
        />
      </Flex>
    );
  };

  return (
    <Flex>
      <Card>
        <Overline size="small">
          {t('data_quality_total_validity', 'Total validity')}
        </Overline>

        {renderContent()}
      </Card>
    </Flex>
  );
};

const Card = styled.div`
  border-radius: 6px;
  box-shadow: var(--cogs-elevation--surface--interactive);
  overflow: auto;
  padding: 0.5rem 1.5rem 0.5rem 1.5rem;
  width: min(50vw, 600px);

  .cogs-overline-3 {
    margin-bottom: 1rem;
  }
`;
