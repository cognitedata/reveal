import { useMemo } from 'react';
import { Link, useMatch } from 'react-location';

import type { AppLocationGenerics } from '@simint-app/routes';
import { createCdfLink } from '@simint-app/utils/createCdfLink';
import format from 'date-fns/format';
import styled from 'styled-components/macro';

import { Chip, Illustrations, Tooltip } from '@cognite/cogs.js';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';

interface ModelListProps {
  isModalLibraryEmpty: boolean;
  modelFiles: ModelFile[];
  className?: string;
}

const isModelActive = (modelName: string) => {
  const encodedModelName = encodeURIComponent(modelName);
  const path = window.location.pathname;
  return path.split('/').includes(encodedModelName);
};

export function ModelList({
  modelFiles,
  className,
  isModalLibraryEmpty,
}: ModelListProps) {
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const simulatorsConfig = useMemo(
    () => definitions?.simulatorsConfig,
    [definitions]
  );

  if (!modelFiles.length && !isModalLibraryEmpty) {
    return (
      <EmptyState>
        <Illustrations.Solo type="EmptyStateSearch" />
        <h5>No models found</h5>
        <span>
          Try adjusting your search and filter to improve your search.
        </span>
      </EmptyState>
    );
  }

  return (
    <ModelListElement className={className}>
      {modelFiles.map((modelFile) => (
        <li key={modelFile.id}>
          <Link
            className={
              isModelActive(modelFile.metadata.modelName) ? `active` : undefined
            }
            role="link"
            to={createCdfLink(
              `/model-library/models/${encodeURIComponent(
                modelFile.metadata.simulator
              )}/${encodeURIComponent(modelFile.metadata.modelName)}`
            )}
          >
            <div className="model">
              <div className="metadata">
                <div className="name">{modelFile.metadata.modelName}</div>
                <div className="name">
                  {modelFile.metadata.modelName}
                  {modelFile.metadata.errorMessage && (
                    <Tooltip content={modelFile.metadata.errorMessage}>
                      <Chip
                        css={{ marginLeft: '12px' }}
                        icon="Warning"
                        size="x-small"
                        type="warning"
                        hideTooltip
                      />
                    </Tooltip>
                  )}
                </div>
                <div className="version">
                  Version {modelFile.metadata.version}
                </div>
                <ul>
                  <li>
                    {simulatorsConfig?.filter(
                      ({ key }) => key === modelFile.metadata.simulator
                    )?.[0].name ?? modelFile.metadata.simulator}
                  </li>
                  {modelFile.metadata.unitSystem && (
                    <li>{modelFile.metadata.unitSystem}</li>
                  )}
                  <li>
                    {format(new Date(modelFile.createdTime), 'yyyy-MM-dd')}
                  </li>
                </ul>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ModelListElement>
  );
}

const ModelListElement = styled.ul`
  padding: 0;
  li {
    list-style: none;
    margin-bottom: 12px;
  }
  a {
    border-radius: var(--cogs-border-radius--default);
    color: var(--cogs-text-color-secondary);
    display: block;
    align-items: flex-start;
    padding: 12px;
    transition: all 0.1s ease-out;
    box-shadow: inset 0 0 0 1px var(--cogs-border-default);
    background: #fafafa;
    &:hover {
      background: var(--cogs-white);
      box-shadow: inset 0 0 0 1px var(--cogs-primary);
    }
    &.active {
      box-shadow: inset 0 0 0 1px var(--cogs-primary);
      background: rgba(74, 103, 251, 0.08);
    }
    .model {
      display: flex;
      overflow: hidden;
      align-items: center;
      .metadata {
        color: var(--cogs-text-color-secondary);
        .name {
          font-weight: bold;
          font-weight: 16px;
        }
        ul {
          padding: 0;
          margin: 0;
          display: flex;
          li {
            margin: 0;
            &:not(:last-child) {
              &::after {
                content: '•';
                margin-left: 5px;
                margin-right: 5px;
              }
            }
          }
        }
      }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  text-align: center;

  h5 {
    font-size: var(--cogs-t5-font-size);
  }
  span {
    width: 250px;
  }
`;
