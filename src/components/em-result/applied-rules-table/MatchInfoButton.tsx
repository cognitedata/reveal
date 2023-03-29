import { Button, Flex, Icon, Modal } from '@cognite/cogs.js';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { useState } from 'react';
import { get } from 'lodash-es';
import { useTranslation } from 'common';

type Props = {
  rule: AppliedRule;
};
export default function MatchInfoButton({ rule }: Props) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
      {modalVisible && (
        <Modal
          visible={true}
          title={t('rule-match-items', { count: rule.matches.length })}
          onCancel={() => setModalVisible(false)}
          onOk={() => setModalVisible(false)}
        >
          {rule.matches.map((m, i) => (
            <Flex key={i} gap={12} alignItems="center">
              <>{get(m.source, rule.rule.extractors[0]?.field)}</>
              <Icon type="ArrowRight" />
              <>{get(m.target, rule.rule.extractors[1]?.field)}</>
            </Flex>
          ))}
        </Modal>
      )}
      <Button
        icon="Info"
        size="small"
        onClick={() => setModalVisible(!modalVisible)}
      />
    </>
  );
}
