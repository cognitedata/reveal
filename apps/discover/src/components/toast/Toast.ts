import { ReactElement } from 'react';
import { ToastOptions } from 'react-toastify';

import { ToastPosition } from 'react-toastify/dist/types';

import { toast as CogniteToast } from '@cognite/cogs.js';

import { STANDARD_DURATION } from './constants';
import { ToastContentWithTitle } from './ToastContent';

interface BaseToastProps {
  type: 'default' | 'info' | 'warning' | 'error' | 'success';
  message: ReactElement | string;
  position?: ToastPosition;
}

// interface InfiniteToastProps extends BaseToastProps {}

const defaultOption = generateDurationOption(STANDARD_DURATION);

function generateInfiniteOption(position: ToastPosition | null) {
  if (position) {
    const option: ToastOptions = {
      autoClose: false,
      closeOnClick: false,
      position,
    };
    return option;
  }
  const option: ToastOptions = {
    autoClose: false,
    closeOnClick: false,
  };
  return option;
}

function generateDurationOption(duration: number) {
  const option: ToastOptions = { autoClose: duration };
  return option;
}

export const showInfiniteToast = (props: BaseToastProps) => {
  const option = generateInfiniteOption(props.position || null);
  CogniteToast.open(props.message, option);
};

export const showInfoMessageWithTitle = (title: string, bodyText: string) => {
  const message: ReactElement = ToastContentWithTitle(title, bodyText);
  CogniteToast.info(message, defaultOption);
};

export const showSuccessMessage = (content: string) => {
  CogniteToast.success(content, defaultOption);
};

export const showInfoMessage = (content: string) => {
  CogniteToast.info(content, defaultOption);
};

export const showWarningMessage = (content: string) => {
  CogniteToast.warning(content, defaultOption);
};

export const showErrorMessage = (
  content: string,
  options?: Partial<ToastOptions>
) => {
  CogniteToast.error(content, { ...defaultOption, ...options });
};
