import {
  Body,
  Button,
  formatDate,
  formatDateTime,
  Label,
  LabelVariants,
  Tooltip,
} from '@cognite/cogs.js';
import { Document } from '@cognite/sdk-playground';
import { Tag } from 'components/Tag';
import { globalConfig } from 'configs/global.config';
import { Navigation } from 'hooks/useNavigation';
import React from 'react';
import { CellProps } from 'react-table';
import { ClassifierTrainingSet } from 'services/types';
import { TagColor } from './Tag';

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
    return <Body level={2}>{value ? formatDate(value) : '-'}</Body>;
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
      let color: TagColor = 'primary';

      if (value <= globalConfig.DOCUMENT_WARNING_THRESHOLD) {
        color = 'warning';
      }

      if (value === globalConfig.DOCUMENT_ERROR_THRESHOLD) {
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
  Label:
    (variant?: LabelVariants) =>
    ({ value }: CellProps<any, string | undefined>) =>
      (
        <Label size="medium" variant={variant || 'unknown'}>
          {value || 'Unknown'}
        </Label>
      ),
  ManageFilesButton:
    (navigate: Navigation) =>
    ({
      row: {
        original: { label },
      },
    }: CellProps<ClassifierTrainingSet>) => {
      return (
        <Tooltip content="Manage files in label">
          <Button
            size="small"
            icon="Edit"
            type="tertiary"
            aria-label="Add files"
            onClick={() => navigate.toDocument(label)}
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
};
