import { useState, useEffect } from 'react';

import sdk from '@cognite/cdf-sdk-singleton';
import {
  Modal,
  Input,
  Textarea,
  Overline,
  Flex,
  Body,
  Divider,
  SegmentedControl,
  Select,
  OptionType,
} from '@cognite/cogs.js';

import { useApps } from '../../hooks/useApps';
import { getContainer } from '../../utils';

import { StreamLitAppSpec } from './types';

type AppSetingsProps = {
  app: StreamLitAppSpec;
  onClose: () => void;
  onSave: (app: StreamLitAppSpec) => void;
};

const AppSettings = ({ app, onClose, onSave }: AppSetingsProps) => {
  const [appName, setAppName] = useState(app.name);
  const [appDescription, setAppDescription] = useState(app.description);
  const [appCreator, setAppCreator] = useState(app.creator);
  const [dataSetName, setDataSetName] = useState<string>();
  const [publishedStatus, setPublishedStatus] = useState<string>();
  const [entrypoint, setEntrypoint] = useState(app.code.entrypoint);
  const [appPackages, setAppPackages] = useState(
    app.code.requirements.join('\n')
  );

  const { refetch: refetchApps } = useApps();

  useEffect(() => {
    (async () => {
      if (app.dataSetId) {
        const dataSets = await sdk.datasets.retrieve([{ id: app.dataSetId }]);
        if (dataSets.length > 0) {
          setDataSetName(dataSets[0].name);
        }
      }
      if (app.published) {
        setPublishedStatus('published');
      } else {
        setPublishedStatus('unpublished');
      }
    })();
  }, [app]);

  return (
    <Modal
      visible
      okDisabled={appName.trim() === ''}
      onCancel={() => onClose()}
      onOk={async () => {
        let appPackageList = appPackages.split('\n');
        // Packages will be split on new line (remove empty lines)
        appPackageList = appPackageList.filter((p) => p.trim() !== '');

        const newApp = {
          ...app,
          name: appName,
          description: appDescription,
          creator: appCreator,
          published: publishedStatus === 'published' ? true : false,
          code: {
            ...app.code,
            entrypoint,
            requirements: appPackageList,
          },
        };

        if (app.code.entrypoint !== newApp.code.entrypoint) {
          // For some reason, the app entrypoint cannot be in the pages folder, so we'll move it outside, but it should not be considered a library
          const newEntrypoint = newApp.code.entrypoint;
          if (newEntrypoint.startsWith('pages/')) {
            // We need to move the entrypoint outside the pages folder
            newApp.code.entrypoint = newEntrypoint.replace('pages/', ''); // Replace the entrypoint filename itself
            newApp.code.files[newEntrypoint.replace('pages/', '')] =
              newApp.code.files[newEntrypoint]; // Move the file to the root
            delete newApp.code.files[newEntrypoint]; // Delete the old file
          }

          // Now the existing entrypoint should be moved into the pages folder
          const oldEntrypoint = app.code.entrypoint;
          newApp.code.files['pages/' + oldEntrypoint] =
            newApp.code.files[oldEntrypoint];
          delete newApp.code.files[oldEntrypoint];
        }

        await onSave(newApp);

        setTimeout(() => refetchApps(), 500);
        onClose();
      }}
      title="App settings"
    >
      <Flex direction="column" gap={8}>
        <Body level={3}>App name</Body>
        <Input
          fullWidth
          onChange={(event) => setAppName(event.target.value)}
          value={appName}
          placeholder="Pump dashboard"
        />
        <Body level={3}>Description</Body>
        <Input
          fullWidth
          onChange={(event) => setAppDescription(event.target.value)}
          value={appDescription}
          placeholder="A dashboard for monitoring pumps"
        />
        <Body level={3}>Creator</Body>
        <Input
          fullWidth
          onChange={(event) => setAppCreator(event.target.value)}
          value={appCreator}
          placeholder="user@company.com"
        />

        <SegmentedControl
          onButtonClicked={setPublishedStatus}
          currentKey={publishedStatus}
        >
          <SegmentedControl.Button key="published">
            Published
          </SegmentedControl.Button>
          <SegmentedControl.Button key="unpublished">
            Unpublished
          </SegmentedControl.Button>
        </SegmentedControl>
        <Body level={3}>Data set</Body>
        <Input
          fullWidth
          disabled
          value={dataSetName || 'No data set'}
          placeholder="user@company.com"
        />
        <Body level={3}>Entrypoint</Body>
        <Select
          fullWidth
          options={Object.keys(app.code.files)
            .filter(
              (el) => el.startsWith('pages/') || el === app.code.entrypoint
            )
            .map((file) => ({
              value: file,
              label: file.replace('pages/', ''),
            }))}
          onChange={(selectedOption: OptionType<string> | null) => {
            if (selectedOption?.value) {
              setEntrypoint(selectedOption.value);
            }
          }}
          menuPortalTarget={getContainer()}
          value={
            entrypoint
              ? { value: entrypoint, label: entrypoint.replace('pages/', '') }
              : undefined
          }
        />
        <Divider style={{ marginTop: 12, marginBottom: 12 }} />
        <Overline level={2}>Installed packages</Overline>
        <Body level={3}>
          You can add your own packages here in a requirements.txt format. Some
          packages are pre-installed in your workspace and can not be changed.
          Removing a package from this list will uninstall it.
        </Body>
        <Textarea
          fullWidth
          onChange={(event) => {
            setAppPackages(event.target.value);
          }}
          value={appPackages}
        />
      </Flex>
    </Modal>
  );
};

export default AppSettings;
