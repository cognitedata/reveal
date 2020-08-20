import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { Button, Dropdown, Icon, Input, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useRouteMatch, useHistory } from 'react-router-dom';

enum INPUT_STATE {
  'COLLAPSED',
  'EXPANDED',
}

const Container = styled.div`
  padding: 32px 32px 16px;
  display: flex;
  flex-direction: row-reverse;
`;

const MenuSelectConfigurationType = ({
  onSelect,
  name,
}: {
  onSelect: (name: string) => void;
  name: string;
}) => {
  const { url } = useRouteMatch();
  const history = useHistory();

  const createNew = (type: string = 'ps-to-ow') => {
    history.push(`${url}/new/${type}`);
    onSelect(name);
  };

  return (
    <Menu>
      <Menu.Item onClick={() => createNew('ps-to-ow')}>
        <Icon type="Plus" />
        PS to OW
      </Menu.Item>
      <Menu.Item onClick={() => createNew('ow-to-ps')}>
        <Icon type="Plus" />
        OW to PS
      </Menu.Item>
    </Menu>
  );
};

const CreateNewConfiguration = ({
  onSelect,
}: {
  onSelect: (name: string) => void;
}): React.ReactElement => {
  const [state, setState] = useState(INPUT_STATE.COLLAPSED);
  const [name, setName] = useState('');

  function expand() {
    setState(INPUT_STATE.EXPANDED);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  return (
    <Container>
      {state === INPUT_STATE.COLLAPSED ? (
        <Button
          type="primary"
          size="large"
          icon="Plus"
          onClick={expand}
          style={{ height: '36px' }}
        >
          <Trans i18nKey="Global:BtnNewConfiguration" />
        </Button>
      ) : (
        <>
          <Dropdown
            content={
              <MenuSelectConfigurationType onSelect={onSelect} name={name} />
            }
          >
            <Button type="primary" size="large" style={{ height: '36px' }}>
              <Trans i18nKey="Global:BtnCreate" />
            </Button>
          </Dropdown>
          <Input
            autoFocus
            placeholder="DSG session name..."
            style={{ fontFamily: '"Inter", sans-serif', marginRight: '16px' }}
            onChange={handleChange}
          />
        </>
      )}
    </Container>
  );
};

export default CreateNewConfiguration;
