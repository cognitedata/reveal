import { Input } from '@cognite/cogs.js';

import { validate } from './validation';
import { useState } from 'react';

import { System } from '../../types';
import { Centered, Container } from './styles';

interface Props {
  system: System;
}
const ValidationTextComponent = (props: Props) => {
  const title = props.system?.title || 'Tag';
  const [potentialTag, setPotentialTag] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <Container>
      <Centered>
        <Input
          style={{ margin: 'auto', width: '33%', marginTop: '10vh' }}
          label={`Enter a ${title}`}
          placeholder={`Enter a ${title}`}
          value={potentialTag}
          onChange={(e) => {
            setPotentialTag(e.target.value);
            const listOfMatches = validate(props.system, [e.target.value]);
            console.log(listOfMatches, e.target.value);
            setIsValid(listOfMatches.length > 0);
          }}
        />

        {isValid && (
          <h3 style={{ color: 'green', marginTop: '10vh' }}>
            {potentialTag} is valid
          </h3>
        )}
        {!isValid && potentialTag.length > 0 && (
          <h3 style={{ color: 'red', marginTop: '10vh' }}>
            {potentialTag} is not valid
          </h3>
        )}
      </Centered>
    </Container>
  );
};

export default ValidationTextComponent;
