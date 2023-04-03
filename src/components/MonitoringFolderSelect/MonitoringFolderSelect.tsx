import React, { useState, useEffect, useCallback } from 'react';
import { Divider, Row } from 'antd';
import { Controller } from 'react-hook-form';

import { Button, Icon, Select, toast } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import { delay, head } from 'lodash';
import styled from 'styled-components';
import { CogniteError } from '@cognite/sdk';
import { trackUsage } from 'services/metrics';
import { useCreateMonitoringFolder, useMonitoringFolders } from './hooks';

const defaultTranslations = makeDefaultTranslations(
  'Unable to create monitoring job',
  'Folder is required',
  'Create folder:',
  'Select or create folder'
);

type Props = {
  translations?: typeof defaultTranslations;
  control: any;
  inputName: string;
  setValue: any;
};
const MonitoringFolderSelect: React.FC<Props> = ({
  translations,
  control,
  inputName,
  setValue,
}) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const { data: folderList, isLoading: loadingFolders } =
    useMonitoringFolders();
  const {
    data: newFolderData,
    isSuccess: folderCreatedSuccess,
    mutate: createMonitoringJob,
    isLoading: creatingMonitoringJob,
    isError: createMonitoringJobError,
    error: createMonitoringJobErrorMsg,
  } = useCreateMonitoringFolder();
  const [name, setName] = useState('');

  const createMonitoringJobErrorText = t['Unable to create monitoring job'];

  useEffect(() => {
    if (createMonitoringJobError) {
      const allErrors: CogniteError =
        createMonitoringJobErrorMsg as CogniteError;
      const messages = allErrors
        .toJSON()
        .message.errors.map((err: any) => err.message)
        .join(',');
      toast.error(`${createMonitoringJobErrorText} ${messages}`);
    }
  }, [
    createMonitoringJobError,
    createMonitoringJobErrorMsg,
    createMonitoringJobErrorText,
  ]);

  useEffect(() => {
    if (folderCreatedSuccess && newFolderData?.length) {
      setValue(inputName, {
        value: newFolderData[0].id,
        label: newFolderData[0].name,
      });
    }
  }, [newFolderData, folderCreatedSuccess]);

  const onNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );

  const handleCreateFolder = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (name !== '') {
      createMonitoringJob({
        folderExternalID: `${name}`,
        folderName: `${name}`,
      });
      trackUsage('Sidebar.Monitoring.CreateFolder', { folder: name });
      e.preventDefault();
      setName('');
    }
  };

  /**
   * Attaches a change event listener on the Cogs Select Input
   */
  const injectInputChangeListener = () => {
    const intvl = setInterval(() => {
      const inputs = document.querySelectorAll('#select-monitoring-input');
      if (inputs.length > 0) {
        clearInterval(intvl);
        const inputElement: HTMLInputElement = head(inputs) as HTMLInputElement;
        inputElement.addEventListener('input', (e) => {
          delay(onNameChange, 300, e);
        });

        inputElement.addEventListener('blur', (e) => {
          delay(onNameChange, 300, e);
        });
      }
    }, 200);
  };

  useEffect(() => {
    injectInputChangeListener();
  }, []);

  const showCreateButton =
    !folderList?.find((folder) => {
      return folder.name === name;
    }) && name.length > 0;

  return (
    <Controller
      control={control}
      name={inputName}
      rules={{
        required: t['Folder is required'],
      }}
      render={({ field: { onChange, onBlur, value, ref } }) => {
        return (
          <Select
            placeholder={t['Select or create folder']}
            inputId="select-monitoring-input"
            value={value}
            ref={ref}
            onBlur={onBlur}
            onChange={(selectOption: { label: string; value: string }) => {
              trackUsage('Sidebar.Monitoring.ExistingFolder', {
                folder: selectOption.label,
              });
              onChange(selectOption);
            }}
            options={
              folderList?.map((item) => ({
                label: item.name,
                value: item.id,
              })) || []
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                {(loadingFolders || creatingMonitoringJob) && (
                  <div
                    className="cogs-select__option"
                    style={{ justifyContent: 'center' }}
                  >
                    <Icon type="Loader" />
                  </div>
                )}
                {showCreateButton && (
                  <>
                    <DividerStyled />
                    <Row>
                      <ButtonStyled type="primary" onClick={handleCreateFolder}>
                        {t['Create folder:']} {name}
                      </ButtonStyled>
                    </Row>
                  </>
                )}
              </>
            )}
          />
        );
      }}
    />
  );
};

const DividerStyled = styled(Divider)`
  margin: 8px 0;
`;

const ButtonStyled = styled(Button)`
  width: 100%;
`;

export default MonitoringFolderSelect;
