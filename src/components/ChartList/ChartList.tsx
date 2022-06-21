import { Infobox } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import ChartListGrid from './ChartListGrid/ChartListGrid';
import ChartListTable from './ChartListTable/ChartListTable';
import { ChartListProps } from './types';

const defaultTranslations = makeDefaultTranslations(
  'Preview',
  'Name',
  'Owner',
  'Updated',
  'Actions',
  'Duplicate',
  'Delete',
  "You search didn't return any results"
);

interface Props extends ChartListProps {
  viewOption: 'list' | 'grid';
  error: string | false;
  translations: typeof defaultTranslations;
}

const ChartList = ({
  viewOption = 'list',
  error,
  loading,
  list,
  onChartClick,
  onChartDeleteClick,
  onChartDuplicateClick,
  readOnly,
  translations,
}: Props) => {
  const Component = viewOption === 'list' ? ChartListTable : ChartListGrid;
  return (
    <>
      <Component
        loading={loading}
        list={list}
        onChartClick={onChartClick}
        onChartDeleteClick={onChartDeleteClick}
        onChartDuplicateClick={onChartDuplicateClick}
        readOnly={readOnly}
        translations={translations}
      />
      {error && (
        <Infobox
          type="warning"
          title="There was a problem when loading the information"
        >
          {error}
        </Infobox>
      )}
    </>
  );
};

ChartList.defaultTranslations = ChartListTable.defaultTranslations;
ChartList.translationKeys = ChartListTable.translationKeys;
ChartList.translationNamespace = 'ChartList';

export default ChartList;
