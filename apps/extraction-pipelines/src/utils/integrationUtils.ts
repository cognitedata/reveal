import moment from 'moment';
import { MutateFunction } from 'react-query';
import {
  LastStatuses,
  LatestStatusesDateTime,
  Status,
  StatusObj,
} from '../model/Status';
import { Integration } from '../model/Integration';
import { DetailsCol } from '../components/table/details/DetailsCols';
import { IntegrationUpdateSpec } from './IntegrationsAPI';
import { SDKError } from '../model/SDKErrors';
import { UseUpdateIntegrationVariables } from '../hooks/useUpdateIntegration';
import { TableHeadings } from '../components/table/IntegrationTableCol';
import { DATE_FORMAT } from '../components/TimeDisplay/TimeDisplay';

const mapToMoment = ({
  lastFailure,
  lastSuccess,
}: LastStatuses): Pick<
  LatestStatusesDateTime,
  'successDateTime' | 'failDateTime'
> => {
  return {
    successDateTime: lastSuccess === 0 ? null : moment(lastSuccess),
    failDateTime: lastFailure === 0 ? null : moment(lastFailure),
  };
};
export const calculateStatus = (status: LastStatuses): StatusObj => {
  return calculate(mapToMoment(status));
};

export const calculate = ({
  successDateTime,
  failDateTime,
}: LatestStatusesDateTime): StatusObj => {
  if (
    (!!successDateTime && failDateTime === null) ||
    (!!successDateTime && successDateTime.isAfter(failDateTime))
  ) {
    return {
      status: Status.OK,
      time: successDateTime,
    };
  }
  if (
    (!!failDateTime && successDateTime === null) ||
    (!!failDateTime && failDateTime.isAfter(successDateTime))
  ) {
    return {
      status: Status.FAIL,
      time: failDateTime,
    };
  }
  if (failDateTime && successDateTime && failDateTime.isSame(successDateTime)) {
    return {
      status: Status.FAIL,
      time: failDateTime,
    };
  }
  return {
    status: Status.NOT_ACTIVATED,
    time: null,
  };
};

export enum DetailFieldNames {
  EXTERNAL_ID = 'External id',
  DESCRIPTION = 'Description',
  CREATED_TIME = 'Created time',
  META_DATA = 'Meta data',
  CONTACT = 'Contact',
  OWNER = 'Owner',
}
export const mapIntegration = (integration: Integration): DetailsCol[] => {
  const latest = {
    lastSuccess: integration?.lastSuccess,
    lastFailure: integration?.lastFailure,
  };
  const status = calculateStatus(latest);
  return [
    {
      label: TableHeadings.NAME,
      accessor: 'name',
      value: integration.name,
      isEditable: true,
      inputType: 'text',
    },
    {
      label: DetailFieldNames.EXTERNAL_ID,
      accessor: 'externalId',
      value: integration.externalId,
      isEditable: false,
    },
    {
      label: DetailFieldNames.DESCRIPTION,
      accessor: 'description',
      value: integration.description,
      isEditable: true,
      inputType: 'textarea',
    },
    {
      label: DetailFieldNames.CREATED_TIME,
      accessor: 'createdTime',
      value: integration.createdTime,
      isEditable: false,
    },
    {
      label: TableHeadings.STATUS,
      accessor: 'status',
      value: status.status,
      isEditable: false,
    },
    {
      label: TableHeadings.LATEST_RUN,
      accessor: 'latestRun',
      value: status.time?.format(DATE_FORMAT),
      isEditable: false,
    },
    {
      label: TableHeadings.LAST_SEEN,
      accessor: 'latestRun',
      value: integration.lastSeen,
      isEditable: false,
    },
    {
      label: TableHeadings.SCHEDULE,
      accessor: 'schedule',
      value: integration.schedule,
      isEditable: false,
    },
    {
      label: TableHeadings.DATA_SET,
      accessor: 'dataSetId',
      value: integration.dataSetId,
      isEditable: false,
    },
  ];
};

export interface CreateUpdateIntegrationObjArgs
  extends Pick<Integration, 'id'> {
  data: DetailsCol;
}

export interface CreateUpdateObjArgs<T> extends Pick<Integration, 'id'> {
  data: T;
}

export interface CreateUpdateIntegrationObj {
  (args: CreateUpdateIntegrationObjArgs): IntegrationUpdateSpec[];
}

export const createUpdateIntegrationObj: CreateUpdateIntegrationObj = ({
  data,
  id,
}): IntegrationUpdateSpec[] => {
  const valueToBeSaved = data.value;
  const keyToBeSaved = data.accessor;
  return [
    {
      id: `${id}`,
      update: { [keyToBeSaved]: { set: valueToBeSaved } },
    },
  ];
};

export const saveIntegration = (
  mutate: MutateFunction<Integration, SDKError, UseUpdateIntegrationVariables>,
  id: Integration['id']
) => {
  return async function save(project: string, dataSource: DetailsCol) {
    await mutate({ data: dataSource, id, project });
  };
};
