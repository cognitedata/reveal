import { Button, Label } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Dispatch } from 'react';
import styled from 'styled-components';

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
    <StyledLabel variant="warning">
      <span>
        {t(
          'toggle-visualizer-toolbar-label-text',
          'The preview might be slow due to size of data model.'
        )}
      </span>
      <StyledButton
        data-cy="schema-visualizer-toggle-btn"
        size="small"
        onClick={() => setIsVisualizerOn(!isVisualizerOn)}
      >
        {isVisualizerOn
          ? t('toggle-visualizer-btn-text', 'Turn off preview')
          : t('toggle-visualizer-btn-text', 'Turn on preview')}
      </StyledButton>
    </StyledLabel>
  );
}

const StyledLabel = styled(Label)`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  margin-left: 16px;
  padding: 0 0 0 10px;
  height: auto;
  line-height: 20px;
`;

const StyledButton = styled(Button)`
  background-color: rgba(83, 88, 127, 0.08);
`;
