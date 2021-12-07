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
    id,
    name,
    external_id,
    author,
    grouping,
    crs,
    datatype,
    created_time,
    last_updated,
    project,
    business_tags,
    data_status,
    cdf_metadata,
    revisions,
  } = record.source;

  const [revision] = revisions.reverse();

  const source = {
    id,
    name,
    externalId: external_id,
    author,
    grouping,
    crs,
    dataType: datatype,
    createdTime: created_time,
    lastUpdated: last_updated,
    repository: project,
    businessTags: business_tags.join(', '),
    statusTags: data_status.join(', '),
    cdfMetadata: cdf_metadata,
    revision: revision.revision,
    revisionSteps: revision.steps,
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
        id: availableTargets.id,
        externalId: availableTargets.external_id,
        name: availableTargets.name,
        crs: availableTargets.crs,
        dataType: availableTargets.datatype,
        createdTime: translation?.revision.created_time,
        lastUpdated: translation?.revision.last_updated,
        project: availableTargets.project,
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
      closeIcon={<CloseIcon type="CloseLarge" onClick={onClose} />}
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
