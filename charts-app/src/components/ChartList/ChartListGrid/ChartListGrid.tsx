import { Flex, Title } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import ChartListGridItem from './ChartListGridItem';
import { ChartListProps } from '../types';
import ChartListDropdown from '../ChartListDropdown/ChartListDropdown';

const defaultTranslations = makeDefaultTranslations(
  "Your search didn't return any results",
  ...ChartListDropdown.translationKeys
);

interface Props extends ChartListProps {
  translations?: typeof defaultTranslations;
}

function ChartListGrid({
  loading,
  list,
  readOnly = false,
  onChartClick,
  onChartDuplicateClick,
  onChartDeleteClick,
  translations,
  emptyState,
}: Props) {
  const t = { ...defaultTranslations, ...translations };
  if (!loading && list.length === 0 && emptyState) return <>{emptyState}</>;
  return (
    <Flex gap={15} wrap="wrap">
      {!loading && list.length === 0 && (
        <div style={{ flexGrow: 1, textAlign: 'center', marginBottom: 10 }}>
          {emptyState || (
            <Title level={4}>
              {t["Your search didn't return any results"]}
            </Title>
          )}
        </div>
      )}
      {loading
        ? Array.from(Array(6).keys()).map((e) => (
            <ChartListGridItem.Loading key={e} />
          ))
        : list.map((row) => (
            <ChartListGridItem
              key={row.id}
              onClick={() => onChartClick(row.id)}
              onDuplicateClick={() => onChartDuplicateClick(row.id)}
              onDeleteClick={() => onChartDeleteClick(row.id)}
              name={row.name}
              chart={row.firebaseChart}
              updatedAt={row.updatedAt}
              owner={row.owner}
              readOnly={readOnly}
              translations={translations}
            />
          ))}
    </Flex>
  );
}

export default ChartListGrid;
