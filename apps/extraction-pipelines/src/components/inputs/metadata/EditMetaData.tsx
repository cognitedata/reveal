import React, { useState } from 'react';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { toCamelCase, uppercaseFirstWord } from 'utils/primitivesUtils';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { Button, Input } from '@cognite/cogs.js';
import { MetaData } from 'model/MetaData';
import { ModalContent } from 'components/modals/ModalContent';
import { StyledTableNoRowColor2 } from 'components/styled';
import { getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

type SuperProps = {
  close: () => void;
};
type ViewProps = {
  onConfirm: (updatedMetadata: MetaData) => void;
  onCancel: () => void;
  initialMetadata: MetaData;
};

type MetadataEditType = { key: string; value: string };

const objectToArray = (metadata: MetaData): MetadataEditType[] =>
  metadata
    ? Object.entries(metadata).map(([k, v]) => {
      return { key: uppercaseFirstWord(k), value: v };
    })
    : [];

const arrayToMeta = (updatedMetadata: MetadataEditType[]) =>
  updatedMetadata
    .filter((m) => m.key.trim().length >= 1)
    .reduce((acc, curr) => {
      const metaKey = toCamelCase(curr.key).trim();
      return { ...acc, [metaKey]: curr.value.trim() };
    }, {});

function generateRandomId() {
  return `x${Math.random()}`;
}

export const EditMetaDataView = ({
  onConfirm,
  onCancel,
  initialMetadata,
}: ViewProps) => {
  const { t } = useTranslation();
  const initialMetadataList = objectToArray(initialMetadata);
  const [metadata, setMetadata] = useState(
    (initialMetadataList.length >= 1
      ? initialMetadataList
      : [{ key: '', value: '' }]
    ).map((meta) => ({
      ...meta,
      reactKey: generateRandomId(),
    }))
  );

  const setValueAt = (index: number, v: string) => {
    setMetadata(
      metadata.map((mm, i) => (index === i ? { ...mm, value: v } : mm))
    );
  };
  const setKeyAt = (index: number, v: string) => {
    setMetadata(
      metadata.map((mm, i) => (index === i ? { ...mm, key: v } : mm))
    );
  };
  const deleteRow = (index: number) => {
    setMetadata(metadata.filter((m, i) => i !== index));
  };
  const addRow = () => {
    setMetadata([
      ...metadata,
      { key: '', value: '', reactKey: generateRandomId() },
    ]);
  };

  return (
    <>
      <ModalContent>
        <div css="display: flex; flex-direction: column; gap: 1rem">
          <StyledTableNoRowColor2>
            <table className="cogs-table">
              <thead>
                <tr>
                  <td>{t('key')}</td>
                  <td>{t('value')}</td>
                  <td />
                </tr>
              </thead>
              <tbody>
                {metadata.map((meta, index) => {
                  return (
                    <tr key={meta.reactKey}>
                      <td>
                        <Input
                          fullWidth
                          value={meta.key}
                          placeholder={t('enter-key')}
                          onChange={(ev) => setKeyAt(index, ev.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          fullWidth
                          placeholder={t('enter-value')}
                          value={meta.value}
                          onChange={(ev) => setValueAt(index, ev.target.value)}
                        />
                      </td>
                      <td>
                        <Button
                          type="ghost"
                          icon="Close"
                          aria-label="Remove metadata row"
                          onClick={() => deleteRow(index)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </StyledTableNoRowColor2>
          <div>
            <Button icon="AddLarge" onClick={addRow} data-testId="add-fields-btn">
              {t('add-fields')}
            </Button>
          </div>
        </div>
      </ModalContent>
      <div key="modal-footer" className="cogs-modal-footer-buttons">
        <Button type="ghost" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="primary" onClick={() => onConfirm(arrayToMeta(metadata))} data-testId="confirm-btn">
          {t('confirm')}
        </Button>
      </div>
    </>
  );
};

export const EditMetaData = (props: SuperProps) => {
  const project = getProject();
  const { extpipe } = useSelectedExtpipe();
  const { data: current } = useExtpipeById(extpipe?.id);
  const { mutate } = useDetailsUpdate();

  const onConfirm = (updatedMetadata: MetaData) => {
    if (!current || !project) return;
    const updateSpec = createUpdateSpec({
      id: current.id,
      project,
      fieldName: 'metadata',
      fieldValue: updatedMetadata,
    });
    mutate(updateSpec);
    props.close();
  };

  if (!current) return null;
  return (
    <EditMetaDataView
      onConfirm={onConfirm}
      onCancel={props.close}
      initialMetadata={current.metadata || {}}
    />
  );
};
