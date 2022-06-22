import { DEFINITION } from './constants';
import { DefinitionTitle, DefinitionValue } from './elements';

interface DefinitionProps {
  definition: string;
}

export const Definition: React.FC<DefinitionProps> = ({ definition }) => {
  return (
    <>
      <DefinitionTitle>{DEFINITION}</DefinitionTitle>
      <DefinitionValue> {definition}</DefinitionValue>
    </>
  );
};
