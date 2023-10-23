import { Link } from 'react-location';

import format from 'date-fns/format';
import styled from 'styled-components/macro';

import { Chip, Tooltip } from '@cognite/cogs.js';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';

import { createCdfLink } from '../../../utils/createCdfLink';
import { NoResults } from '../../shared/NoResults';

export type Model = ModelFile & {
  isActive: boolean;
  simulatorName: string;
};

interface ModelListProps {
  isModalLibraryEmpty: boolean;
  modelFiles: Model[];
  className?: string;
}

export function ModelList({
  modelFiles,
  className,
  isModalLibraryEmpty,
}: ModelListProps) {
  if (!modelFiles.length && !isModalLibraryEmpty) {
    return (
      <NoResults
        data-testid="no-results-container"
        bodyText="Please refine your filters or update the search parameters"
        headerText="No results available"
      />
    );
  }

  return (
    <ModelListElement className={className}>
      {modelFiles.map((modelFile) => (
        <li key={modelFile.id}>
          <Link
            className={modelFile.isActive ? `active` : undefined}
            role="link"
            to={createCdfLink(
              `/model-library/models/${encodeURIComponent(
                modelFile.metadata.simulator
              )}/${encodeURIComponent(modelFile.metadata.modelName)}`
            )}
          >
            <div className="model">
              <div className="metadata">
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
                  <li>{modelFile.simulatorName}</li>
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
