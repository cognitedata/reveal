import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Accordion, Colors, Divider, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

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
            Let’s start with a quick explanation of how this connection will
            work! A broker is a server that receives messages from various
            sources. Every message is tagged with a topic (a string), and to get
            these messages into CDF, we subscribe to the topics. You subscribe
            to a topic by using topic filter strings. The broker will return
            messages tagged with a topic matching your topic filter and give the
            data to CDF.
            <br />
            <br />
            For example, say that in your house there are multiple floors. Each
            floor has several rooms, and there are several sensors in each room.
            You can subscribe to one topic by writing the following topic
            filter:
          </GuideParagraph>

          <GuideCode>Ground floor / Living room / Temperature</GuideCode>
          <GuideParagraph>
            This topic filter string will match an identical topic string in the
            broker and give you the messages related to the temperature in the
            living room on the ground floor. As you see in the example, both
            topics and topic filters have one or more topic levels, and each
            topic level is separated by a forward slash.
            <br />
            <br />
            You can also subscribe to multiple topics at the same time by using
            wildcards. To subscribe to multiple topics, your topic filter has to
            contain a plus sign or a hash.
            <br />
            <br />A plus sign (+) replaces one topic level. That means it will
            include all the topics in a topic level. In the example below, the
            topic filter would give you the messages related to the temperature
            of every room on the ground floor:
          </GuideParagraph>
          <GuideCode>Ground floor / + / Temperature</GuideCode>
          <GuideParagraph>
            A hash (#) is used at the end of a topic filter. It will give you
            messages from the current and following topic levels. In the example
            below, the topic filter would give you the messages related to the
            all the sensors (temperature, time, noise, etc.) of every room on
            the ground floor:
          </GuideParagraph>
          <GuideCode>Ground floor / #</GuideCode>
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
            Choose the format your messages will have when they come into CDF.
            You can choose existing formats or build a custom format by using
            Kuiper.
            <br />
            <br />
            <strong>Custom formats</strong>
            <br />
            Kuiper is a JSON to JSON transform and templating language. Use this
            code to define what format your code should have in CDF. You do this
            by choosing what values in CDF equals of values from your source.
            <br />
            <br />
            To help you get started, we’ve given you an example of a
            configuration. In the example, you can see that your source value
            named "datapoint" will be named "type" when it comes into CDF. Read
            our{' '}
            <a href="https://github.com/cognitedata/pluto/blob/main/kuiper_in_pluto.md">
              detailed documentation{' '}
            </a>{' '}
            to learn how to create custom formats.
            <br />
            <br />
            Custom created formats can be used by other topic filters too. Be
            aware that editing a custom format for one topic filter will affect
            the format being used anywhere else too.
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
            In order to get the data into CDF, you need a ‘sink’. A sink is a
            thing that batches data from the broker into CDF. You can choose an
            existing sink or create a new one.
            <br />
            <br />
            If you’re creating a new sink, you also have to give this new sink
            permission to upload data to CDF. This is done by choosing an
            authentication method.
            <br />
            <br />
            <strong>Use an existing sink</strong>
            <br />
            <ul>
              <li>
                Existing sinks: Choose an existing sink in CDF to get you data
                in CDF. No additional authentication is needed as it already has
                existing authentication.
              </li>
            </ul>
            <strong>Create new sink as current user:</strong>
            <br />
            <ul>
              <li>Create an unique ID for your new sink.</li>
              <li>
                Your own user credentials will be used to create the new sink.
                This means the sink will use your credentials towards CDF.
              </li>
            </ul>
            <strong>Create new sink with client credentials:</strong>
            <br />
            <ul>
              <li>Sink external ID: Create an unique ID for your new sink.</li>
              <li>
                Use client credentials to give this new sink permission to
                upload data to CDF. That means this sink is registered on client
                credentials.
              </li>
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
