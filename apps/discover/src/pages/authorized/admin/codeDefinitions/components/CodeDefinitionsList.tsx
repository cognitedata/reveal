import { CodeDefinitionsListWrapper } from '../elements';
import { CodeDefinition } from '../types';

import { CodeDefinitionItem } from './CodeDefinitionItem';

export interface Props {
  codeDefinitions: CodeDefinition[];
  onLegendUpdated: ({
    code,
    definition,
  }: {
    code: string;
    definition: string;
  }) => void;
}
export const CodeDefinitionsList: React.FC<Props> = ({
  codeDefinitions = [],
  onLegendUpdated,
}) => {
  return (
    <CodeDefinitionsListWrapper>
      {codeDefinitions.map(({ code, definition }, index) => {
        return (
          <CodeDefinitionItem
            key={code}
            code={code}
            definition={definition}
            showLabels={index === 0}
            onLegendUpdated={onLegendUpdated}
          />
        );
      })}
    </CodeDefinitionsListWrapper>
  );
};
