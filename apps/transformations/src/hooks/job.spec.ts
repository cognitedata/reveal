import { describe, expect, test } from '@jest/globals';

import { groupJobMetrics } from './job';

describe('groupJobMetrics', () => {
  test('returns grouped job metrics', () => {
    const groupedJobMetrics = groupJobMetrics(mockMetricsSimple);
    expect(groupedJobMetrics).toHaveLength(2);

    const names = groupedJobMetrics.map(({ name }) => name);
    expect(names).toContain('raw.mock-db.mock-table.read');
    expect(names).toContain('assets.created');
  });

  test('excludes unknown actions', () => {
    const groupedJobMetrics = groupJobMetrics(mockMetricsSimple);
    expect(groupedJobMetrics).toHaveLength(2);
  });

  test('returns separate groups for cases multiple actions targeting same resource', () => {
    const groupedJobMetrics = groupJobMetrics(mockMetricsSameResource);
    expect(groupedJobMetrics).toHaveLength(2);

    const names = groupedJobMetrics.map(({ name }) => name);
    expect(names).toContain('assets.read');
    expect(names).toContain('assets.created');
  });

  test('returns separate groups for cases an action targeting multiple resource', () => {
    const groupedJobMetrics = groupJobMetrics(mockMetricsSameAction);
    expect(groupedJobMetrics).toHaveLength(2);

    const names = groupedJobMetrics.map(({ name }) => name);
    expect(names).toContain('events.read');
    expect(names).toContain('assets.created');
  });

  test('returns metric groups with read action at the beginning of the array, but keeps original order between items', () => {
    const groupedJobMetrics = groupJobMetrics(mockMetricsIncorrectActionOrder);
    expect(groupedJobMetrics).toHaveLength(4);

    const names = groupedJobMetrics.map(({ name }) => name);
    expect(names[0]).toBe('events.read');
    expect(names[1]).toBe('assets.read');
    expect(names[2]).toBe('assets.created');
    expect(names[3]).toBe('assets.updated');
  });

  test('returns the correct count when array is not ordered by timestamp', () => {
    const groupedJobMetrics = groupJobMetrics(
      mockMetricsIncorrectTimestampOrder
    );
    expect(groupedJobMetrics).toHaveLength(1);
    expect(groupedJobMetrics[0].count).toBe(250999);
  });
});

const mockMetricsSimple = [
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'raw.mock-db.mock-table.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'raw.mock-db.mock-table.read',
    count: 250999,
  },
  {
    id: 6474468,
    timestamp: 1658398832000,
    name: 'assets.created',
    count: 25036,
  },
  {
    id: 6474487,
    timestamp: 1658398842000,
    name: 'assets.created',
    count: 250999,
  },
  {
    id: 6474469,
    timestamp: 1658398832000,
    name: 'requests',
    count: 97,
  },
  {
    id: 6474488,
    timestamp: 1658398842000,
    name: 'requests',
    count: 451,
  },
  {
    id: 6474470,
    timestamp: 1658398832000,
    name: 'requestsWithoutRetries',
    count: 97,
  },
  {
    id: 6474489,
    timestamp: 1658398842000,
    name: 'requestsWithoutRetries',
    count: 451,
  },
];

const mockMetricsSameResource = [
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'assets.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'assets.read',
    count: 250999,
  },
  {
    id: 6474468,
    timestamp: 1658398832000,
    name: 'assets.created',
    count: 25036,
  },
  {
    id: 6474487,
    timestamp: 1658398842000,
    name: 'assets.created',
    count: 250999,
  },
];

const mockMetricsSameAction = [
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'events.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'events.read',
    count: 250999,
  },
  {
    id: 6474468,
    timestamp: 1658398832000,
    name: 'assets.created',
    count: 25036,
  },
  {
    id: 6474487,
    timestamp: 1658398842000,
    name: 'assets.created',
    count: 250999,
  },
];

const mockMetricsIncorrectActionOrder = [
  {
    id: 6474468,
    timestamp: 1658398832000,
    name: 'assets.created',
    count: 25036,
  },
  {
    id: 6474487,
    timestamp: 1658398842000,
    name: 'assets.created',
    count: 250999,
  },
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'events.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'events.read',
    count: 250999,
  },
  {
    id: 6474468,
    timestamp: 1658398832000,
    name: 'assets.updated',
    count: 25036,
  },
  {
    id: 6474487,
    timestamp: 1658398842000,
    name: 'assets.updated',
    count: 250999,
  },
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'assets.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'assets.read',
    count: 250999,
  },
];

const mockMetricsIncorrectTimestampOrder = [
  {
    id: 6474467,
    timestamp: 1658398832000,
    name: 'assets.read',
    count: 50036,
  },
  {
    id: 6474486,
    timestamp: 1658398842000,
    name: 'assets.read',
    count: 250999,
  },
  {
    id: 6474479,
    timestamp: 1658398837000,
    name: 'assets.read',
    count: 201126,
  },
];
