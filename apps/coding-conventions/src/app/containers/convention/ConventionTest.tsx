import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Body, Icon, Input } from '@cognite/cogs.js';

import { useConventionListQuery } from '../../service/hooks/query/useConventionListQuery';
import { useSystemQuery } from '../../service/hooks/query/useSystemQuery';
import { validate } from '../../utils/validation';

export const ConventionTest = () => {
  const { data: system } = useSystemQuery();
  const { data: conventions } = useConventionListQuery();

  const [potentialTag, setPotentialTag] = useState('');
  const [isValid, setIsValid] = useState<undefined | boolean>(undefined);

  useEffect(() => {
    if (!potentialTag || !system || !conventions) {
      setIsValid(undefined);
      return;
    }

    const listOfMatches = validate(system, conventions, [potentialTag]);
    setIsValid(listOfMatches.length > 0);
  }, [system, conventions, potentialTag]);

  if (!system || !conventions) {
    return <p>No record found</p>;
  }

  return (
    <>
      {isValid === undefined && (
        <Container>
          <Waiting />
          <Body>Type something to validate...</Body>
        </Container>
      )}

      {isValid && (
        <Container>
          <Success />
          <Body>"{potentialTag}" is valid</Body>
        </Container>
      )}

      {isValid === false && (
        <Container>
          <Fail />
          <Body>"{potentialTag}" is not valid</Body>
        </Container>
      )}

      <Input
        label={`Enter a ${system.resource} name manually`}
        fullWidth
        placeholder={`Enter a ${system.resource} name manually`}
        value={potentialTag}
        onChange={(e) => {
          setPotentialTag(e.target.value);
        }}
      />
    </>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 24px;
`;

const Success = styled(Icon).attrs({ type: 'ThumbUp', size: 84 })`
  color: var(--cogs-border--status-success--strong);
`;

const Waiting = styled(Icon).attrs({ type: 'Help', size: 84 })`
  color: var(--cogs-border--status-undefined--muted);
`;

const Fail = styled(Icon).attrs({ type: 'ThumbDown', size: 84 })`
  color: var(--cogs-border--status-critical--strong);
`;
