import React, { useEffect } from 'react';
import { Colors, Modal } from '@cognite/cogs.js';
import { Tabs } from 'antd';
import { CloseIcon, Content } from './elements';
import LoadingBox from '../../Molecules/LoadingBox';
import SourceTabContent from './SourceTabContent';
import TranslationTabContent from './TranslationTabContent';

type Props = {
  onClose: () => void;
  data: DetailDataProps;
};

type StepType = {
  status: string;
  // eslint-disable-next-line camelcase
  error_message: string | null;
  // eslint-disable-next-line camelcase
  created_time: number;
};

export type SourceType = {
  name?: string;
  externalId?: string;
  crs?: string;
  dataType?: string;
  createdTime?: number;
  repository?: string;
  businessTag?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  interpreter?: string;
  cdfMetadata?: {
    [key: string]: any;
  };
};

export type TargetType = {
  name?: string;
  owId?: string;
  crs?: string;
  dataType?: string;
  openWorksId?: string;
  createdTime?: number;
  repository?: string;
  configTag?: string;
  revision?: string | number | null;
  revisionSteps?: StepType[];
  cdfMetadata?: {
    [key: string]: any;
  };
};

export type DetailDataProps = {
  id: string | number;
  isLoading?: boolean;
  source: SourceType;
  target: TargetType;
} | null;

const { TabPane } = Tabs;

const DetailView = ({ onClose, data }: Props) => {
  function upHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      onClose();
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isLoading, source, target } = data || {};

  return (
    <Modal
      visible={data !== null}
      okText="Close"
      cancelText=""
      onOk={onClose}
      width={768}
      closeIcon={<CloseIcon type="LargeClose" onClick={onClose} />}
    >
      <h2 className="visually-hidden">Detail view</h2>
      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <LoadingBox
            text="Loading..."
            backgroundColor={Colors.white.hex()}
            textColor={Colors.black.hex()}
          />
        </div>
      ) : (
        <>
          {source && target && (
            <Content>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Source" key="1">
                  <SourceTabContent {...source} />
                </TabPane>
                <TabPane tab="Translation" key="2">
                  <TranslationTabContent {...target} />
                </TabPane>
              </Tabs>
            </Content>
          )}
        </>
      )}
    </Modal>
  );
};

export default DetailView;
