import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import { ProfileStatusMessage } from '@raw-explorer/components/ProfileStatus';
import {
  useActiveTableContext,
  useProfilingSidebar,
} from '@raw-explorer/contexts';
import { useProfileResultType } from '@raw-explorer/hooks/profiling-service';
import { useColumnSelection } from '@raw-explorer/hooks/table-selection';
import { SIDEBAR_PROFILING_DRAWER_WIDTH } from '@raw-explorer/utils/constants';
import { Drawer } from 'antd';

import { Button, Colors, Flex } from '@cognite/cogs.js';

import { Header } from './Header';
import { ProfilingData } from './ProfilingData';

export const ProfilingSidebar = (): JSX.Element => {
  const { t } = useTranslation();
  const { database, table } = useActiveTableContext();
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useProfilingSidebar();
  const profileResultType = useProfileResultType(database, table);
  const { selectedColumn } = useColumnSelection();

  const onClickHide = () => setIsProfilingSidebarOpen(false);

  const footer = (
    <StyledButton icon="PanelRight" type="secondary" onClick={onClickHide}>
      {t('profiling-sidebar-button-hide')}
    </StyledButton>
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
        borderTop: `1px solid ${Colors['border--interactive--default']}`,
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

const StyledButton = styled(Button)`
  &&& {
    display: flex !important;
    width: 100%;
  }
`;
