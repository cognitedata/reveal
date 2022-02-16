import { Button, Input } from '@cognite/cogs.js';
import Col from 'antd/lib/col';

import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import sdk from '@cognite/cdf-sdk-singleton';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { JetfireApi } from 'jetfire/JetfireApi';
import { DataSet } from 'utils/types';
import * as Sentry from '@sentry/browser';
import { getJetfireUrl, getStringCdfEnv, getContainer } from 'utils/utils';
import Drawer from 'components/Drawer';
import {
  InfoSubtitle,
  IconWrapper,
  MiniInfoTitle,
  BlockedInformationWrapper,
} from 'utils/styledComponents';
import { trackEvent } from '@cognite/cdf-route-tracker';
import jetfireIcon from 'assets/jetfireIcon.svg';
import useInterval from 'hooks/useInterval';
import { Key } from 'antd/lib/table/interface';

const jetfire = new JetfireApi(sdk, sdk.project, getJetfireUrl());

const columns = [
  {
    key: 'name',
    title: 'Transform',
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    render: (_text: string, transform: any) => (
      <a
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
      <p>{moment(transform.createdTime).toString()}</p>
    ),
  },
  {
    key: 'updated',
    title: 'Updated',
    render: (_text: string, transform: any) => (
      <p>{moment(transform.lastUpdatedTime).toString()}</p>
    ),
  },
];

interface TransformPageProps {
  dataSet?: DataSet;
  updateDataSet(dataSet: DataSet): void;
  closeModal(): void;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  visible: boolean;
  saveSection: boolean;
}

const TransformPage = (props: TransformPageProps): JSX.Element => {
  const [transformationsList, setTransformationsList] = useState<any[]>([]);
  const [selectedTransforms, setSelectedTransforms] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [externalTransformation, setExternalTransformations] =
    useState<string>('');
  const [disableTransformations, setDisableTransformations] =
    useState<boolean>(false);

  useEffect(() => {
    if (props.saveSection) {
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.saveSection]);

  const fetchTransformations = () => {
    jetfire
      .transformConfigs({
        includePublic: true,
      })
      .then((val) => setTransformationsList(val))
      .catch(() => {
        setDisableTransformations(true);
      });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[]) => {
      setSelectedTransforms(selectedRowKeys);
      props.setChangesSaved(false);
    },
    selectedRowKeys: selectedTransforms,
  };

  const cdfTransformations = () => (
    <>
      <MiniInfoTitle>Select CDF SQL transformations used</MiniInfoTitle>
      <Input
        placeholder="Search for transformations"
        value={searchValue}
        onChange={(e) => setSearchValue(e.currentTarget.value)}
        style={{
          marginTop: '15px',
          width: '306px',
          height: '40px',
          marginBottom: '20px',
        }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={transformationsList}
        rowSelection={rowSelection}
        locale={{
          emptyText:
            'No transformations, click New transformation to create a new transformation',
        }}
        getPopupContainer={getContainer}
      />
      <Button onClick={() => handleNewTransform()}>New transformation</Button>
      <MiniInfoTitle style={{ marginTop: '20px' }}>
        Learn more about CDF SQL transformations{' '}
        <a
          href="https://docs.cognite.com/cdf/integration/guides/transformation/transformations.html#cdf-transformations"
          target="_blank"
          rel="noopener noreferrer"
        >
          here.
        </a>{' '}
      </MiniInfoTitle>
    </>
  );

  const handleSave = () => {
    // save transformations
    if (props.dataSet) {
      const newDataSet: DataSet = props.dataSet;
      newDataSet.metadata.transformations =
        selectedTransforms.map((trans) => {
          return { name: trans, type: 'jetfire' };
        }) || [];
      if (externalTransformation) {
        newDataSet.metadata.transformations.push({
          name: 'External Transformation',
          type: 'external',
          details: externalTransformation,
        });
      }
      props.updateDataSet(newDataSet);
      props.setChangesSaved(true);
      props.closeModal();
    }
  };

  // get transformations from jetfire api
  useEffect(() => {
    fetchTransformations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchValue !== '') {
      try {
        setTransformationsList(
          transformationsList.filter(
            (item) =>
              String(item.name)
                .toUpperCase()
                .search(searchValue.toUpperCase()) >= 0
          )
        );
      } catch (e) {
        message.error('Invalid search value');
        setSearchValue('');
      }
    } else {
      fetchTransformations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    if (
      props.dataSet &&
      Array.isArray(props.dataSet.metadata.transformations)
    ) {
      setSelectedTransforms(
        props.dataSet.metadata.transformations
          .filter((trans) => trans.type === 'jetfire')
          .map((tran) => tran.name)
      );
      const externalTrans = props.dataSet.metadata.transformations.filter(
        (trans) => trans.type === 'external'
      )[0];
      if (externalTrans && externalTrans.details) {
        setExternalTransformations(externalTrans.details);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dataSet]);

  // refetch every 30 secs
  useInterval(() => {
    if (!disableTransformations) {
      fetchTransformations();
    }
  }, 30000);

  const handleNewTransform = () => {
    trackEvent('DataSets.CreationFlow.Created new transform');
    const name = `New Transform ${props.dataSet ? props.dataSet.name : ''}`;
    jetfire
      .postTransformConfig({ name })
      .then((config) => {
        window.open(
          `/${sdk.project}/transformations/${config.id}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`
        );
      })
      .catch((err) => Sentry.captureException(err));
  };

  return (
    <Drawer
      title={<div>Document data transformations</div>}
      width="50%"
      onClose={() => props.closeModal()}
      visible={props.visible}
      okText={props.changesSaved ? 'Done' : 'Save'}
      onOk={props.changesSaved ? props.closeModal : handleSave}
      cancelHidden
    >
      <div style={{ padding: '5px' }}>
        <Col span={24}>
          <Col span={18}>
            <MiniInfoTitle>External tranformations</MiniInfoTitle>
            <InfoSubtitle>
              Document any tranformations done outside of CDF.
            </InfoSubtitle>
            <Input
              style={{ height: '40px', width: '400px' }}
              placeholder="Ex: Python script..."
              value={externalTransformation}
              onChange={(e) => {
                setExternalTransformations(e.currentTarget.value);
                props.setChangesSaved(false);
              }}
            />
          </Col>
          <Col span={6}>
            <IconWrapper>
              <img src={jetfireIcon} alt="Add data " />
            </IconWrapper>
          </Col>
        </Col>
        <Col style={{ marginTop: '20px' }} span={24}>
          {!disableTransformations ? (
            cdfTransformations()
          ) : (
            <MiniInfoTitle>
              CDF Transformations for this data set
              <BlockedInformationWrapper style={{ marginTop: '20px' }}>
                <p>
                  You have insufficient rights to view transformations in this
                  project.
                  <br /> Please request from your project administrator to be
                  added to the &quot;transformations&quot; access management
                  group
                </p>
              </BlockedInformationWrapper>
            </MiniInfoTitle>
          )}
        </Col>
      </div>
    </Drawer>
  );
};

export default TransformPage;
