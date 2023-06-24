import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
} from '@data-exploration-lib/core';

import { MetadataFilter } from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

// INFO: FileFilters is for documents.
export const SequenceFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const sequenceFIlter = filter.sequence;
  const isResetButtonVisible = hasObjectAnyProperty(sequenceFIlter, [
    'metadata',
  ]);

  return (
    <BaseFilterCollapse.Panel
      title={t('SEQUENCES', 'Sequences')}
      hideResetButton={!isResetButtonVisible}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('sequence')}
      {...rest}
    >
      <TempMultiSelectFix>
        <MetadataFilter.Sequences
          query={query}
          filter={sequenceFIlter}
          values={sequenceFIlter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('sequence', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
