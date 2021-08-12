/* eslint-disable camelcase */
import { FC, useEffect, useState } from 'react';
import { Colors, Modal, Tabs } from '@cognite/cogs.js';
import { useObjectsSingleObjectQuery } from 'services/endpoints/objects/query';
import LoadingBox from 'components/Molecules/LoadingBox';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { useOnEscClick } from 'hooks/useOnKeyboardEvents';

import { CloseIcon, Content, ExtendedTabs } from './elements';
import SourceTabContent from './SourceTabContent';
import TranslationTabContent from './TranslationTabContent';
import { TargetType } from './types';

type Props = {
  onClose: () => void;
  record: DataTransfersTableData;
};

const DetailView: FC<Props> = ({ onClose, record }) => {
  const [target, setTarget] = useState<TargetType | null>(null);

  const {
    revisions,
    name,
    external_id,
    crs,
    datatype,
    source_created_time,
    created_time,
    project,
    business_tags,
    author,
    cdf_metadata,
    data_status,
  } = record.source;

  const [revision] = revisions.reverse();

  const source = {
    name,
    externalId: external_id,
    crs,
    dataType: datatype,
    createdTime: source_created_time || created_time,
    repository: project,
    businessTag: business_tags.join(', '),
    revision: revision.revision,
    revisionSteps: revision.steps,
    interpreter: author,
    cdfMetadata: cdf_metadata,
    qualityTags: data_status,
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

  useOnEscClick(() => {
    onClose();
  });

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
                <Tabs.TabPane tab="Target" key="1">
                  <TranslationTabContent {...target} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Source" key="2">
                  <SourceTabContent {...source} />
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
