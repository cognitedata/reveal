import { useEffect } from 'react';
import { Link } from 'react-location';

import { a, useSpringRef, useTrail } from '@react-spring/web';
import type { UseTrailProps } from '@react-spring/web';

import styled from 'styled-components/macro';

import { Skeleton } from '@cognite/cogs.js';
import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';

import { hashCode } from 'utils/stringUtils';

interface ModelListProps {
  modelFiles: ModelFile[];
  className?: string;
  isFetchingModelFiles: boolean;
}

export function ModelList({
  modelFiles,
  className,
  isFetchingModelFiles,
}: ModelListProps) {
  const springRef = useSpringRef();
  const [modelFilesTrail, modelFilesSpring] = useTrail(
    modelFiles.length,
    (): UseTrailProps => ({
      ref: springRef,
      opacity: 0,
      x: -20,
    })
  );

  useEffect(() => {
    modelFilesSpring.start({
      opacity: 1,
      x: 0,
    });
  });

  if (isFetchingModelFiles) {
    return (
      <ModelFilesListSkeleton>
        <Skeleton.Rectangle height="65px" width="100%" />
        <Skeleton.Rectangle height="65px" width="100%" />
        <Skeleton.Rectangle height="65px" width="100%" />
        <Skeleton.Rectangle height="65px" width="100%" />
        <Skeleton.Rectangle height="65px" width="100%" />
        <Skeleton.Rectangle height="65px" width="100%" />
      </ModelFilesListSkeleton>
    );
  }

  return (
    <ModelListElement className={className}>
      {modelFiles.map((modelFile, index) => (
        <a.li key={modelFile.id} style={modelFilesTrail[index]}>
          <Link
            getActiveProps={() => ({ className: 'active' })}
            role="link"
            to={`/model-library/models/${encodeURIComponent(
              modelFile.metadata.simulator
            )}/${encodeURIComponent(modelFile.metadata.modelName)}`}
          >
            <div className="model">
              <SimulatorIcon
                content={modelFile.metadata.simulator.substr(0, 2)}
                gradientOffset={hashCode(modelFile.metadata.modelName) % 360}
                role="none"
              />
              <div className="metadata">
                <div className="name">{modelFile.metadata.modelName}</div>
                <div className="version">v{modelFile.metadata.version}</div>
              </div>
            </div>
          </Link>
        </a.li>
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
    &:hover {
      background: var(--cogs-white);
      box-shadow: inset 0 0 0 2.5px var(--cogs-primary);
    }
    &.active {
      box-shadow: none;
      /* box-shadow: inset 0 0 0 1.5px var(--cogs-primary) !important; */
      background: var(--cogs-midblue-7);
      color: var(--cogs-text-color);
    }
    .model {
      display: flex;
      overflow: hidden;
      align-items: center;
      .metadata {
        flex: 1 1 auto;
        display: flex;
        overflow: hidden;
        padding-left: 12px;
        .name {
          flex: 1 1 auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
        }
      }
    }
  }
`;

const ModelFilesListSkeleton = styled.div`
  div {
    margin-bottom: 12px;
  }
`;

interface SimulatorIconProps {
  content: string;
  gradientOffset?: number;
}

const SimulatorIcon = styled.span<SimulatorIconProps>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  font-size: 18px;
  color: var(--cogs-primary);
  border: 1px solid var(--cogs-primary);
  border-radius: var(--cogs-border-radius--default);
  /* filter: hue-rotate(${(props) => props.gradientOffset ?? 0}deg); */
  &::after {
    content: '${(props) => props.content}';
  }
  .active & {
    border-width: 0;
    /* background: var(--cogs-gradient-midnightblue); */
    background: var(--cogs-primary);
    &::after {
      color: var(--cogs-white);
    }
  }
`;
