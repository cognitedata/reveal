import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Button, Switch, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import {
  ModalContainer,
  ModalFooter,
  SwitchContainer,
} from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { ApplicationItem } from 'store/config/types';
import { saveApplicationsList } from 'store/config/thunks';
import useCogniteApplications from 'hooks/useCogniteApplications';

const SelectApplications: React.FC = () => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');
  const { activeApplications, allApplications } = useCogniteApplications();
  const [apps, setApps] = useState<string[]>(
    activeApplications.map((app) => app.key) || []
  );

  const handleClose = () => {
    dispatch(modalClose());
  };

  const save = async () => {
    metrics.track('SelectApplications', apps);
    handleClose();
    await dispatch(saveApplicationsList(apiClient, apps));
  };

  const handleOnChange = (appKey: string) => {
    if (apps.includes(appKey)) {
      setApps(apps.filter((key) => key !== appKey));
    } else {
      setApps((prevState) => [appKey, ...prevState]);
    }
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
    <Modal
      visible
      onCancel={handleClose}
      headerText="Select Applications"
      footer={footer}
      width={400}
      underlineColor="#db0657"
    >
      <ModalContainer>
        <Title level={5}>Select deployed applications</Title>
        <SwitchContainer>
          {allApplications.map((app: ApplicationItem) => (
            <Switch
              key={app.key}
              name={app.key}
              value={apps.includes(app.key)}
              size="small"
              onChange={() => handleOnChange(app.key)}
            >
              {app.title}
            </Switch>
          ))}
        </SwitchContainer>
      </ModalContainer>
    </Modal>
  );
};

export default SelectApplications;
