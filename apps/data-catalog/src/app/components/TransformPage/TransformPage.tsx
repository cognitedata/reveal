import { useEffect, useState } from 'react';

import moment from 'moment';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { Button, Input, Table, toast } from '@cognite/cogs.js';

import { jetfireIcon as JetfireIcon } from '../../assets';
import { useTranslation } from '../../common/i18n';
import useInterval from '../../hooks/useInterval';
import { JetfireApi } from '../../jetfire/JetfireApi';
import {
  BlockedInformationWrapper,
  CogsTableCellRenderer,
  Col,
  DataSet,
  getJetfireUrl,
  getStringCdfEnv,
  IconWrapper,
  InfoSubtitle,
  MiniInfoTitle,
} from '../../utils';
import Drawer from '../Drawer';

const jetfire = new JetfireApi(sdk, sdk.project, getJetfireUrl());

const useTransformColumns = () => {
  const { t } = useTranslation();

  const transformColumns = [
    {
      Header: t('transform'),
      id: 'name',
      accessor: 'name',
      disableSortBy: false,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => (
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
      Header: t('created'),
      id: 'created',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => (
        <p>{moment(transform.createdTime).toString()}</p>
      ),
    },
    {
      Header: t('updated'),
      id: 'updated',
      disableSortBy: true,
      Cell: ({ row: { original: transform } }: CogsTableCellRenderer<any>) => (
        <p>{moment(transform.lastUpdatedTime).toString()}</p>
      ),
    },
  ];

  return { transformColumns };
};

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
  const { t } = useTranslation();
  const { transformColumns } = useTransformColumns();
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

  const cdfTransformations = () => (
    <>
      <MiniInfoTitle>{t('transform-select-transformations')}</MiniInfoTitle>
      <Input
        placeholder={t('transform-search-placeholder')}
        value={searchValue}
        onChange={(e) => setSearchValue(e.currentTarget.value)}
        style={{
          marginTop: '15px',
          width: '306px',
          height: '40px',
          marginBottom: '20px',
        }}
      />
      <div className="resource-table transformations-table">
        <Table
          rowKey={(d) => String(d.id)}
          columns={transformColumns as any}
          dataSource={transformationsList}
          locale={{
            emptyText: t('transform-no-transformations'),
          }}
          defaultSelectedIds={selectedTransforms.reduce(
            (a, v) => ({ ...a, [v]: true }),
            {}
          )}
          onSelectionChange={(selectedRows: any[]) => {
            const selectedIds = selectedRows.map(
              (selectedRow) => selectedRow.id
            );

            // need this otherwise it goes into infinite loop
            if (
              selectedTransforms.sort().toString() !==
              selectedIds.sort().toString()
            ) {
              setSelectedTransforms(selectedIds);
              props.setChangesSaved(false);
            }
          }}
        />
      </div>
      <br />
      <Button onClick={() => handleNewTransform()}>
        {t('new-transformation')}
      </Button>
      <MiniInfoTitle style={{ marginTop: '20px' }}>
        {t('transform-learn-more')}
        <a
          href="https://docs.cognite.com/cdf/integration/guides/transformation/transformations.html#cdf-transformations"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('here')}
        </a>
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
        toast.error(t('invalid-search-value'));
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
    const name = t('transform-new-transform', {
      dataSetName: props.dataSet ? props.dataSet.name : '',
    });
    jetfire
      .postTransformConfig({ name })
      .then((config) => {
        window.open(
          `/${sdk.project}/transformations/${config.id}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`
        );
      })
      .catch(() => null);
  };

  return (
    <Drawer
      title={t('transform-drawer-title')}
      width="50%"
      onClose={props.closeModal}
      onCancel={props.closeModal}
      visible={props.visible}
      okText={props.changesSaved ? 'Done' : 'Save'}
      onOk={props.changesSaved ? props.closeModal : handleSave}
      cancelHidden
    >
      <div style={{ padding: '5px' }}>
        <Col span={24}>
          <Col span={18}>
            <MiniInfoTitle>{t('external-tranformations')}</MiniInfoTitle>
            <InfoSubtitle>
              {t('transform-document-external-transformations')}
            </InfoSubtitle>
            <Input
              style={{ height: '40px', width: '400px' }}
              placeholder={t(
                'transform-external-transformation-search-placeholder'
              )}
              value={externalTransformation}
              onChange={(e) => {
                setExternalTransformations(e.currentTarget.value);
                props.setChangesSaved(false);
              }}
            />
          </Col>
          <Col span={6}>
            <IconWrapper>
              <JetfireIcon />
            </IconWrapper>
          </Col>
        </Col>
        <Col style={{ marginTop: '20px' }} span={24}>
          {!disableTransformations ? (
            cdfTransformations()
          ) : (
            <MiniInfoTitle>
              {t('transform-info-title')}
              <BlockedInformationWrapper style={{ marginTop: '20px' }}>
                <p>
                  {t('transform-info-p1')}
                  <br /> {t('transform-info-p2')}
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
