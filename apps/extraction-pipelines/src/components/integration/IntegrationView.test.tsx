import React from 'react';
import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import moment from 'moment';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import { getMockResponse } from 'utils/mockResponse';
import { INTEGRATIONS } from 'utils/baseURL';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';
import { uppercaseFirstWord } from 'utils/primitivesUtils';
import {
  NO_META_DATA,
  NO_RAW_TABLES_MESSAGE,
  NO_SCHEDULE,
  NO_DATA_SET_ID_SET,
  SINGLE_INTEGRATION,
} from 'utils/constants';
import { IntegrationView } from 'components/integration/IntegrationView';
import { trackUsage } from 'utils/Metrics';

describe('IntegrationView', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Displays integration', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<IntegrationView />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
      route: `${INTEGRATIONS}/${mockIntegration.id}`,
    });
    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_INTEGRATION, {
      id: mockIntegration.id,
    });

    expect(
      screen.getAllByText(new RegExp(TableHeadings.LATEST_RUN, 'i'))
    ).toBeDefined();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.DESCRIPTION, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.description)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.EXTERNAL_ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();

    expect(screen.getByText(TableHeadings.LAST_SEEN)).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(moment(mockIntegration.lastSeen).format(DATE_FORMAT), 'i')
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(TableHeadings.SCHEDULE, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText('At 09:00 AM')).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_TIME, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(moment(mockIntegration.createdTime).format(DATE_FORMAT), 'i')
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(TableHeadings.DATA_SET, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(mockIntegration.dataSet.name, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(mockIntegration.dataSetId, 'i'))
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(new RegExp(DetailFieldNames.RAW_TABLE, 'i'))
    ).toBeDefined();
    mockIntegration.rawTables.forEach(({ tableName, dbName }) => {
      expect(screen.getByText(dbName)).toBeInTheDocument();
      expect(screen.getByText(tableName)).toBeInTheDocument();
    });
    expect(
      screen.getByText(new RegExp(DetailFieldNames.META_DATA, 'i'))
    ).toBeInTheDocument();
    Object.entries(mockIntegration.metadata).forEach(([k, v]) => {
      expect(
        screen.getByText(new RegExp(uppercaseFirstWord(k), 'i'))
      ).toBeInTheDocument();
      expect(screen.getByText(v)).toBeInTheDocument();
    });
  });

  test('Renders with minimal required info', () => {
    const mockIntegration = {
      id: 123,
      externalId: 'lisa.external.id',
      name: 'My integration',
    };
    renderWithSelectedIntegrationContext(<IntegrationView />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
      route: `${INTEGRATIONS}/${mockIntegration.id}`,
    });
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();
    expect(screen.getByText(NO_META_DATA)).toBeInTheDocument();
    expect(screen.getByText(NO_SCHEDULE)).toBeInTheDocument();
    expect(screen.getByText(NO_RAW_TABLES_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(NO_DATA_SET_ID_SET)).toBeInTheDocument();
  });
});
