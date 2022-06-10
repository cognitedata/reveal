import { Body, Title } from '@cognite/cogs.js';

export const NoResults = () => {
  return (
    <>
      <Title>No Results</Title>
      <Body>Try a different search!</Body>
    </>
  );
};
