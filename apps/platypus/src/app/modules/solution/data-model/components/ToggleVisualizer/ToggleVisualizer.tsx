import { Dispatch } from 'react';

import styled from 'styled-components';

import { Button, Chip, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

type ToggleVisualizerProps = {
  isVisualizerOn: boolean;
  setIsVisualizerOn: Dispatch<boolean>;
};

export function ToggleVisualizer({
  isVisualizerOn,
  setIsVisualizerOn,
}: ToggleVisualizerProps) {
  const { t } = useTranslation('toggle-visualizer');

  return (
    <Flex gap={4} style={{ overflow: 'hidden' }}>
      <StyledLabel
        type="warning"
        size="small"
        label={t(
          'toggle-visualizer-toolbar-label-text',
          'The preview might be slow due to size of data model.'
        )}
      />
      <Button
        data-cy="schema-visualizer-toggle-btn"
        size="small"
        onClick={() => setIsVisualizerOn(!isVisualizerOn)}
      >
        {isVisualizerOn
          ? t('toggle-visualizer-btn-off', 'Turn off preview')
          : t('toggle-visualizer-btn-on', 'Turn on preview')}
      </Button>
    </Flex>
  );
}

const StyledLabel = styled(Chip)`
  && {
    flex: 1;
    max-width: none;
  }
`;
