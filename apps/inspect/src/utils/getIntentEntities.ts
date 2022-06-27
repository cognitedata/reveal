type Intent = {
  id: string;
  name: string;
  confidence: number;
};

type Entity = {
  body: string;
  confidence: number;
  end: number;
  id: string;
  name: string;
  role: string;
  start: number;
  suggested: boolean;
};

type Entities = Record<string, Entity[]>;

type Result = {
  intents: Intent[];
  entities: Entities;
};

export const getIntentEntities = (
  result: Result
): { intentName: string; entityName: string; entityLabel: string } => {
  const intentName = result.intents?.[0]?.name;
  const entityName = result.entities?.['name:name']?.[0]?.body;
  const entityLabel = result.entities?.['label:label']?.[0]?.body;

  return { intentName, entityName, entityLabel };
};
