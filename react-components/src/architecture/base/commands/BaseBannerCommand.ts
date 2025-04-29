/*!
 * Copyright 2024 Cognite AS
 */

import { IconName } from '../utilities/IconName';
import { type TranslationInput } from '../utilities/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

export enum BannerStatus {
  Critical = 'critical',
  Neutral = 'neutral',
  Success = 'success',
  Warning = 'warning'
}
/**
 * Base class for all option like commands. Override createOptions to add options
 * or use add method to add them in.
 */

export abstract class BaseBannerCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  public abstract get content(): TranslationInput;

  public get status(): BannerStatus {
    return BannerStatus.Neutral;
  }
}
