import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { NotificationDialog } from 'components/extpipe/NotificationDialog';
import { Extpipe } from 'model/Extpipe';
import Section from 'components/section';
import { useTranslation } from 'common';
import { minutesToUnit } from 'utils/utils';
import { Button, Flex, Icon } from '@cognite/cogs.js';

type NotificationSectionProps = {
  canEdit: boolean;
  extpipe: Extpipe;
};

function renderTime(minutes: number) {
  const time = minutesToUnit(minutes);
  const unit = time.n === 1 ? time.unit.slice(0, -1) : time.unit;
  return `${time.n} ${unit}`;
}

export const NotificationSection: FunctionComponent<
  NotificationSectionProps
> = ({ canEdit, extpipe }: PropsWithChildren<NotificationSectionProps>) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  return (
    <>
      {open && (
        <NotificationDialog
          extpipe={extpipe}
          isOpen={open}
          close={() => setOpen(false)}
        />
      )}
      <Section
        icon="Bell"
        title={t('notification', { count: 0 })}
        extra={
          <Button
            disabled={!canEdit}
            onClick={openDialog}
            size="small"
            type="ghost"
          >
            Edit
          </Button>
        }
        items={[
          {
            key: 'run-alerts',
            title: t('run-alerts'),
            value: (
              <Flex alignItems="center" gap={4}>
                {t('notification-run-alert')}
                <Icon type="BellFilled" size={12} />
              </Flex>
            ),
          },
          {
            key: 'last-seen-status',
            title: t('last-seen-status'),
            value: extpipe.notificationConfig?.allowedNotSeenRangeInMinutes ? (
              <Flex alignItems="center" gap={4}>
                {t('notification-alert-info', {
                  duration: renderTime(
                    extpipe.notificationConfig.allowedNotSeenRangeInMinutes
                  ),
                })}
                <Icon type="BellFilled" size={12} />
              </Flex>
            ) : (
              t('not-configured-yet')
            ),
          },
        ]}
      />
    </>
  );
};
