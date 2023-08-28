/**
 * Event InfoBox
 */

import { MouseEvent, useCallback } from 'react';

import { LoadingRow } from '@charts-app/components/Common/SidebarElements';
import { formatDate } from '@charts-app/utils/date';
import {
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';
import { GeneralDetails } from '@data-exploration/components';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';

import { Button, Body } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';

import { EventDetails, AssetDetailsWrapper } from './elements';

export const defaultTranslations = makeDefaultTranslations(
  'Type',
  'Sub type',
  'Updated',
  'Created',
  'Event start and end time are the same, it may not be visible in the chart graph area.',
  'Start',
  'End',
  'External ID',
  'Root asset',
  'Back',
  'View details',
  'Selected results',
  'Other results',
  'Clear all',
  'Sort',
  'Oldest',
  'Newest'
);

type Props = {
  event: Partial<CogniteEvent>;
  onToggleEvent: (id: number | undefined) => void;
  onViewEvent: (id: number | undefined) => void;
  loading?: boolean;
  selected?: boolean;
  translations?: typeof defaultTranslations;
};

const EventInfoBox = ({
  event,
  onToggleEvent,
  onViewEvent,
  selected = false,
  loading = false,
  translations,
}: Props) => {
  const diff = dayjs(event.endTime).diff(dayjs(event.startTime));
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const handleToggleSelection = useCallback(() => {
    onToggleEvent(event.id);
  }, []);

  const handleViewEvent = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onViewEvent(event.id);
    },
    [event, onViewEvent]
  );

  return (
    <EventDetails $active={selected} onClick={handleToggleSelection}>
      {loading ? (
        <LoadingRow lines={3} />
      ) : (
        <>
          <Row>
            <Col span={12}>
              <Body size="xx-small">{t.Type}:</Body>
              <Body size="xx-small" strong>
                {event.type}
              </Body>
            </Col>
            <Col span={12}>
              <Body size="xx-small">{t['Sub type']}:</Body>
              <Body size="xx-small" strong>
                {event.subtype}
              </Body>
            </Col>
          </Row>
          {diff <= 0 ? (
            <p className="hint">
              {
                t[
                  'Event start and end time are the same, it may not be visible in the chart graph area.'
                ]
              }
            </p>
          ) : (
            ''
          )}
          <Row>
            <Col span={12}>
              <Body size="xx-small">{t.Start}:</Body>
              <Body size="xx-small" strong>
                {formatDate(event.startTime)}
              </Body>
            </Col>
            <Col span={12}>
              <Body size="xx-small">{t.End}:</Body>
              <Body size="xx-small" strong>
                {formatDate(event.endTime)}
              </Body>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Body size="xx-small">{t['External ID']}:</Body>
              <Body size="xx-small" strong title={event.externalId}>
                {event.externalId}
              </Body>
            </Col>
            <Col span={12}>
              <AssetDetailsWrapper as="div" className="cogs-micro">
                {event.id && (
                  <GeneralDetails.AssetsItem
                    assetIds={event.assetIds}
                    type="event"
                    linkId={event.id}
                    direction="column"
                  />
                )}
              </AssetDetailsWrapper>
            </Col>
          </Row>
          <Row justify="end">
            <Col>
              <Button
                type="primary"
                size="small"
                onClick={(evt) => handleViewEvent(evt)}
                toggled
              >
                {t['View details']}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </EventDetails>
  );
};

EventInfoBox.translationKeys = translationKeys(defaultTranslations);
EventInfoBox.defaultTranslations = defaultTranslations;
EventInfoBox.translationNamespace = 'EventInfoBox';

export default EventInfoBox;
