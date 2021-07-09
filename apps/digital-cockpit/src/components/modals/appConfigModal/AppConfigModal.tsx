import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Button, Switch, Title, Tooltip } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import {
  ModalContainer,
  ModalFooter,
  SwitchContainer,
} from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { getConfigState } from 'store/config/selectors';
import { saveAppConfig } from 'store/config/thunks';

const AppConfiguration: React.FC = () => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('AppConfig');
  const { useAllGroups } = useSelector(getConfigState);
  const [useAllGroupsSelected, setUseAllGroupsSelected] =
    useState<boolean>(useAllGroups);

  const handleClose = () => {
    dispatch(modalClose());
  };

  const save = async () => {
    metrics.track('AppConfiguration');
    await dispatch(
      saveAppConfig(apiClient, { useAllGroups: useAllGroupsSelected })
    );
    handleClose();
  };

  const handleOnChange = () => {
    setUseAllGroupsSelected(!useAllGroupsSelected);
  };

  const footer = (
    <ModalFooter>
      <Button onClick={handleClose}>Cancel</Button>
      <Button type="primary" iconPlacement="left" onClick={save}>
        Save
      </Button>
    </ModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleClose}
        headerText="Change configuration"
        footer={footer}
        width={400}
        underlineColor="#db0657"
      >
        <ModalContainer>
          <Title level={5}>Application configuration</Title>
          <SwitchContainer>
            <Switch
              key="useAllGroups"
              name="useAllGroups"
              value={useAllGroupsSelected}
              size="small"
              onChange={handleOnChange}
            >
              <Tooltip content="Use only groups with sourceId (e.g. linked to AAD groups) or use all user groups">
                <span>Use all user groups</span>
              </Tooltip>
            </Switch>
          </SwitchContainer>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default AppConfiguration;
