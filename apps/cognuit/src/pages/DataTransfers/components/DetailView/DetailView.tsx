import { useEffect, useState } from 'react';
import { Colors, Modal, Tabs } from '@cognite/cogs.js';
import { useObjectsSingleObjectQuery } from 'services/endpoints/objects/query';
import LoadingBox from 'components/Molecules/LoadingBox';
import { DataTransfersTableData } from 'pages/DataTransfers/types';

import { CloseIcon, Content, ExtendedTabs } from './elements';
import SourceTabContent from './SourceTabContent';
import TranslationTabContent from './TranslationTabContent';

type Props = {
  onClose: () => void;
  record: DataTransfersTableData;
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
  interpreter?: string | null;
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
  source: SourceType;
  target: TargetType;
} | null;

const DetailView = ({ onClose, record }: Props) => {
  const [target, setTarget] = useState<TargetType | null>(null);

  const { revisions } = record;
  const [revision] = revisions.reverse();

  const source = {
    name: record.name,
    externalId: record.external_id,
    crs: record.crs,
    dataType: record.datatype,
    createdTime: record.source_created_time || record.created_time,
    repository: record.project,
    businessTag: record.business_tags.join(', '),
    revision: revision.revision,
    revisionSteps: revision.steps,
    interpreter: record.author,
    cdfMetadata: record.cdf_metadata,
  };

  const translation =
    revision.translations &&
    revision.translations[revision.translations.length - 1];

  const {
    data: [availableTargets],
    isSuccess,
    isLoading,
  } = useObjectsSingleObjectQuery({
    objectId: translation!.revision.object_id,
    enabled: !!(translation && translation.revision.object_id),
  });

  useEffect(() => {
    if (isSuccess) {
      setTarget({
        name: availableTargets.name,
        crs: availableTargets.crs,
        dataType: availableTargets.datatype,
        createdTime: translation?.revision.created_time,
        repository: availableTargets.project,
        revision: translation?.revision.revision,
        revisionSteps: translation?.revision.steps,
        cdfMetadata: availableTargets.cdf_metadata,
      });
    }
  }, [availableTargets]);

  useEffect(() => {
    function upHandler(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.code === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      visible={!!record}
      okText="Close"
      cancelText=""
      onOk={onClose}
      width={768}
      appElement={document.body}
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
              <ExtendedTabs defaultActiveKey="1">
                <Tabs.TabPane tab="Source" key="1">
                  <SourceTabContent {...source} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Translation" key="2">
                  <TranslationTabContent {...target} />
                </Tabs.TabPane>
              </ExtendedTabs>
            </Content>
          )}
        </>
      )}
    </Modal>
  );
};

export default DetailView;
