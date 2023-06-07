/**
 * Event InfoBox
 */

import { MouseEvent, useCallback } from 'react';

import { LoadingRow } from '@charts-app/components/Common/SidebarElements';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import { formatDate } from '@charts-app/utils/date';
import { makeDefaultTranslations, translationKeys } from '@charts-app/utils/translations';

import { Button, Micro } from '@cognite/cogs.js';
import { AssetsItem } from '@cognite/data-exploration';
import { CogniteEvent } from '@cognite/sdk';

import { EventDetails } from './elements';

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
  'View details'
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
              <Micro as="div">{t.Type}:</Micro>
              <Micro as="div" strong>
                {event.type}
              </Micro>
            </Col>
            <Col span={12}>
              <Micro as="div">{t['Sub type']}:</Micro>
              <Micro as="div" strong>
                {event.subtype}
              </Micro>
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
              <Micro as="div">{t.Start}:</Micro>
              <Micro as="div" strong>
                {formatDate(event.startTime)}
              </Micro>
            </Col>
            <Col span={12}>
              <Micro as="div">{t.End}:</Micro>
              <Micro as="div" strong>
                {formatDate(event.endTime)}
              </Micro>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Micro as="div">{t['External ID']}:</Micro>
              <Micro as="div" strong title={event.externalId}>
                {event.externalId}
              </Micro>
            </Col>
            <Col span={12}>
              <Micro as="div">
                {event.id && (
                  <AssetsItem
                    assetIds={event.assetIds}
                    type="event"
                    linkId={event.id}
                  />
                )}
              </Micro>
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
