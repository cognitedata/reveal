import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { DataPreviewTableProps } from '../DataPreviewTable/DataPreviewTable';
import { SuggestionsTableData } from './SuggestionsModal';
import { usePreviewTableData } from '@platypus-app/modules/solution/data-management/hooks/usePreviewTableData';
import { useFindSuggestions } from './useFindSuggestions';

export const useSuggestionsResult = ({
  selectedColumn,
  targetTypeDef,
  matchConfidence,
  selectedSourceColumns,
  selectedTargetColumns,
  dataModelInfo,
}: {
  selectedColumn?: string;
  targetTypeDef?: DataModelTypeDefsType;
  matchConfidence: number;
  selectedSourceColumns: string[];
  selectedTargetColumns: string[];
  dataModelInfo: DataPreviewTableProps;
}) => {
  const { data: sourceRecords, isFetching: isFetchingSource } =
    usePreviewTableData(
      dataModelInfo.dataModelExternalId,
      dataModelInfo.version,
      dataModelInfo.dataModelType,
      dataModelInfo.dataModelTypeDefs
    );
  const { data: targetRecords, isFetching: isFetchingTarget } =
    usePreviewTableData(
      dataModelInfo.dataModelExternalId,
      dataModelInfo.version,
      targetTypeDef,
      dataModelInfo.dataModelTypeDefs
    );

  const isFetchingRecords = isFetchingSource || isFetchingTarget;

  // fetch suggestions when any of the parameters update
  const { data: matches, isFetching: isFindingSuggestions } =
    useFindSuggestions(
      sourceRecords,
      targetRecords,
      selectedColumn,
      selectedSourceColumns,
      selectedTargetColumns
    );

  const isLoading = isFetchingRecords || isFindingSuggestions;

  const getSuggestionResult = () => {
    if (!targetTypeDef || !sourceRecords || !targetRecords) {
      return [];
    }
    const data: SuggestionsTableData[] = [];
    if (sourceRecords && targetRecords && matches) {
      const matchScores = matches.map((m) => m.score);
      matchScores.sort();
      const minScore =
        matchScores[Math.floor((1 - matchConfidence) * (matches.length - 1))];

      const sourceRecordsMap = new Map(
        sourceRecords.map((r) => [r.externalId, r])
      );
      const targetRecordsMap = new Map(
        targetRecords.map((r) => [r.externalId, r])
      );

      matches.forEach((match) => {
        const sourceRecord = sourceRecordsMap.get(match.sourceExternalId);
        const targetRecord = targetRecordsMap.get(match.targetExternalId);
        if (match.score >= minScore && sourceRecord && targetRecord) {
          data.push({
            id: `${selectedColumn},${match.sourceExternalId},${match.targetExternalId}`,
            source: sourceRecord as { externalId: string },
            target: targetRecord as { externalId: string },
            score: Math.round(match.score * 10000) / 10000,
            relativeScore: Math.round(match.relativeScore * 10000) / 10000,
          });
        }
      });
    }
    return data;
  };

  return { suggestionsResult: getSuggestionResult(), isLoading };
};
