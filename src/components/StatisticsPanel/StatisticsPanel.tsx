import DetailsBlock from 'components/DetailsBlock/DetailsBlock';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { Flex, Infobox } from '@cognite/cogs.js';
import { Histogram } from '../Histogram/Histogram';
import ValueList from '../ValueList/ValueList';

const defaultTranslations = makeDefaultTranslations(
  'Statistics',
  'Percentiles',
  'Shape',
  'Histogram',
  'No histogram data available',
  'Count',
  'Mean',
  'Median',
  'Standard Deviation',
  'Max',
  'Min',
  '25th Percentile',
  '50th Percentile',
  '75th Percentile',
  'Skewness',
  'Kurtosis'
);

type Props = {
  error: string | boolean;
  loading: boolean;
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  q25: number;
  q50: number;
  q75: number;
  skewness: number;
  kurtosis: number;
  histogram:
    | { rangeStart: number; rangeEnd: number; quantity: number }[]
    | null;
  unit: string | undefined;
  emptyLabel?: string;
  translations?: typeof defaultTranslations;
};

const StatisticsPanel = ({
  mean,
  count,
  median,
  max,
  min,
  std,
  q25,
  q50,
  q75,
  skewness,
  kurtosis,
  histogram,
  unit,
  loading,
  emptyLabel = '-',
  translations,
  error,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  const displayValue = (value: number) => {
    if (isNaN(value)) return emptyLabel;
    return [value, unit].filter(Boolean).join(' ');
  };

  return (
    <>
      {!loading && error && (
        <Infobox
          type="warning"
          title="There was a problem loading the statistics"
        >
          {error}
        </Infobox>
      )}
      <DetailsBlock title={t.Statistics}>
        <ValueList
          loading={loading}
          list={[
            { label: t.Count, value: displayValue(count) },
            { label: t.Mean, value: displayValue(mean) },
            { label: t.Median, value: displayValue(median) },
            {
              label: t['Standard Deviation'],
              value: displayValue(std),
            },
            { label: t.Max, value: displayValue(max) },
            { label: t.Min, value: displayValue(min) },
          ]}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Percentiles}>
        <ValueList
          loading={loading}
          list={[
            { label: t['25th Percentile'], value: displayValue(q25) },
            { label: t['50th Percentile'], value: displayValue(q50) },
            { label: t['75th Percentile'], value: displayValue(q75) },
          ]}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Shape}>
        <ValueList
          loading={loading}
          list={[
            { label: t.Skewness, value: displayValue(skewness) },
            { label: t.Kurtosis, value: displayValue(kurtosis) },
          ]}
        />
      </DetailsBlock>
      <DetailsBlock title={t.Histogram}>
        <Flex justifyContent="center" style={{ padding: 5 }}>
          <Histogram
            unit={unit}
            loading={loading}
            data={histogram || []}
            noDataText={t['No histogram data available']}
          />
        </Flex>
      </DetailsBlock>
    </>
  );
};

StatisticsPanel.defaultTranslations = defaultTranslations;
StatisticsPanel.translationKeys = translationKeys(defaultTranslations);
StatisticsPanel.translationNamespace = 'StatisticsPanel';

export default StatisticsPanel;
