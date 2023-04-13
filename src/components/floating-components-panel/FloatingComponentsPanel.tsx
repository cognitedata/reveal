import {
  Button,
  Colors,
  Detail,
  Elevations,
  Flex,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import {
  FLOATING_COMPONENTS_PANEL_WIDTH,
  FLOATING_ELEMENT_MARGIN,
  Z_INDEXES,
  useTranslation,
} from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

export const FloatingComponentsPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const { setIsComponentsPanelVisible } = useWorkflowBuilderContext();

  return (
    <FloatingPanel>
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Flex direction="column">
          <Title level={6}>{t('floating-components-panel-title')}</Title>
          <Detail muted>{t('floating-components-panel-description')}</Detail>
        </Flex>
        <Button
          icon="CloseLarge"
          onClick={() => setIsComponentsPanelVisible(false)}
          type="ghost"
        />
      </Flex>
    </FloatingPanel>
  );
};

const FloatingPanel = styled.div`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  height: calc(100% - ${FLOATING_ELEMENT_MARGIN * 2}px);
  left: ${FLOATING_ELEMENT_MARGIN}px;
  padding: 12px;
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  width: ${FLOATING_COMPONENTS_PANEL_WIDTH}px;
  z-index: ${Z_INDEXES.FLOATING_ELEMENT};
`;
