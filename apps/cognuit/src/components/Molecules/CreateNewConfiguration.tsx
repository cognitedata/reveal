import { ChangeEvent, useState } from 'react';
import { Button, Dropdown, Icon, Input, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { SessionType } from 'typings/interfaces';
import { ThirdPartySystems } from 'types/globalTypes';

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
`;

enum displayState {
  COLLAPSED = 'COLLAPSED',
  EXPANDED = 'EXPANDED',
}

const CreateNewConfiguration = () => {
  const [display, setDisplay] = useState<displayState>(displayState.COLLAPSED);
  const [sessionName, setSessionName] = useState<string>('');
  const { url } = useRouteMatch();
  const history = useHistory();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSessionName(e.target.value);
  }

  function handleFinish(type: SessionType) {
    history.push(`${url}/new/${type}?name=${encodeURIComponent(sessionName)}`);
  }

  const MenuContent = (
    <Menu>
      <Menu.Item onClick={() => handleFinish(SessionType.PS_TO_OW)}>
        <Icon type="Add" /> {ThirdPartySystems.PS} to {ThirdPartySystems.OW}
      </Menu.Item>
    </Menu>
  );

  return (
    <Container>
      {display === displayState.EXPANDED && (
        <>
          <Input
            autoFocus
            placeholder="Enter configuration name"
            style={{ marginRight: '16px' }}
            onChange={handleChange}
            value={sessionName}
          />
          <Dropdown content={MenuContent}>
            <Button
              type="primary"
              style={{ height: '36px' }}
              disabled={sessionName === ''}
            >
              Create
            </Button>
          </Dropdown>
        </>
      )}
      {display === displayState.COLLAPSED && (
        <Button
          type="primary"
          icon="Add"
          onClick={() => setDisplay(displayState.EXPANDED)}
          style={{ height: '36px' }}
        >
          New Configuration
        </Button>
      )}
    </Container>
  );
};

export default CreateNewConfiguration;
