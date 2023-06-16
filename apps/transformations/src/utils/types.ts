import { TransformationRead } from '@transformations/types';

import { ModalProps } from '@cognite/cogs.js';

export interface AccessPermission {
  acl: string;
  actions: string[];
  scope?: { type: string; value: string };
}

export const isTruthy = <T>(item: T | undefined | null | false): item is T => {
  return Boolean(item);
};

export type CredentialsModalProps = {
  onCancel: () => void;
  transformation: TransformationRead;
  visible: ModalProps['visible'];
};

export type TransformationMapping = {
  enabled: boolean;
  version: 1;
  sourceType: 'raw' | 'clean' | 'fdm';
  sourceLevel1?: string;
  sourceLevel2?: string;
  mappings: {
    from: string;
    to: string;
    asType?: string;
  }[];
};

export type ColorStatus =
  | 'critical'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'undefined';
