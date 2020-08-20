import React, { useState } from 'react';
import { Button, IconType, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

enum INPUT_STATE {
  'COLLAPSED',
  'EXPANDED',
}

type Props = {
  buttonLabelCollapsed?: string;
  buttonLabelExpanded?: string;
  buttonIcon?: IconType;
  inputPlaceholder?: string;
  onClick: () => void;
  children?: any;
};

const Container = styled.div`
  height: 36px;
  display: flex;
  flex-direction: row-reverse;
`;

const ExpandableInput = ({
  buttonLabelCollapsed = 'buttonLabelCollapsed',
  buttonLabelExpanded = 'buttonLabelExpanded',
  buttonIcon = 'Placeholder',
  inputPlaceholder = 'inputPlaceholder',
  onClick,
  children,
}: Props): React.ReactElement => {
  const [state, setState] = useState(INPUT_STATE.COLLAPSED);

  function expand() {
    setState(INPUT_STATE.EXPANDED);
  }

  return (
    <Container>
      <Button
        type="primary"
        size="large"
        icon={state === INPUT_STATE.EXPANDED ? undefined : buttonIcon}
        onClick={state === INPUT_STATE.COLLAPSED ? expand : onClick}
      >
        {state === INPUT_STATE.EXPANDED
          ? buttonLabelExpanded
          : buttonLabelCollapsed}
      </Button>
      {state === INPUT_STATE.EXPANDED ? (
        <Input
          autoFocus
          placeholder={inputPlaceholder}
          style={{ fontFamily: '"Inter", sans-serif', marginRight: '16px' }}
        />
      ) : null}
      {children}
    </Container>
  );
};

export default ExpandableInput;
