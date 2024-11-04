/*!
 * Copyright 2024 Cognite AS
 */

import { type JSX, useState } from 'react';
import { remove } from '../../../architecture/base/utilities/extensions/arrayExtensions';

export class ModalManager extends Observable {
  private static _instance: ModalManager;
  private _modals: UiModal[] = [];

  private constructor() {
    super();
  }

  public static get instance(): ModalManager {
    if (!ModalManager._instance) {
      ModalManager._instance = new ModalManager();
    }
    return ModalManager._instance;
  }

  public show(modal: UiModal): void {
    this._modals.push(modal);
    this.notify();
  }

  public hide(modal: UiModal): void {
    remove(this._modals, modal);
    this.notify();
  }

  public get modals(): readonly UiModal[] {
    return this._modals;
  }
}

type ChangeListeners = (source: Observable, recursive: boolean) => void;

export abstract class Observable {
  private _listeners: ChangeListeners[] = [];
  public addEventListener(listener: ChangeListeners): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: ChangeListeners): void {
    remove(this._listeners, listener);
  }

  public notify(isRecursive = true): void {
    for (const listener of this._listeners) {
      listener(this, isRecursive);
    }
  }
}

export function ModalManagerView({ modalManager }: { modalManager: ModalManager }): JSX.Element {
  const [modals, setModals] = useState<readonly UiModal[]>([]);

  useOnUpdate(modalManager, () => {
    setModals([...modalManager.modals]);
  });

  return (
    <>
      {modals.map((modal) => {
        const key = modal.id.toString();
        return <ModalView key={key} modal={modal} />;
      })}
    </>
  );
}
