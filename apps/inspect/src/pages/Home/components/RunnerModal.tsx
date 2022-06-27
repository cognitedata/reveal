import { Loader } from '@cognite/cogs.js';
import { Modal } from 'components/Modal/Modal';
import ModalFooter from 'components/Modal/ModalFooter';
import { useResultSchemaMutation } from 'hooks/useResultSchemasMutate';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';
import {
  getAuthHeaders,
  getDefaultHeader,
  getProjectInfo,
} from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { showWarningMessage } from 'components/Toast';

import { DocumentPreview } from '../../../components/DocumentPreview/DocumentPreview';
import { useDocumentByLabelExternalId } from '../../../hooks/useDocumentByLabelExternalId';
import { useGptResult } from '../../../hooks/useGptResult';
import { useLabelSchemas } from '../../../hooks/useLabelSchemas';
import { useResultSchemas } from '../../../hooks/useResultSchemas';

import { KeysAssessment } from './KeysAssessment';

export interface Option<Value> {
  label: string;
  value: Value;
}

const useData = ({
  labelExternalId,
  documentIndex,
}: {
  labelExternalId?: string;
  documentIndex: number;
}) => {
  const { data: documents } = useDocumentByLabelExternalId(labelExternalId);

  const { data: labelSchemas } = useLabelSchemas();
  const doc = documents?.[documentIndex];

  const documentId = doc?.id;

  const { data: resultSchema, isFetched } = useResultSchemas(documentId);

  const schema = labelSchemas?.find(
    (labelSchema) => labelSchema.labelExternalId === labelExternalId
  );

  const shouldFetchGPT =
    isFetched && isEmpty(resultSchema?.responseRaw) && !!schema;

  // console.log('isFetched', { documentId, isFetched });
  // console.log('resultSchema?.responseRaw', resultSchema?.responseRaw);
  // console.log('shouldFetchGPT', shouldFetchGPT);
  // console.log('schema', schema);

  return {
    shouldFetchGPT,
    data: resultSchema,
    schemaKeys: schema?.keys || [],
  };
};

export const RunnerModal: React.FC<{
  labelExternalId: string | undefined;
  onModalClose: () => void;
}> = ({ labelExternalId, onModalClose }) => {
  const { mutate } = useResultSchemaMutation();
  const { data: documents } = useDocumentByLabelExternalId(labelExternalId);
  const [project] = getProjectInfo();
  const [documentIndex, setDocumentIndex] = React.useState(0);
  const { schemaKeys, shouldFetchGPT, data } = useData({
    labelExternalId,
    documentIndex: 0,
  });

  const headers = {
    ...getAuthHeaders(),
    ...getDefaultHeader(),
    'x-cdp-project': project,
    'x-gpt-key': sidecar.gptKey,
  };

  const doc = documents?.[documentIndex];
  const documentId = doc?.id;
  const assetId = doc?.assetIds?.[0];

  const { isError: isErrorFetchingGTP } = useGptResult(
    documentId,
    assetId,
    schemaKeys,
    shouldFetchGPT,
    headers
  );

  const handleEdit = (name: string, value: string) => {
    // console.log('finalSchema', resultSchema?.finalSchema);
    const updatedSchema = {
      ...data?.finalSchema,
      [name]: value,
    };

    if (!documentId) {
      showWarningMessage('Error, missing doc id');
      onModalClose();
      return;
    }

    mutate({
      key: documentId,
      finalSchema: updatedSchema,
    });
  };

  if (isErrorFetchingGTP) {
    showWarningMessage('Error connecting to data extraction service');
    onModalClose();
    return null;
  }
  if (!labelExternalId || !documents) return null;
  if (!data?.responseRaw) return <Loader />;

  const values = Object.entries(data.finalSchema).map((value) =>
    String(value[1]).trim()
  );

  return (
    <Modal
      title="Validate the schemas"
      visible
      onCancel={onModalClose}
      onOk={onModalClose}
      footer={
        <ModalFooter
          data={documents}
          index={documentIndex}
          onPrev={() => setDocumentIndex((prevState) => prevState - 1)}
          onNext={() => setDocumentIndex((prevState) => prevState + 1)}
        />
      }
    >
      <Container>
        {documents?.length === 0 && (
          <p>No documents classified with given label</p>
        )}
        {documentId && (
          <DocumentPreview documentId={documentId} itemsToHighlight={values} />
        )}
        <Container>
          <KeysAssessment handleEdit={handleEdit} keys={data.finalSchema} />
        </Container>
      </Container>
    </Modal>
  );
};

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
`;
