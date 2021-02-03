import React from 'react';
import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import moment from 'moment';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';
import { IntegrationView } from './IntegrationView';
import { getMockResponse } from '../../utils/mockResponse';
import { INTEGRATIONS } from '../../utils/baseURL';
import { TableHeadings } from '../table/IntegrationTableCol';
import { DetailFieldNames } from '../../model/Integration';
import { DATE_FORMAT } from '../TimeDisplay/TimeDisplay';
import { uppercaseFirstWord } from '../../utils/primitivesUtils';

describe('IntegrationView', () => {
  test('Displays integration', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<IntegrationView />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
      route: `${INTEGRATIONS}/${mockIntegration.id}`,
    });
    expect(
      screen.getByText(new RegExp(TableHeadings.LATEST_RUN, 'i'))
    ).toBeInTheDocument();

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
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeInTheDocument();
    mockIntegration.contacts.forEach(({ email, name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(email)).toBeInTheDocument();
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
});
