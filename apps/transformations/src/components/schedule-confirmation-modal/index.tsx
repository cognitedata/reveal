import { useTranslation } from '@transformations/common';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';

import { Body, Modal } from '@cognite/cogs.js';

type ScheduleConfirmationModalProps = {};

const ScheduleConfirmationModal =
  ({}: ScheduleConfirmationModalProps): JSX.Element => {
    const { t } = useTranslation();
    const {
      isScheduleConfirmationModalOpen,
      _setIsScheduleModalOpen,
      _setIsScheduleConfirmationModalOpen,
    } = useTransformationContext();

    return (
      <Modal
        onOk={() => {
          _setIsScheduleModalOpen(true);
          _setIsScheduleConfirmationModalOpen(false);
        }}
        okText={t('yes-schedule-now')}
        onCancel={() => _setIsScheduleConfirmationModalOpen(false)}
        cancelText={t('cancel')}
        title={t('warning')}
        visible={isScheduleConfirmationModalOpen}
        size="small"
      >
        <Body level={2}>
          {t('this-query-has-not-been-verified-for-schedule')}
        </Body>
      </Modal>
    );
  };

export default ScheduleConfirmationModal;
