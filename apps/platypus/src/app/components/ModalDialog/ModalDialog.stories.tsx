import { useState } from 'react';
import { Button, Checkbox } from '@cognite/cogs.js';
import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '../Styles/storybook';

import { ModalDialog } from './ModalDialog';

export default {
  title: 'Basic components/ModalDialog',
  component: ModalDialog,
};

export const Base = () => {
  const [showDialogDefault, setShowDialogDefault] = useState(false);
  const [showDialogCustom, setShowDialogCustom] = useState(false);
  const [confirmSing, setConfirmSing] = useState(false);

  return (
    <>
      <Wrapper>
        <MainTitle>Data Model card represents the data model object.</MainTitle>
        <MainDescription title="Where is it used?">
          It is used at many places actually. For instance when user tries to
          delete a data model.
        </MainDescription>
        <Group>
          <GroupTitle>Simple information dialog</GroupTitle>
          <div>
            <Button onClick={() => setShowDialogDefault(true)}>
              Show dialog
            </Button>
          </div>
        </Group>
        <Group>
          <GroupTitle>
            Dialog with custom button name and progress indication
          </GroupTitle>
          <div>
            <Button onClick={() => setShowDialogCustom(true)}>
              Show dialog
            </Button>
          </div>
        </Group>
      </Wrapper>
      {showDialogDefault && (
        <ModalDialog
          visible={showDialogDefault}
          title="About Cognite AS"
          onCancel={() => setShowDialogDefault(false)}
          onOk={() => setShowDialogDefault(false)}
          cancelHidden
        >
          Cognite AS is a Norwegian software as a service company with
          headquarters in <strong>Oslo</strong>, Norway and offices in Tokyo,
          Houston and Austin. The company provides software and industrial
          internet of things (IIoT) services to industrial companies.
        </ModalDialog>
      )}

      {showDialogCustom && (
        <ModalDialog
          visible={showDialogCustom}
          title="Confirm karaoke perfomance"
          onCancel={() => {
            setShowDialogCustom(false);
            setConfirmSing(false);
          }}
          onOk={() => false}
          okDisabled={!confirmSing}
          okButtonName="Sing"
          okProgress={confirmSing}
        >
          Are you sure you want to sing "We are the champions" song? You will
          lose all of your respect of your friends, and you will not be able to
          restore it later.
          <div style={{ margin: '15px 0 0 0' }}>
            <Checkbox
              name="ConfirmSing"
              checked={confirmSing}
              onChange={() => setConfirmSing(!confirmSing)}
            />{' '}
            Yes, I’m sure I want to sing this beautiful song.
          </div>
        </ModalDialog>
      )}
    </>
  );
};
