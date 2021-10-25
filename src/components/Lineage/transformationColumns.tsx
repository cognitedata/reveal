import React from 'react';
import { stringCompare, getStringCdfEnv } from 'utils/utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import moment from 'moment';
import { Icon } from '@cognite/cogs.js';
import { DataSet } from 'utils/types';
import HiddenTransformation from './HiddenTranformation';

const transformationsColumns = (dataSet: DataSet) => [
  {
    key: 'name',
    title: 'Transform',
    // eslint-disable-next-line no-restricted-globals
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
    render: (_text: string, transform: any) =>
      transform.hidden ? (
        <HiddenTransformation
          transformation={transform.storedData}
          dataSet={dataSet}
        />
      ) : (
        <a
          onClick={() =>
            trackEvent(
              'DataSets.LineageFlow.Clicked on an external transformation'
            )
          }
          href={`/${sdk.project}/transformations/${transform.id}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {transform.name}
        </a>
      ),
  },
  {
    key: 'created',
    title: 'Created',
    render: (_text: string, transform: any) => (
      <p>
        {transform.hidden ? (
          <p style={{ fontStyle: 'italic' }}> Not available</p>
        ) : (
          moment(transform.created).toString()
        )}
      </p>
    ),
  },
  {
    key: 'updated',
    title: 'Updated',
    render: (_text: string, transform: any) => (
      <p>
        {transform.hidden ? (
          <p style={{ fontStyle: 'italic' }}> Not available</p>
        ) : (
          moment(transform.updated).toString()
        )}
      </p>
    ),
  },
  {
    key: 'owner',
    title: 'Owner',
    render(_text: string, transform: any) {
      if (transform.hidden) {
        return <p style={{ fontStyle: 'italic' }}> Not available</p>;
      }
      if (transform.ownerIsCurrentUser) {
        return (
          <>
            <Icon type="User" /> me
          </>
        );
      }
      if (transform.owner) {
        return transform.owner.user;
      }
      return '';
    },
  },
];

export default transformationsColumns;
