/* eslint-disable no-nested-ternary */
import { ReactNode, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { Collapse } from 'antd';

import { Button } from '@cognite/cogs.js';

type FormCollapseProps = {
  isConfigured: boolean;
  configuredMessage: string;
  defaultActiveKey?: string[];
  children: (onCloseCollapse: () => void) => ReactNode;
  isOpenByDefault?: boolean;
};

const FormCollapse = ({
  isConfigured,
  defaultActiveKey = ['1'],
  children,
  isOpenByDefault,
}: FormCollapseProps) => {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState<string[]>(
    !isConfigured && isOpenByDefault ? defaultActiveKey : []
  );
  const isCollapsed = activeKeys.length === 0;
  const handleChangeCollapsedState = (keys: string | string[]) => {
    if (typeof keys === 'string') {
      setActiveKeys([keys]);
    }
    if (Array.isArray(keys)) {
      setActiveKeys(keys);
    }
  };
  const onCloseCollapse = () => {
    setActiveKeys([]);
  };
  return (
    <Collapse
      bordered={false}
      defaultActiveKey={defaultActiveKey}
      onChange={(key) => handleChangeCollapsedState(key)}
      activeKey={activeKeys}
      style={{ overflow: 'hidden' }}
    >
      <Collapse.Panel
        key="1"
        showArrow={false}
        header={
          <StyledCollapseHeader>
            {isCollapsed ? (
              <AbsoluteRightButton
                type="ghost"
                aria-label={t('edit-schedule')}
                icon="Edit"
                size="small"
              />
            ) : null}
          </StyledCollapseHeader>
        }
      >
        {children(onCloseCollapse)}
      </Collapse.Panel>
    </Collapse>
  );
};

export default FormCollapse;

const StyledCollapseHeader = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  align-items: center;
`;

const AbsoluteRightButton = styled(Button)`
  position: absolute;
  right: 12px;
`;
