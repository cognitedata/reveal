import React from 'react';
import { Drawer } from 'antd';

import { Button, Colors, Flex } from '@cognite/cogs.js';

import { useActiveTableContext, useProfilingSidebar } from 'contexts';
import { useColumnSelection } from 'hooks/table-selection';
import { useProfileResultType } from 'hooks/profiling-service';
import { SIDEBAR_PROFILING_DRAWER_WIDTH } from 'utils/constants';

import { ProfileStatusMessage } from 'components/ProfileStatus';
import { Header } from './Header';
import { ProfilingData } from './ProfilingData';
import { useTranslation } from 'common/i18n';

export const ProfilingSidebar = (): JSX.Element => {
  const { t } = useTranslation();
  const { database, table } = useActiveTableContext();
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useProfilingSidebar();
  const profileResultType = useProfileResultType(database, table);
  const { selectedColumn } = useColumnSelection();

  const onClickHide = () => setIsProfilingSidebarOpen(false);

  const footer = (
    <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
      {t('profiling-sidebar-button-hide')}
    </Button>
  );

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      width={SIDEBAR_PROFILING_DRAWER_WIDTH}
      placement="right"
      closable={false}
      getContainer={false}
      mask={false}
      onClose={onClickHide}
      style={{
        position: 'absolute',
        borderTop: `1px solid ${Colors['greyscale-grey3'].hex()}`,
      }}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ padding: 0 }}
      title={<Header selectedColumn={selectedColumn} />}
      footer={footer}
    >
      <Flex style={{ padding: '8px' }}>
        <ProfileStatusMessage resultType={profileResultType} isCompact />
      </Flex>
      <ProfilingData selectedColumn={selectedColumn} />
    </Drawer>
  );
};
