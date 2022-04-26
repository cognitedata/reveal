import { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react';

import { Input } from '@cognite/cogs.js';

import { CodeDefinitionItemWrapper } from '../elements';

interface Props {
  code: string;
  definition?: string;
  showLabels?: boolean;
  onLegendUpdated: ({
    code,
    definition,
  }: {
    code: string;
    definition: string;
  }) => void;
}

const DEFINITION_MAX_LENGTH = 100;
const DEFINITION_TOO_LONG_ERROR_MESSAGE = `Definition can't be longer than ${DEFINITION_MAX_LENGTH} characters`;

export const CodeDefinitionItem: React.FC<Props> = ({
  code,
  definition,
  showLabels,
  onLegendUpdated,
}) => {
  const [codeInputValue, setCodeInputValue] = useState(code);
  const [definitionInputValue, setDefinitionInputValue] = useState(
    definition || ''
  );

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCodeInputValue(value);
  };

  const handleDefinitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDefinitionInputValue(value);
  };

  const helpText = useMemo(() => {
    return definitionInputValue.length > DEFINITION_MAX_LENGTH
      ? DEFINITION_TOO_LONG_ERROR_MESSAGE
      : `${definitionInputValue.length}/${DEFINITION_MAX_LENGTH}`;
  }, [definitionInputValue]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLegendUpdate();
    }
  };

  const handleLegendUpdate = () => {
    if (definitionInputValue !== definition) {
      onLegendUpdated({ code, definition: definitionInputValue });
    }
  };

  return (
    <CodeDefinitionItemWrapper>
      <Input
        title={showLabels ? 'Code' : ''}
        disabled
        value={codeInputValue}
        variant="noBorder"
        style={{ marginRight: '16px' }}
        onChange={handleCodeChange}
      />
      <Input
        title={showLabels ? 'Definition' : ''}
        onBlur={handleLegendUpdate}
        onKeyDown={(event) => handleKeyDown(event)}
        value={definitionInputValue}
        fullWidth
        onChange={handleDefinitionChange}
        helpText={helpText}
        error={definitionInputValue.length > DEFINITION_MAX_LENGTH}
        placeholder="Definition"
      />
    </CodeDefinitionItemWrapper>
  );
};
