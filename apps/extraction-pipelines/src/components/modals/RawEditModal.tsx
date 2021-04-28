import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';
import { ids } from 'cogs-variables';
import { ModalContent } from 'components/modals/ModalContent';
import Modal from 'components/modals/Modal';
import { DivFlex } from 'styles/flex/StyledFlex';
import { CloseButton } from 'styles/StyledButton';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import * as yup from 'yup';
import { StyledTitle3 } from 'styles/StyledHeadings';
import { DetailFieldNames, IntegrationRawTable } from 'model/Integration';
import { selectedRawTablesRule } from 'utils/validation/integrationSchemas';
import ConnectRawTablesInput from 'components/inputs/rawSelector/ConnectRawTablesInput';
import { useForm, FormProvider } from 'react-hook-form';
import { mapStoredToDefault } from 'utils/raw/rawUtils';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { yupResolver } from '@hookform/resolvers/yup';
import { CLOSE } from 'utils/constants';

interface RawEditModalProps {
  visible: boolean;
  onCancel: () => void;
}
const pageSchema = yup.object().shape({ ...selectedRawTablesRule });

interface ModalFormInput {
  selectedRawTables: IntegrationRawTable[];
}

export const RawEditModal: FunctionComponent<RawEditModalProps> = ({
  visible,
  onCancel,
}: PropsWithChildren<RawEditModalProps>) => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(selected?.id);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<ModalFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      selectedRawTables: mapStoredToDefault(storedIntegration?.rawTables)
        .selectedRawTables,
    },
  });

  const { register, setValue, setError, clearErrors } = methods;
  useEffect(() => {
    register('selectedRawTables');
  }, [register]);
  useEffect(() => {
    if (storedIntegration?.rawTables) {
      setValue('selectedRawTables', storedIntegration.rawTables);
    }
  }, [setValue, storedIntegration]);

  const onSelect = async (values: IntegrationRawTable[]) => {
    clearErrors('selectedRawTables');
    if (storedIntegration && project) {
      const t = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldValue: values,
        fieldName: 'rawTables',
      });
      await mutate(t, {
        onError: () => {
          setError('selectedRawTables', {
            type: 'server',
            message: `Could not store raw table`,
          });
        },
      });
    } else {
      setError('selectedRawTables', {
        type: 'server',
        message: `Could not store raw table`,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      width={872}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <ModalContent
        title={
          <DivFlex justify="flex-end">
            <CloseButton onClick={onCancel} />
          </DivFlex>
        }
        onOk={onCancel}
        okText={CLOSE}
      >
        <StyledTitle3 data-testid="raw-table-edit-modal">
          {DetailFieldNames.RAW_TABLE}
        </StyledTitle3>
        <FormProvider {...methods}>
          <ConnectRawTablesInput onSelect={onSelect} />
        </FormProvider>
      </ModalContent>
    </Modal>
  );
};
