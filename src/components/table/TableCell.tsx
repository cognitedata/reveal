import {
  Body,
  Button,
  Dropdown,
  formatDate,
  formatDateTime,
  Label,
  LabelVariants,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import {
  DocumentsClassifier as Classifier,
  Document,
} from '@cognite/sdk-playground';
import { LabelDefinition } from '@cognite/sdk';
import { Tag, TagColor } from 'src/components/Tag';
import { globalConfig } from 'src/configs/global.config';
import { Navigation } from 'src/hooks/useNavigation';
import capitalize from 'lodash/capitalize';
import { ClassifierActions } from 'src/pages/Home/components/table/curateClassifierColumns';
import React from 'react';
import { CellProps } from 'react-table';
import { ClassifierStatus, ClassifierTrainingSet } from 'src/services/types';

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

      let color: TagColor = 'primary';

      if (value <= globalConfig.DOCUMENT_WARNING_THRESHOLD) {
        color = 'warning';
      }

      if (value <= globalConfig.DOCUMENT_ERROR_THRESHOLD) {
        color = 'error';
      }

      return (
        <Tooltip
          disabled={disableTooltip}
          content={globalConfig.DOCUMENT_THRESHOLD_TOOLTIP[color]}
        >
          <Tag color={color}>{value}</Tag>
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
      let variant: LabelVariants = 'success';

      if (value === 0) {
        variant = 'unknown';
      }

      if (matrix[item].outlier) {
        variant = 'warning';
      }

      return (
        <Label size="medium" variant={variant}>
          {value}
        </Label>
      );
    },
  Label:
    (variant?: LabelVariants) =>
    ({ value }: CellProps<any, string | undefined>) =>
      (
        <Label size="medium" variant={variant || 'unknown'}>
          {value || 'Unknown'}
        </Label>
      ),
  ClassifierStatusLabel: ({ value }: CellProps<any, ClassifierStatus>) => {
    const status = capitalize(value);

    if (value === 'queuing' || value === 'training') {
      return (
        <Label size="medium" icon="Loader" variant="default">
          {status}
        </Label>
      );
    }

    if (value === 'failed') {
      return (
        <Label size="medium" variant="danger">
          {status}
        </Label>
      );
    }

    return (
      <Label size="medium" variant="success">
        {status}
      </Label>
    );
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
                appendIcon="Delete"
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
