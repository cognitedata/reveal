import { InternalEventsData } from 'app/domain/events/internal/types';

export const getEventDataFixture = (
  event?: Partial<InternalEventsData>
): InternalEventsData => {
  return {
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    id: 123,
    ...event,
  };
};

export const getGoodEventsData: InternalEventsData[] = [
  getEventDataFixture({
    metadata: { title: 'test', url: 'https://google.com' },
  }),
  getEventDataFixture({
    metadata: { CDF_ANNO_id: '123' },
  }),
];

export const getBadEventsDataFixture: InternalEventsData[] = [
  getEventDataFixture({
    metadata: 'string' as any,
  }),
];
