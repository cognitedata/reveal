import React from 'react';
import styled from 'styled-components';
import {
  Title as DefaultTitle,
  Detail,
  Tooltip,
  Icon,
  Input,
  Body,
  Flex,
  Select,
} from '@cognite/cogs.js';
import { Convention } from '../../types';
import { useDependentConvention } from '../../hooks/useDependentConvention';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const BaseTitle = styled(DefaultTitle)`
  && {
    color: var(--cogs-greyscale-grey9);
  }
`;

const BaseSubtitle = styled(Detail)`
  color: var(--cogs-text-icon--muted);
  display: flex;
  align-items: center;
  gap: 4px;

  .cogs-tooltip__content {
    height: 12px;
  }
`;

export interface Props {
  conventions: Convention[];
  convention: Convention;
  handleFilterClick?: () => void;
  editMode?: boolean;
  onChange: (updatedConvention: Convention) => void;
}
export const BaseFilterHeader: React.FC<React.PropsWithChildren<Props>> =
  React.memo(
    ({ conventions, convention, onChange, editMode, handleFilterClick }) => {
      const dependentConvention = useDependentConvention();

      if (editMode) {
        return (
          <Content>
            <Flex alignItems="center" gap={8}>
              <Body level={2}>Name:</Body>
              <Input
                width={250}
                placeholder="Name"
                value={convention.name}
                onChange={(e) => {
                  const { value } = e.target;
                  onChange({
                    ...convention,
                    name: value,
                  });
                }}
              />
              •<Body level={2}>Depends on:</Body>
              <Select
                width={250}
                isClearable
                hideSelectedOptions
                value={
                  convention.dependency
                    ? {
                        label:
                          conventions?.find(
                            (item) => item.id === convention.dependency
                          )?.name || 'NA',
                        value: convention.dependency,
                      }
                    : undefined
                }
                options={(conventions || [])
                  .filter((item) => convention.id !== item.id) // Remove current convention
                  .map((item) => {
                    const disabled = item.dependency === convention.id; // Avoid cyclic dependencies
                    return {
                      label: item.name || item.keyword,
                      value: item.id,
                      disabled,
                      helpText: disabled ? 'No cyclic dependencies' : undefined,
                    };
                  })}
                onChange={(newValue: any) => {
                  onChange({
                    ...convention!,
                    dependency: newValue.value,
                  });
                }}
              />
            </Flex>
          </Content>
        );
      }

      return (
        <Content>
          <BaseTitle level={6} onClick={handleFilterClick && handleFilterClick}>
            {convention?.name || convention.keyword}
          </BaseTitle>
          <BaseSubtitle>
            Keyword: {convention.keyword} • Position: {convention.start}-
            {convention.end} • Dependency:{' '}
            {dependentConvention(convention.dependency)?.keyword ?? 'N/A'} •
            Definitions: {convention.definitions?.length ?? 0}
          </BaseSubtitle>
        </Content>
      );
    }
  );
