import React, { useCallback, useMemo, useRef } from 'react';

import styled from 'styled-components';

import pluralize from 'pluralize';

import { Body } from '@cognite/cogs.js';

import { useKeyboardListener } from '../../hooks/listeners/useKeyboardListener';
import { useNavigation } from '../../hooks/useNavigation';
import { useSearchFilterParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useFDM } from '../../providers/FDMProvider';
import { caseToWords } from '../../utils/string';

import { AIListItemIcon } from './components/AIListItemIcon';
interface Props {
  query?: string;
  onSelectionClick?: () => void;
}

export const AISearchPreview: React.FC<Props> = React.memo(
  ({ query, onSelectionClick }) => {
    const client = useFDM();

    const [filterParams] = useSearchFilterParams();
    const navigate = useNavigation();

    const { t } = useTranslation();

    const handleKeyListener = useCallback(
      (code: string, event: KeyboardEvent) => {
        if (code === 'Enter' && query) {
          navigate.toSearchPage(query, filterParams, {
            ignoreType: true,
            enableAISearch: true,
          });
          onSelectionClick?.();
        }

        const divs = [
          ...document.querySelectorAll('.ai-search-item').values(),
        ] as HTMLElement[];

        if (
          code === 'Tab' &&
          !query &&
          !divs.some((el) => document.activeElement === el)
        ) {
          divs[0].focus();
          event.stopPropagation();
          event.preventDefault();
        }
        if (code === 'Enter') {
          divs.find((el) => document.activeElement === el)?.click();
        }
      },
      [navigate, query, filterParams, onSelectionClick]
    );
    useKeyboardListener(handleKeyListener);

    const items = useMemo(() => {
      const dataTypeNumber = client.allDataTypes.find((el) =>
        el.fields.some(
          (field) =>
            field.type.name.includes('Int') || field.type.name.includes('Float')
        )
      );
      const dataTypeString = client.allDataTypes.find(
        (el) =>
          el.name !== dataTypeNumber?.name &&
          el.fields.some((field) => field.type.name === 'String')
      );
      const dataTypeGeneric = client.allDataTypes.find(
        (el) =>
          el.name !== dataTypeString?.name && el.name !== dataTypeNumber?.name
      );

      return [
        ...(dataTypeGeneric
          ? [
              t('AI_SUGGESTION_SEARCH_1', {
                prefix: t('AI_HELP_ME_FIND'),
                type: pluralize(
                  caseToWords(dataTypeString?.name || '').toLowerCase()
                ),
              }),
            ]
          : []),
        ...(dataTypeString
          ? [
              t('AI_SUGGESTION_SEARCH_2', {
                prefix: t('AI_HELP_ME_FIND'),
                type: pluralize(
                  caseToWords(dataTypeString?.name || '').toLowerCase()
                ),
                field: dataTypeString?.fields
                  .find((field) => field.type.name === 'String')
                  ?.name.toLowerCase(),
              }),
            ]
          : []),
        ...(dataTypeNumber
          ? [
              t('AI_SUGGESTION_SEARCH_3', {
                prefix: t('AI_HELP_ME_FIND'),
                type: pluralize(
                  caseToWords(dataTypeString?.name || '').toLowerCase()
                ),
                field: dataTypeNumber?.fields
                  .find(
                    (field) =>
                      field.type.name.includes('Int') ||
                      field.type.name.includes('Float')
                  )
                  ?.name.toLowerCase(),
              }),
            ]
          : []),
      ];
    }, [client, t]);

    const ref = useRef<HTMLDivElement>(null);

    if (query) {
      return null;
    }

    // TODO fix suggestions
    return (
      <Container>
        <Body muted size="x-small" className="header">
          {t('AI_EXAMPLES')}
        </Body>
        {items.map((recommendation, index) => (
          <Item
            ref={index === 0 ? ref : undefined}
            className="ai-search-item"
            key={recommendation}
            tabIndex={index + 1}
            onClick={() => {
              navigate.toSearchPage(
                recommendation.replace(t('AI_HELP_ME_FIND'), ''),
                filterParams,
                {
                  enableAISearch: true,
                }
              );
              onSelectionClick?.();
            }}
          >
            <div className="icon-wrapper">
              <AIListItemIcon />
            </div>
            <Body size="small">{recommendation}</Body>
          </Item>
        ))}
      </Container>
    );
  }
);

const Container = styled.div`
  width: 100%;
  /* height: 100px; */
  background-color: white;
  position: relative;
  top: -1px;
  /* padding: 16px; */
  padding-top: 0px;
  border-top: none;

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow: hidden;

  .header {
    padding: 12px 16px 8px;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;

  .icon-wrapper {
    padding: 6px;
    background: var(
      --surface-status-ai-muted-default,
      rgba(111, 59, 228, 0.08)
    );
    height: 28px;
    width: 28px;
    border-radius: 4px;
  }

  transition: 0.3s all;
  cursor: pointer;

  &&:hover,
  &&:focus {
    background: var(--surface-interactive-hover, rgba(34, 42, 83, 0.06));
  }
`;
