import { useState } from 'react';

import { SCHEDULED_CALCULATIONS_ACL } from '@cognite/charts-lib';
import { Button, Flex } from '@cognite/cogs.js';

import { useAclPermissions } from '../../domain/chart/service/queries/useAclPermissions';
import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';
import { AccessDeniedModal } from '../AccessDeniedModal/AccessDeniedModal';
import { ScheduleClock } from '../Icons/ScheduleClock';

import { ScheduledCalculationModal } from './ScheduledCalculationModal';

const defaultTranslations = makeDefaultTranslations('Save and Schedule');

export const ScheduledCalculationButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { data: hasSCWrite, isFetching: isFetchingWriteCapabilities } =
    useAclPermissions(SCHEDULED_CALCULATIONS_ACL, 'WRITE');
  const { data: hasSCRead, isFetching: isFetchingReadCapabilities } =
    useAclPermissions(SCHEDULED_CALCULATIONS_ACL, 'READ');
  const canCreateScheduledCalculations = hasSCWrite && hasSCRead;
  const isFetchingCapabilities =
    isFetchingWriteCapabilities || isFetchingReadCapabilities;
  const { t } = useTranslations(
    Object.keys(defaultTranslations),
    'ScheduledCalculation'
  );

  const [isSCFormVisible, setSCFormVisible] = useState<boolean>(false);
  const [isAccessModalVisible, setAccessModalVisible] =
    useState<boolean>(false);
  return (
    <>
      <Button
        onClick={() => {
          if (canCreateScheduledCalculations) {
            setSCFormVisible(true);
          } else {
            setAccessModalVisible(true);
          }
        }}
        size="small"
        loading={isFetchingCapabilities}
      >
        <Flex gap={8} alignItems="center">
          <ScheduleClock />
          {t['Save and Schedule']}
        </Flex>
      </Button>
      {isSCFormVisible ? (
        <ScheduledCalculationModal
          onClose={() => setSCFormVisible(false)}
          workflowId={workflowId}
        />
      ) : null}
      {isAccessModalVisible ? (
        <AccessDeniedModal
          visible={isAccessModalVisible}
          onOk={() => setAccessModalVisible(false)}
          capabilities={[
            hasSCWrite ? '' : `${SCHEDULED_CALCULATIONS_ACL}:WRITE`,
            hasSCRead ? '' : `${SCHEDULED_CALCULATIONS_ACL}:READ`,
          ].filter(Boolean)}
        />
      ) : null}
    </>
  );
};
