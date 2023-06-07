/**
 * Event Detail Sidebar
 *
 * Show one event instance, all details including metadata
 */

import { memo, useCallback, useState, ChangeEvent } from 'react';

import {
  ContentContainer,
  LoadingRow,
  OverlayContentOverflowWrapper,
  SidebarHeaderActions,
} from '@charts-app/components/Common/SidebarElements';
import { useCdfEvent } from '@charts-app/hooks/cdf-assets';
import { activeEventIdAtom } from '@charts-app/models/event-results/atom';
import { formatDate } from '@charts-app/utils/date';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useRecoilState } from 'recoil';

import { Body, Button, Title, Row, Col, Input } from '@cognite/cogs.js';

import { EventDetailBox, MetadataWrapItem } from './elements';

const MetadataRow = ({ label, value }: { label: string; value: any }) => (
  <p>
    {label}:{' '}
    <Body level={2} style={{ wordBreak: 'break-word' }} strong>
      {value}
    </Body>
  </p>
);

const MetadataItemWithMore = memo(
  ({ text, more, less }: { text: string; more: string; less: string }) => {
    const len = text.length;
    const limit = 37;
    let firstPart = text;

    const [loadMore, setLoadMore] = useState(false);

    if (len > limit) {
      firstPart = text.substring(0, limit);
    }
    return (
      <p>
        {len > limit && !loadMore ? <>{`${firstPart}...`}</> : <>{text}</>}
        <br />
        {len > limit && (
          <Button
            type="ghost"
            size="small"
            onClick={() => setLoadMore((prevState) => !prevState)}
          >
            {loadMore ? less : more}
          </Button>
        )}
      </p>
    );
  }
);

export const defaultTranslations = makeDefaultTranslations(
  'Back to event results',
  'General',
  'Metadata',
  'Type',
  'Subtype',
  'Description',
  'External ID',
  'Start time',
  'End time',
  'Dataset',
  'Linked asset(s)',
  'Created at',
  'Updated at',
  'No metadata available',
  'Hide empty',
  'Show empty',
  'Show more',
  'Show less'
);

type Props = {
  onCloseEventDetail: () => void;
  translations?: typeof defaultTranslations;
};
const EventDetailsSidebar = memo(
  ({ onCloseEventDetail, translations }: Props) => {
    const t = {
      ...defaultTranslations,
      ...translations,
    };

    const [hideEmpty, setHideEmpty] = useState(false);
    const [metadataSearchTerm, setMetadataSearchTerm] = useState('');

    const [activeEvent, setActiveEvent] = useRecoilState(activeEventIdAtom);

    const handleCloseEventDetail = useCallback(() => {
      setActiveEvent(undefined);
      onCloseEventDetail();
    }, [activeEvent, setActiveEvent, onCloseEventDetail]);

    const handleHideEmptyMetadat = useCallback(() => {
      setHideEmpty((prevVal) => !prevVal);
    }, [hideEmpty, setHideEmpty]);

    const handleMetadataSearch = useCallback(
      (evt: ChangeEvent<HTMLInputElement>) => {
        setMetadataSearchTerm(evt.target.value);
      },
      [metadataSearchTerm, setMetadataSearchTerm]
    );

    const { data, isFetching } = useCdfEvent(activeEvent);

    return (
      <OverlayContentOverflowWrapper>
        <ContentContainer>
          <SidebarHeaderActions>
            <Button
              onClick={handleCloseEventDetail}
              icon="ArrowLeft"
              size="small"
              aria-label="Back"
            >
              {t['Back to event results']}
            </Button>
          </SidebarHeaderActions>
          <EventDetailBox>
            <Title level={5}>{t.General}</Title>
            {isFetching && <LoadingRow lines={9} />}
            {data ? (
              <article>
                <MetadataRow label={t.Type} value={data.type} />
                <MetadataRow label={t.Subtype} value={data.subtype} />
                <MetadataRow label={t.Description} value={data.description} />
                <MetadataRow label={t['External ID']} value={data.externalId} />
                <MetadataRow label={t['Start time']} value={data.startTime} />
                <MetadataRow label={t['End time']} value={data.endTime} />
                <MetadataRow label={t.Dataset} value={data.dataSetId} />
                <MetadataRow
                  label={t['Linked asset(s)']}
                  value={data.assetIds?.length ? data.assetIds[0] : ''}
                />
                <Row cols={2}>
                  <Col span={1}>
                    <MetadataRow
                      label={t['Created at']}
                      value={formatDate(data.createdTime)}
                    />
                  </Col>
                  <Col span={1}>
                    <MetadataRow
                      label={t['Updated at']}
                      value={formatDate(data.lastUpdatedTime)}
                    />
                  </Col>
                </Row>
              </article>
            ) : null}
          </EventDetailBox>
          <EventDetailBox>
            <Title level={5}>{t.Metadata}</Title>

            <article>
              {data && data.metadata ? (
                <>
                  <Row cols={12}>
                    <Col span={7}>
                      <Input
                        size="small"
                        name="metadataSearchTerm"
                        onChange={(e) => handleMetadataSearch(e)}
                        fullWidth
                      />
                    </Col>
                    <Col span={5}>
                      <Button
                        size="small"
                        onClick={handleHideEmptyMetadat}
                        toggled={hideEmpty}
                        style={{ display: 'block' }}
                      >
                        {hideEmpty ? t['Show empty'] : t['Hide empty']}
                      </Button>
                    </Col>
                  </Row>
                  <br />
                  {Object.keys(data.metadata)
                    .filter((metaKey) => {
                      if (metadataSearchTerm === '') return metaKey;

                      // Search area i.e. metadata key and value
                      const searchScope = (
                        metaKey + (data.metadata ? data.metadata[metaKey] : '')
                      ).toLowerCase();

                      return searchScope.includes(
                        metadataSearchTerm.toLowerCase()
                      )
                        ? metaKey
                        : '';
                    })
                    .filter((metaKey) => {
                      const isEmpty =
                        data.metadata &&
                        (data.metadata[metaKey] === '' ||
                          data.metadata[metaKey] === '-');
                      return hideEmpty && isEmpty ? '' : metaKey;
                    })
                    .map((metaKey) => (
                      <Row key={metaKey} cols={2}>
                        <Col span={1}>
                          <MetadataWrapItem>{metaKey}</MetadataWrapItem>
                        </Col>
                        <Col span={1}>
                          <MetadataWrapItem>
                            <Body level={2} as="div" strong>
                              {data.metadata &&
                              data.metadata[metaKey] !== '' ? (
                                <MetadataItemWithMore
                                  more={t['Show more']}
                                  less={t['Show less']}
                                  text={data.metadata[metaKey]}
                                />
                              ) : (
                                '-'
                              )}
                            </Body>
                          </MetadataWrapItem>
                        </Col>
                      </Row>
                    ))}
                </>
              ) : (
                <p>{t['No metadata available']}</p>
              )}
            </article>
          </EventDetailBox>
        </ContentContainer>
      </OverlayContentOverflowWrapper>
    );
  }
);

export default EventDetailsSidebar;
