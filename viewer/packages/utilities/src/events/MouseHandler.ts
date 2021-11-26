import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import { EventTrigger } from './EventTrigger';
import debounce from 'lodash/debounce';
import { assertNever } from '@reveal/utilities';

type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;

export class MouseHandler {
    private domElement: HTMLElement;

    private _events = {
        click: new EventTrigger<PointerEventDelegate>(),
        hover: new EventTrigger<PointerEventDelegate>()
    };

    constructor(domElement: HTMLElement) {
        this.domElement = domElement;

        const maxMoveDistance = 4;
        const maxClickDuration = 250;

        let pointerDown = false;
        let pointerDownTimestamp = 0;
        let validClick = false;

        const onHoverCallback = debounce((e: MouseEvent) => {
            this._events.hover.fire(clickOrTouchEventOffset(e, domElement));
          }, 100);

        const onMove = (e: MouseEvent | TouchEvent) => {
            const { offsetX, offsetY } = clickOrTouchEventOffset(e, domElement);
            const { offsetX: firstOffsetX, offsetY: firstOffsetY } = clickOrTouchEventOffset(e, domElement);

            // check for Manhattan distance greater than maxMoveDistance pixels
            if (
                pointerDown &&
                validClick &&
                Math.abs(offsetX - firstOffsetX) + Math.abs(offsetY - firstOffsetY) > maxMoveDistance
            ) {
                validClick = false;
            }
        };

        const onUp = (e: MouseEvent | TouchEvent) => {
            const clickDuration = e.timeStamp - pointerDownTimestamp;
            if (pointerDown && validClick && clickDuration < maxClickDuration) {
                // trigger events
                this._events.click.fire(clickOrTouchEventOffset(e, domElement));
            }
            pointerDown = false;
            validClick = false;

            // move
            domElement.removeEventListener('mousemove', onMove);
            domElement.removeEventListener('touchmove', onMove);

            // up
            domElement.removeEventListener('mouseup', onUp);
            domElement.removeEventListener('touchend', onUp);

            // add back onHover
            domElement.addEventListener('mousemove', onHoverCallback);
        };

        const onDown = (e: MouseEvent | TouchEvent) => {
            event = e;
            pointerDown = true;
            validClick = true;
            pointerDownTimestamp = e.timeStamp;

            // move
            domElement.addEventListener('mousemove', onMove);
            domElement.addEventListener('touchmove', onMove);

            // up
            domElement.addEventListener('mouseup', onUp);
            domElement.addEventListener('touchend', onUp);

            // no more onHover
            domElement.removeEventListener('mousemove', onHoverCallback);
        };

        // down
        domElement.addEventListener('mousedown', onDown);
        domElement.addEventListener('touchstart', onDown);

        // on hover callback
        domElement.addEventListener('mousemove', onHoverCallback);
    }
    /**
   * @example
   * ```js
   * const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
   * viewer.on('click', onClick);
   * ```
   */
    on(event: 'click' | 'hover', callback: PointerEventDelegate): void {
        switch (event) {
            case 'click':
                this._events.click.subscribe(callback as PointerEventDelegate);
                break;

            case 'hover':
                this._events.hover.subscribe(callback as PointerEventDelegate);
                break;
            default:
                assertNever(event);
        }
    }

    off(event: 'click' | 'hover', callback: PointerEventDelegate): void {
        switch (event) {
            case 'click':
                this._events.click.unsubscribe(callback as PointerEventDelegate);
                break;

            case 'hover':
                this._events.hover.unsubscribe(callback as PointerEventDelegate);
                break;
            default:
                assertNever(event);
        }
    }
}