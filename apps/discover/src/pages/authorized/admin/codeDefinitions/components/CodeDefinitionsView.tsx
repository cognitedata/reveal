import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

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
  codeDefinitions?: CodeDefinition[];
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
  codeDefinitions,
  onLegendUpdated,
}) => {
  const CodeDefinitionsEmptyState = useMemo(() => {
    /**
     * if codeDefinitions is undefined it means request is not finished so isLoading is true, we show loading state
     * if codeDefinitions is defined but empty then isLoading is false, we show empty state
     * */
    if (!codeDefinitions || codeDefinitions?.length === 0) {
      return (
        <EmptyStateWrapper>
          <EmptyState isLoading={isUndefined(codeDefinitions)} />
        </EmptyStateWrapper>
      );
    }

    return null;
  }, [codeDefinitions]);

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
