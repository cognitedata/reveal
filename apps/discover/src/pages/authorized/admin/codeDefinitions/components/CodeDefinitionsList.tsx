import { CodeDefinition } from '../types';

import { CodeDefinitionItem } from './CodeDefinitionItem';

interface Props {
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
    <>
      {codeDefinitions.map((codeDefinition, index) => {
        return (
          <CodeDefinitionItem
            key={codeDefinition.code}
            code={codeDefinition.code}
            definition={codeDefinition.definition}
            showLabels={index === 0}
            onLegendUpdated={onLegendUpdated}
          />
        );
      })}
    </>
  );
};
