/*!
 * Copyright 2025 Cognite AS
 */
import { type ChangeEvent } from 'react';
import { getRevisions } from '../../hooks/network/getRevisions';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';
import { type CogniteClient } from '@cognite/sdk';

type HandleModelClickParams = {
  modelData: ModelWithRevisionInfo;
  setSelectedModel: (model: ModelWithRevisionInfo) => void;
  setCurrentPage: (page: number) => void;
  setIsRevisionsLoading: (loading: boolean) => void;
  setRevisions: (revisions: Array<{ id: number; createdTime: Date }>) => void;
  sdk: CogniteClient;
};

type HandleRevisionSelectParams = {
  revisionId: number;
  selectedModel: ModelWithRevisionInfo;
  setSelectedRevisions: (revisions: Record<number, number | undefined>) => void;
};

export const handleModelClick = async ({
  modelData,
  setSelectedModel,
  setCurrentPage,
  setIsRevisionsLoading,
  setRevisions,
  sdk
}: HandleModelClickParams): Promise<void> => {
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

export const handleRevisionSelect = ({
  revisionId,
  selectedModel,
  setSelectedRevisions
}: HandleRevisionSelectParams): void => {
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
