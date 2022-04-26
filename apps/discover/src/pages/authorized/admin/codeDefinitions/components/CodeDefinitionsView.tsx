import { useMemo } from 'react';

import { Body, Icon, Title } from '@cognite/cogs.js';

import EmptyState from 'components/emptyState';

import {
  BreadcrumbWrapper,
  CodeDefinitionsWrapper,
  EmptyStateWrapper,
  TitleWrapper,
} from '../elements';
import { CodeDefinition } from '../types';

import { CodeDefinitionsList } from './CodeDefinitionsList';

interface Props {
  title: string;
  isLoading: boolean;
  codeDefinitions: CodeDefinition[];
  onLegendUpdated: ({
    code,
    definition,
  }: {
    code: string;
    definition: string;
  }) => void;
}

export const CodeDefinitionsView: React.FC<Props> = ({
  title,
  isLoading,
  codeDefinitions,
  onLegendUpdated,
}) => {
  const CodeDefinitionsEmptyState = useMemo(() => {
    if (codeDefinitions.length === 0) {
      return (
        <EmptyStateWrapper>
          <EmptyState isLoading={isLoading} />
        </EmptyStateWrapper>
      );
    }

    return null;
  }, [codeDefinitions, isLoading]);

  return (
    <CodeDefinitionsWrapper>
      <BreadcrumbWrapper>
        <Body level={2}>Code definitions</Body>
        <Icon type="Breadcrumb" />
        <Body level={2} strong>
          {title}
        </Body>
      </BreadcrumbWrapper>
      <TitleWrapper>
        <Title level={2}>{title}</Title>
      </TitleWrapper>

      {CodeDefinitionsEmptyState}

      {codeDefinitions && (
        <CodeDefinitionsList
          codeDefinitions={codeDefinitions}
          onLegendUpdated={onLegendUpdated}
        />
      )}
    </CodeDefinitionsWrapper>
  );
};
