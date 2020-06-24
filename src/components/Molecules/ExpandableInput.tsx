import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { Button, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

enum INPUT_STATE {
  'COLLAPSED',
  'EXPANDED',
}

const Container = styled.div`
  height: 36px;
  display: flex;
  flex-direction: row-reverse;
`;

const ExpandableInput = (): React.ReactElement => {
  const [state, setState] = useState(INPUT_STATE.COLLAPSED);

  function expand() {
    setState(INPUT_STATE.EXPANDED);
  }

  function collapse() {
    setState(INPUT_STATE.COLLAPSED);
  }

  return (
    <Container>
      <Button
        type="primary"
        size="large"
        icon={state === INPUT_STATE.EXPANDED ? undefined : 'Plus'}
        onClick={state === INPUT_STATE.COLLAPSED ? expand : collapse}
      >
        {state === INPUT_STATE.EXPANDED ? (
          <Trans i18nKey="Global:BtnCreate" />
        ) : (
          <Trans i18nKey="Global:BtnNewConfiguration" />
        )}
      </Button>
      {state === INPUT_STATE.EXPANDED ? (
        <Input
          autoFocus
          placeholder="DSG session name..."
          style={{ fontFamily: '"Inter", sans-serif', marginRight: '16px' }}
        />
      ) : null}
    </Container>
  );
};

export default ExpandableInput;
