import React, { useContext, useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import {
  AuthContext,
  AuthProvider as ContainerAuthProvider,
} from '@cognite/react-container';
import { Badge, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { ContentContainer } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import {
  curateColumns,
  curateConfigurationsData,
  generateConfigurationsColumnsFromData,
} from 'utils/functions';
import {
  DataTransferObject,
  GenericResponseObject,
  Rule,
  UNIX_TIMESTAMP_FACTOR,
} from 'typings/interfaces';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import ProgressBar, { ProgressType } from 'components/Molecules/ProgressBar';
import APIErrorContext from '../../contexts/APIErrorContext';
import ErrorMessage from '../../components/Molecules/ErrorMessage';
import { ExpandRowIcon, StatusDot } from '../DataTransfers/elements';
import config from './configurations.config';
import DirectionArrows from './DirectionArrows';
import {
  ActionWrapper,
  ExpandedRow,
  LinkButton,
  PlayStopButton,
  TableActionsContainer,
} from './elements';
import EditableName from './EditableName';

type ActionsType = {
  direction: string;
  statusActive: boolean;
  id: number;
  name: string;
};

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const { authState } = React.useContext<AuthContext>(ContainerAuthProvider);
  const { token } = authState || {};

  const { error, addError, removeError } = useContext(APIErrorContext);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GenericResponseObject[]>([]);
  const [columns, setColumns] = useState<
    ColumnsType<GenericResponseObject> | undefined
  >([]);

  // noinspection HtmlUnknownTarget
  const rules: Rule[] = [
    {
      key: 'business_tags',
      render: (record: string[]) =>
        record.map((tag: string) => (
          <Badge key={tag} text={tag} background="greyscale-grey2" />
        )),
    },
    {
      key: 'datatypes',
      render: (record: string[]) =>
        record.map((tag: string) => (
          <Badge key={tag} text={tag} background="greyscale-grey2" />
        )),
    },
    {
      key: 'created_time',
      render: (record: number) =>
        new Date(record * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
    },
    {
      key: 'last_updated',
      render: (record: number) =>
        new Date(record * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
    },
    {
      key: 'author',
      render: (record: string) =>
        record.length > 20 ? (
          <Tooltip content={record}>
            <span>{`${record.substring(0, 20)}...`}</span>
          </Tooltip>
        ) : (
          record
        ),
    },
    {
      key: 'target',
      render: (record: any) => record.external_id,
    },
    {
      key: 'status_active',
      render: (record: boolean) => (record ? 'Active' : 'Inactive'),
    },
    {
      key: 'progress',
      render: (props: any[]) => {
        if (Object.values(props).length) {
          return Object.values(props).map((progress) => {
            const total: number = progress.total || 0;

            const outdated: ProgressType = {
              label: 'Outdated',
              value: progress.outdated || 0,
              color: Colors['midblue-5'].hex(),
            };

            const notUploaded: ProgressType = {
              label: 'Not uploaded',
              value: progress.not_uploaded || 0,
              color: Colors['midblue-4'].hex(),
            };

            const succeeded: ProgressType = {
              label: 'Succeeded',
              value: progress.succeeded || 0,
              color: Colors['midblue-3'].hex(),
            };

            return (
              <ProgressBar
                total={total}
                progress={[outdated, notUploaded, succeeded]}
              />
            );
          });
        }

        return <ProgressBar />;
      },
    },
    {
      key: 'statusColor',
      render: (record: boolean) => {
        const color = record
          ? Colors.success.hex()
          : Colors['greyscale-grey3'].hex();
        return (
          <Tooltip content={<span>{record ? 'Active' : 'Inactive'}</span>}>
            <StatusDot bgColor={color} />
          </Tooltip>
        );
      },
    },
    {
      key: 'conf_name',
      render: (record: { name: string; id: number }) => (
        <EditableName
          name={record.name}
          onSaveChange={(newName) => handleNameChange(record.id, newName)}
        />
      ),
    },
    {
      key: 'actions',
      render: (record: ActionsType) => (
        <TableActionsContainer>
          <ActionWrapper>
            <Tooltip
              content={record.direction === 'psToOw' ? 'PS to OW' : 'OW to PS'}
            >
              <DirectionArrows psToOw={record.direction === 'psToOw'} />
            </Tooltip>
          </ActionWrapper>
          <ActionWrapper>
            <Tooltip content={record.statusActive ? 'Stop' : 'Start'}>
              <PlayStopButton
                unstyled
                aria-label={record.statusActive ? 'Stop' : 'Start'}
                onClick={() => handleStopStart(record.id, record.statusActive)}
              >
                {record.statusActive ? (
                  <svg width="6" height="6">
                    <rect
                      width="6"
                      height="6"
                      style={{ fill: 'currentColor' }}
                    />
                  </svg>
                ) : (
                  <Icon type="TriangleRight" />
                )}
              </PlayStopButton>
            </Tooltip>
          </ActionWrapper>
          <ActionWrapper>
            <LinkButton to={`/data-transfers?configuration=${record.name}`}>
              <Icon type="Link" />
            </LinkButton>
          </ActionWrapper>
        </TableActionsContainer>
      ),
    },
  ];

  const hasError = (
    response: GenericResponseObject[] | GenericResponseObject
  ) => {
    if (
      !response ||
      (Array.isArray(response) && response.length > 0 && response[0].error)
    ) {
      let errorObj = {
        message: 'No response',
        status: 400,
      };
      if (response.length > 0 && response[0].error) {
        errorObj = {
          message: response[0].statusText,
          status: response[0].status,
        };
      }
      addError(errorObj.message, errorObj.status);
      return true;
    }
    removeError();
    return false;
  };

  const handleNameChange = (id: number, newName: string) => {
    const nameIndex = data.findIndex((item) => item.name === newName);
    if (nameIndex > -1) {
      addError(
        'Configuration name already exists, please choose other name',
        409
      );
      return false;
    }
    api!.configurations
      .update(id, { name: newName })
      .then((response) => !hasError(response));
    return true;
  };

  function setUpdatedConfiguration(
    id: number,
    response: GenericResponseObject
  ) {
    const dataClone = JSON.parse(JSON.stringify(data));
    const selIndex = data.findIndex((item) => item.id === id);
    if (selIndex > -1) {
      // eslint-disable-next-line prefer-destructuring
      dataClone[selIndex] = response;
      setData(curateConfigurationsData(dataClone));
    }
  }

  function fetchConfigurations() {
    setIsLoading(true);
    api!.configurations.get().then((response: GenericResponseObject[]) => {
      if (!hasError(response)) {
        setData(curateConfigurationsData(response));
      }
      setIsLoading(false);
      return response;
    });
  }

  function handleStopStart(id: number, isActive: boolean) {
    api!.configurations
      .startOrStopConfiguration(id, isActive)
      .then((response) => {
        setIsLoading(true);
        if (!hasError(response)) {
          setUpdatedConfiguration(id, response);
        }
        setIsLoading(false);
        return response;
      });
  }

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchConfigurations();
    }
  }, [token]);

  useEffect(() => {
    const rawColumns = generateConfigurationsColumnsFromData(data);
    const curatedColumns = curateColumns(rawColumns, rules);
    setColumns(curatedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function renderExpandedRow(record: DataTransferObject) {
    return (
      <ExpandedRow>
        <div className="expanded-item">
          <div>
            <span className="expanded-item__label">Created: </span>
            <span className="expanded-item__content">
              {new Date(
                record.created_time * UNIX_TIMESTAMP_FACTOR
              ).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="expanded-item__label">Last updated: </span>
            <span className="expanded-item__content">
              {new Date(
                record.last_updated * UNIX_TIMESTAMP_FACTOR
              ).toLocaleString()}
            </span>
          </div>
        </div>
        {record.datatypes.length > 0 && (
          <div className="expanded-item">
            <span className="expanded-item__label">Data types: </span>
            <span>
              {record.datatypes.map((tag: string) => (
                <Badge key={tag} text={tag} background="greyscale-grey3" />
              ))}
            </span>
          </div>
        )}
        {record.business_tags.length > 0 && (
          <div className="expanded-item">
            <span className="expanded-item__label">Business tags: </span>
            <span>
              {record.business_tags.map((tag: string) => (
                <Badge key={tag} text={tag} background="greyscale-grey3" />
              ))}
            </span>
          </div>
        )}
      </ExpandedRow>
    );
  }

  const getNoDataText = () => {
    let message = isLoading ? 'Loading...' : 'No data';
    if (error) {
      message = `Failed to fetch configurations. API error: ${error.status} ${error.message}`;
      return <ErrorMessage message={message} />;
    }
    return <EmptyTableMessage text={message} isLoading={isLoading} />;
  };

  return (
    <>
      <CreateNewConfiguration />
      <ContentContainer>
        <Table
          dataSource={data}
          columns={sortBy(columns, (obj) =>
            indexOf(config.visibleColumns, obj.key)
          )}
          rowKey="id"
          expandable={{
            expandedRowRender: renderExpandedRow,
            // eslint-disable-next-line react/prop-types
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <ExpandRowIcon
                  type="Down"
                  onClick={(e) => onExpand(record, e)}
                />
              ) : (
                <ExpandRowIcon
                  type="Right"
                  onClick={(e) => onExpand(record, e)}
                />
              ),
          }}
          locale={{
            emptyText: getNoDataText(),
          }}
        />
      </ContentContainer>
    </>
  );
};

export default Configurations;
