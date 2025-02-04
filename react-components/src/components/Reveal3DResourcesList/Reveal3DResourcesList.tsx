/*!
 * Copyright 2025 Cognite AS
 */
import { SelectPanel } from '@cognite/cogs-lab';
import { LoaderIcon, EmptyState, FindIllustration } from '@cognite/cogs.js';
import { type ReactElement, useState } from 'react';
import { useAllResourcesList } from './hooks/useAllResourcesList';
import { type CogniteClient } from '@cognite/sdk';
import styled from 'styled-components';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';
import { ModelList } from './ModelList';
import { RevisionList } from './RevisionList';
import { handleModelClick, handleRevisionSelect, onSearchInputChange } from './utils';

type Reveal3DResourcesListProps = {
  sdk: CogniteClient;
  modelType?: string;
  onRevisionSelect?: (modelId: number, revisionId: number) => void;
  selectedModel: ModelWithRevisionInfo | undefined;
  setSelectedModel: (model: ModelWithRevisionInfo | undefined) => void;
  selectedRevisions: Record<number, number | undefined>;
  setSelectedRevisions: (revisions: Record<number, number | undefined>) => void;
};

export function Reveal3DResourcesList({
  sdk,
  modelType,
  onRevisionSelect,
  selectedModel,
  setSelectedModel,
  selectedRevisions,
  setSelectedRevisions
}: Reveal3DResourcesListProps): ReactElement {
  const { data: modelsWithRevision, isLoading: isItemsLoading } = useAllResourcesList(sdk);
  const [revisions, setRevisions] = useState<Array<{ id: number; createdTime: Date }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRevisionsLoading, setIsRevisionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels =
    modelType !== undefined
      ? modelsWithRevision?.filter((model) => model.resourceType === modelType)
      : modelsWithRevision;

  const filteredAndSearchedModels = filteredModels?.filter((model) =>
    model.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRevisionSelectWithCallback = (revisionId: number): void => {
    if (selectedModel !== undefined) {
      handleRevisionSelect(revisionId, selectedModel, setSelectedRevisions);
      if (onRevisionSelect !== undefined) {
        onRevisionSelect(selectedModel.id, revisionId);
      }
    }
  };

  return (
    <Reveal3DResourcesListContainer>
      <SelectPanel visible>
        <SelectPanel.Header title={'3D Resources'}>
          {currentPage !== 1 && (
            <SelectPanel.BackButton
              onClick={(_) => {
                setCurrentPage((page) => (page - 1 > 0 ? page - 1 : page));
              }}
            />
          )}
          {currentPage !== 2 && (
            <SelectPanel.SearchBar
              onChange={(event) => {
                onSearchInputChange(event, setSearchQuery);
              }}
            />
          )}
        </SelectPanel.Header>

        <SelectPanel.Body length="small">
          {isItemsLoading ? (
            <LoaderIcon />
          ) : (
            <>
              {currentPage === 1 &&
                (filteredAndSearchedModels !== undefined && filteredAndSearchedModels.length > 0 ? (
                  <ModelList
                    models={filteredAndSearchedModels}
                    selectedRevisions={selectedRevisions}
                    handleModelClick={async (modelData) => {
                      await handleModelClick(
                        modelData,
                        setSelectedModel,
                        setCurrentPage,
                        setIsRevisionsLoading,
                        setRevisions,
                        sdk
                      );
                    }}
                  />
                ) : (
                  <EmptyState
                    illustration={<FindIllustration />}
                    size="small"
                    title={'Try Again'}
                    description={`No results for query "${searchQuery}"`}
                  />
                ))}
              {currentPage === 2 && selectedModel !== undefined && (
                <RevisionList
                  revisions={revisions}
                  isRevisionsLoading={isRevisionsLoading}
                  selectedModel={selectedModel}
                  selectedRevisions={selectedRevisions}
                  handleRevisionSelect={handleRevisionSelectWithCallback}
                />
              )}
            </>
          )}
        </SelectPanel.Body>
        <SelectPanel.Footer />
      </SelectPanel>
    </Reveal3DResourcesListContainer>
  );
}

const Reveal3DResourcesListContainer = styled.div`
  position: absolute;
  top: 50px;
  left: 10px;
  display: flex;
  flex-direction: column;
  height: 400px;
  width: 300px;
  z-index: 10000;
`;
