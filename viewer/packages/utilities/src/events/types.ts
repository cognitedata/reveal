/*!
 * Copyright 2022 Cognite AS
 */
export type EmptyEvent = null;

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 */
export type PointerEvent = { offsetX: number; offsetY: number };

/**
 * Listener for events.
 */
export type EventListener<TEventArgs> = (event: TEventArgs) => void;
