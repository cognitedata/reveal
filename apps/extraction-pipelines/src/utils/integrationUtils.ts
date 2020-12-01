import moment from 'moment';
import { MutateFunction } from 'react-query';
import { LastStatuses, Status, StatusObj } from '../model/Status';
import { Integration } from '../model/Integration';
import {
  createDataSetCol,
  createLatestRunCol,
  createMetadataCols,
  DetailsCol,
} from '../components/table/details/DetailsCols';
import { IntegrationUpdateSpec } from './IntegrationsAPI';
import { SDKError } from '../model/SDKErrors';
import { UseUpdateIntegrationVariables } from '../hooks/useUpdateIntegration';
import { TableHeadings } from '../components/table/IntegrationTableCol';

export const calculateStatus = (status: LastStatuses): StatusObj => {
  return calculate(status);
};
export const calculate = ({
  lastFailure,
  lastSuccess,
}: LastStatuses): StatusObj => {
  if (
    (lastSuccess && lastSuccess > 0 && lastFailure === 0) ||
    (lastSuccess && moment(lastSuccess).isAfter(moment(lastFailure)))
  ) {
    return {
      status: Status.OK,
      time: lastSuccess,
    };
  }
  if (
    (lastFailure && lastFailure > 0 && lastSuccess === 0) ||
    (lastFailure &&
      lastSuccess &&
      moment(lastFailure).isAfter(moment(lastSuccess)))
  ) {
    return {
      status: Status.FAIL,
      time: lastFailure,
    };
  }
  if (
    lastFailure &&
    lastSuccess &&
    moment(lastFailure).isSame(moment(lastSuccess))
  ) {
    return {
      status: Status.FAIL,
      time: lastFailure,
    };
  }
  return {
    status: Status.NOT_ACTIVATED,
    time: 0,
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
    createLatestRunCol(integration),
    {
      label: TableHeadings.SCHEDULE,
      accessor: 'schedule',
      value: integration.schedule,
      isEditable: false,
    },
    {
      label: TableHeadings.LAST_SEEN,
      accessor: 'lastSeen',
      value: integration.lastSeen,
      isEditable: false,
    },
    createDataSetCol(integration),
    ...createMetadataCols(integration.metadata),
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
