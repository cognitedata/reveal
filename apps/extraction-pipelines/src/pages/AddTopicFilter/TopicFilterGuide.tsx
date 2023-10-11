import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Accordion, Colors, Divider, Flex } from '@cognite/cogs.js';

import { Trans, useTranslation } from '../../common';

import { Section } from './Section';
import { ExpandOptions } from './types';

export const TopicFilterGuide = ({
  expandedOption,
  onChange,
  className,
}: {
  expandedOption: ExpandOptions;
  onChange: (key: ExpandOptions) => void;
  className?: string;
}) => {
  const { t } = useTranslation();

  const onExpandChange = useCallback(
    (key: ExpandOptions, expanded: boolean) => {
      if (expanded) {
        onChange(key);
      } else {
        onChange(ExpandOptions.None);
      }
    },
    [onChange]
  );
  return (
    <GuideContainer className={className}>
      <Section title={t('form-setup-guide')} subtitle=""></Section>
      <Accordion
        title={t('form-step-1-x', { step: t('topic-filter_other') })}
        type="ghost"
        expanded={expandedOption === ExpandOptions.TopicFilters}
        onChange={(expanded) =>
          onExpandChange(ExpandOptions.TopicFilters, expanded)
        }
      >
        <Flex direction="column" gap={24} style={{ width: '100%' }}>
          <GuideParagraph>
            {t('topic-filter-guide-step-1-para-1')}
            <br />
            <br />
            {t('topic-filter-guide-step-1-para-2')}
          </GuideParagraph>

          <GuideCode>{t('topic-filter-guide-step-1-example-1')}</GuideCode>
          <GuideParagraph>
            {t('topic-filter-guide-step-1-para-3')}
            <br />
            <br />
            {t('topic-filter-guide-step-1-para-4')}
            <br />
            <br />
            {t('topic-filter-guide-step-1-para-5')}
          </GuideParagraph>
          <GuideCode> {t('topic-filter-guide-step-1-example-2')}</GuideCode>
          <GuideParagraph>
            {t('topic-filter-guide-step-1-para-6')}
          </GuideParagraph>
          <GuideCode>{t('topic-filter-guide-step-1-example-3')}</GuideCode>
        </Flex>
      </Accordion>
      <Divider />
      <Accordion
        title={t('form-step-2-x', { step: t('format-field') })}
        type="ghost"
        expanded={expandedOption === ExpandOptions.Format}
        onChange={(expanded) => onExpandChange(ExpandOptions.Format, expanded)}
      >
        <Flex direction="column" gap={24} style={{ width: '100%' }}>
          <GuideParagraph>
            {t('topic-filter-guide-step-2-para-1')}
            <br />
            <br />
            <strong>{t('topic-filter-guide-step-2-custom-formats')}</strong>
            <br />
            {t('topic-filter-guide-step-2-para-2')}
            <br />
            <br />
            <Trans
              t={t as any}
              i18nKey="topic-filter-guide-step-2-para-3"
              components={{
                1: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a href="https://github.com/cognitedata/pluto/blob/main/kuiper_in_pluto.md"></a>
                ),
              }}
            />
            <br />
            <br />
            {t('topic-filter-guide-step-2-para-4')}
          </GuideParagraph>
        </Flex>
      </Accordion>
      <Divider />
      <Accordion
        title={t('form-step-3-x', { step: t('form-sink') })}
        type="ghost"
        expanded={expandedOption === ExpandOptions.Sync}
        onChange={(expanded) => onExpandChange(ExpandOptions.Sync, expanded)}
      >
        <Flex direction="column" gap={24} style={{ width: '100%' }}>
          <GuideParagraph>
            {t('topic-filter-guide-step-3-para-1')}
            <br />
            <br />
            {t('topic-filter-guide-step-3-para-2')}
            <br />
            <br />
            <strong>{t('topic-filter-guide-step-3-cat-1')}</strong>
            <br />
            <ul>
              <li>{t('topic-filter-guide-step-3-cat-1-bullet')}</li>
            </ul>
            <strong>{t('topic-filter-guide-step-3-cat-2')}</strong>
            <br />
            <ul>
              <li>{t('topic-filter-guide-step-3-cat-2-bullet-1')}</li>
              <li>{t('topic-filter-guide-step-3-cat-2-bullet-2')}</li>
            </ul>
            <strong>{t('topic-filter-guide-step-3-cat-3')}</strong>
            <br />
            <ul>
              <li>{t('topic-filter-guide-step-3-cat-3-bullet-1')}</li>
              <li>{t('topic-filter-guide-step-3-cat-3-bullet-2')}</li>
            </ul>
          </GuideParagraph>
        </Flex>
      </Accordion>
      <Divider />
    </GuideContainer>
  );
};

const GuideContainer = styled.div`
  display: flex;
  padding: 64px 108px 64px 40px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  flex: 1 1 616px;
  align-self: stretch;
  border-left: 1px solid ${Colors['border--interactive--default']};
  background: #fbfcfd;
`;

const GuideParagraph = styled.p`
  font-size: 14px;
`;

const GuideCode = styled.div`
  display: flex;
  align-self: stretch;
  border-radius: 4px;
  background: #f1f2f3;
  padding: 16px;
  color: var(--text-icon-strong, rgba(0, 0, 0, 0.9));
  font-family: Source Code Pro, sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 153.846% */
  letter-spacing: -0.039px;
`;
