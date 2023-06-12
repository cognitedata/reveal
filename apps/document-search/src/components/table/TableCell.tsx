/* eslint-disable no-nested-ternary */
import React from 'react';
import { CellProps } from 'react-table';

import capitalize from 'lodash/capitalize';

import {
  Body,
  Button,
  Dropdown,
  formatDate,
  formatDateTime,
  Chip,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { ExternalId, LabelDefinition } from '@cognite/sdk';
import {
  DocumentsClassifier as Classifier,
  Document,
} from '@cognite/sdk-playground';
import { globalConfig } from '../../configs/global.config';
import { ChipType } from '../../enums';
import { Navigation } from '../../hooks/useNavigation';
import { ClassifierActions } from '../../pages/Home/components/table/curateClassifierColumns';
import { ClassifierStatus, ClassifierTrainingSet } from '../../services/types';

// NOTE: This file is getting too big.
// Move the cell render's that are specific to the columns, closer to the curating columns.
// And have the generic ones stay in this function.
export const TableCell = {
  Text:
    ({ strong } = { strong: false }) =>
    ({ value }: CellProps<any, string | undefined>) => {
      return (
        <Body strong={strong} level={2}>
          {value || '-'}
        </Body>
      );
    },
  Date: ({ value }: CellProps<any, number | undefined>) => {
    return <Body level={2}>{value ? formatDate(value, true) : '-'}</Body>;
  },
  DateTime: ({ value }: CellProps<any, number | undefined>) => {
    return <Body level={2}>{value ? formatDateTime(value) : '-'}</Body>;
  },
  Number: ({ value }: CellProps<any, number | undefined>) => {
    return <Body level={2}>{value ? value.toFixed(3) : '-'}</Body>;
  },
  DocumentTag:
    ({ disableTooltip } = { disableTooltip: false }) =>
    ({ value }: CellProps<any, number>) => {
      if (value === undefined) {
        return '-';
      }

      const color =
        value <= globalConfig.DOCUMENT_WARNING_THRESHOLD
          ? ChipType.Warning
          : value <= globalConfig.DOCUMENT_ERROR_THRESHOLD
          ? ChipType.Warning
          : ChipType.Neutral;

      return (
        <Tooltip
          disabled={disableTooltip}
          content={globalConfig.DOCUMENT_THRESHOLD_TOOLTIP[color]}
        >
          <Chip size="small" icon="Document" label={`${value}`} type={color} />
        </Tooltip>
      );
    },
  MatrixLabel:
    (item: string) =>
    ({
      value,
      row: {
        original: { matrix },
      },
    }: CellProps<any, number>) => {
      let type: ChipType | undefined = ChipType.Success;

      if (value === 0) {
        type = undefined;
      }

      if (matrix[item].outlier) {
        type = ChipType.Warning;
      }

      return <Chip size="medium" type={type} label={`${value}`} />;
    },
  Label:
    (type?: ChipType) =>
    ({ value }: CellProps<any, string | undefined>) =>
      <Chip size="medium" type={type || undefined} label={`${value}`} />,
  ClassifierStatusLabel: ({
    value,
    row: {
      original: { errorMessage },
    },
  }: CellProps<any, ClassifierStatus>) => {
    const status = capitalize(value);

    if (value === 'queuing' || value === 'training') {
      return <Chip size="medium" icon="Loader" type="default" label={status} />;
    }

    if (value === 'failed') {
      return (
        <Tooltip content={errorMessage}>
          <Chip size="medium" type="danger" label={status} />
        </Tooltip>
      );
    }

    return <Chip size="medium" type="success" label={status} />;
  },
  ManageFilesButton:
    (navigate: Navigation) =>
    ({
      row: {
        original: { id },
      },
    }: CellProps<ClassifierTrainingSet>) => {
      return (
        <Tooltip content="Manage files in label">
          <Button
            size="small"
            icon="Edit"
            type="tertiary"
            aria-label="Manage files"
            onClick={() => navigate.toLabel(id)}
          />
        </Tooltip>
      );
    },
  ViewLabelButton:
    (navigate: Navigation) =>
    ({
      row: {
        original: { externalId },
      },
    }: CellProps<LabelDefinition>) => {
      return (
        <Tooltip content="Manage files in label">
          <Button
            size="small"
            icon="Edit"
            type="tertiary"
            aria-label="Manage files"
            onClick={() => navigate.toLabel(externalId)}
          />
        </Tooltip>
      );
    },
  DeleteLabelButton:
    (deleteLabels: (ids: ExternalId[]) => void) =>
    ({
      row: {
        original: { externalId },
      },
    }: CellProps<LabelDefinition>) => {
      return (
        <Tooltip content="Delete label">
          <Button
            size="small"
            icon="Delete"
            type="destructive"
            aria-label="Delete label"
            onClick={() => deleteLabels([{ externalId }])}
          />
        </Tooltip>
      );
    },
  PreviewDocumentButton:
    (toggleDocumentPreview: (documentId: number) => void) =>
    ({
      row: {
        original: { id },
      },
    }: CellProps<Document>) => {
      return (
        <Button
          icon="Document"
          type="secondary"
          onClick={() => toggleDocumentPreview(id)}
        >
          Preview
        </Button>
      );
    },

  ClassifierActions:
    (classifierActionsCallback: ClassifierActions) =>
    ({ row: { original } }: CellProps<Classifier>) => {
      return (
        <Dropdown
          content={
            <Menu style={{ width: '12rem' }}>
              <Menu.Header>Classifier actions</Menu.Header>

              <Menu.Item
                disabled={!original.metrics}
                onClick={() => {
                  classifierActionsCallback('confusion_matrix', original);
                }}
              >
                Review/deploy model
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                onClick={() => classifierActionsCallback('delete', original)}
                icon="Delete"
                style={{ color: '#D51A46' }}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Button
            type="ghost"
            icon="EllipsisVertical"
            aria-label="Classifier actions"
          />
        </Dropdown>
      );
    },
};
