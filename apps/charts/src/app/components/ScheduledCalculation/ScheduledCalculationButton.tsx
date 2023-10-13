import { useState } from 'react';

import { TIMESERIES_ACL } from '@cognite/charts-lib';
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
  const { data: hasTSWrite, isFetching: isFetchingWriteCapabilities } =
    useAclPermissions(TIMESERIES_ACL, 'WRITE');
  const { data: hasTSRead, isFetching: isFetchingReadCapabilities } =
    useAclPermissions(TIMESERIES_ACL, 'READ');
  const canCreateScheduledCalculations = hasTSWrite && hasTSRead;
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
            hasTSWrite ? '' : `${TIMESERIES_ACL}:WRITE`,
            hasTSRead ? '' : `${TIMESERIES_ACL}:READ`,
          ].filter(Boolean)}
        />
      ) : null}
    </>
  );
};
