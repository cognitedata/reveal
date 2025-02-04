/*!
 * Copyright 2025 Cognite AS
 */
import { type ChangeEvent } from 'react';
import { getRevisions } from '../../hooks/network/getRevisions';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';
import { type CogniteClient } from '@cognite/sdk';

export const handleModelClick = async (
  modelData: ModelWithRevisionInfo,
  setSelectedModel: (model: ModelWithRevisionInfo) => void,
  setCurrentPage: (page: number) => void,
  setIsRevisionsLoading: (loading: boolean) => void,
  setRevisions: (revisions: Array<{ id: number; createdTime: Date }>) => void,
  sdk: CogniteClient
): Promise<void> => {
  setSelectedModel(modelData);
  setCurrentPage(2);
  setIsRevisionsLoading(true);
  const fetchedRevisions = await getRevisions(modelData.id, sdk);
  setRevisions(
    fetchedRevisions.map((revision) => ({
      id: revision.id,
      createdTime: new Date(revision.createdTime)
    }))
  );
  setIsRevisionsLoading(false);
};

export const handleRevisionSelect = (
  revisionId: number,
  selectedModel: ModelWithRevisionInfo,
  setSelectedRevisions: (revisions: Record<number, number | undefined>) => void
): void => {
  setSelectedRevisions({
    [selectedModel.id]: revisionId
  });
};

export const onSearchInputChange = (
  event: ChangeEvent<HTMLInputElement>,
  setSearchQuery: (query: string) => void
): void => {
  setSearchQuery(event.target.value);
};
