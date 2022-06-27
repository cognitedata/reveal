import { Body, Title } from '@cognite/cogs.js';

interface Props {
  data: {
    name: string;
    entity: object;
  };
}

export const SearchResult: React.FC<Props> = ({ data }) => {
  return (
    <>
      <Title>{data.name}</Title>
      <Body>{JSON.stringify(data.entity, null, 2)}</Body>
    </>
  );
};
