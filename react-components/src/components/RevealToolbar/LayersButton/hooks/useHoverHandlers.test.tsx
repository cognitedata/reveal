import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, act, RenderHookResult } from '@testing-library/react';
import { useHoverHandlers } from './useHoverHandlers';

type HookReturn = ReturnType<typeof useHoverHandlers>;

vi.useFakeTimers();

describe(useHoverHandlers.name, () => {
    let result: RenderHookResult<HookReturn, {isDisabled: boolean}>['result'];

    const renderUseHoverHandlers = (isDisabled: boolean = false) => {
        return renderHook(() => useHoverHandlers(isDisabled));
    };

    beforeEach(() => {
        result = renderUseHoverHandlers(false).result;
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    test('should return initial state and handlers', () => {
        const { result } = renderUseHoverHandlers();
        const {hoverHandlers, isPanelOpen, setPanelToClose} = result.current;

        expect(isPanelOpen).toBe(false);
        expect(hoverHandlers).toBeDefined();
        expect(setPanelToClose).toBeDefined();
        expect(hoverHandlers.onMouseEnter).toBeDefined();
        expect(hoverHandlers.onMouseLeave).toBeDefined();
    });

    test('should open the panel immediately on mouse enter', () => {
        const { result } = renderUseHoverHandlers();

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });

        expect(result.current.isPanelOpen).toBe(true);
    });

    test('should start closing the panel on mouse leave, but remain open immediately after', () => {
        const { result } = renderUseHoverHandlers();

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });
        expect(result.current.isPanelOpen).toBe(true);

        act(() => {
            result.current.hoverHandlers.onMouseLeave();
        });

        // It should still be open right after leave, as the timeout hasn't executed
        expect(result.current.isPanelOpen).toBe(true);
    });

    test('should close the panel after the timeout delay (100ms) on mouse leave', () => {
        const { result } = renderUseHoverHandlers(false);

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });

        act(() => {
            result.current.hoverHandlers.onMouseLeave();
        });

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current.isPanelOpen).toBe(false);
    });

    test('should cancel the close timeout if mouse enters again before delay expires', () => {
        const { result } = renderUseHoverHandlers(false);

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });

        act(() => {
            result.current.hoverHandlers.onMouseLeave();
        });
        expect(result.current.isPanelOpen).toBe(true); // should still be opened

        act(() => {
            vi.advanceTimersByTime(50);
        });

        // re-enter the hover container to reset timout
        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        // still should be opened as cursorn hasn't leave the container
        expect(result.current.isPanelOpen).toBe(true);
    });

    test('setPanelToClose should instantly close the panel', () => {
        const { result } = renderUseHoverHandlers(false);

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });
        expect(result.current.isPanelOpen).toBe(true);

        act(() => {
            result.current.setPanelToClose();
        });

        expect(result.current.isPanelOpen).toBe(false);
    });

    test('should not open the panel if isDisabled is true', () => {
        const { result } = renderUseHoverHandlers(true);

        act(() => {
            result.current.hoverHandlers.onMouseEnter();
        });

        expect(result.current.isPanelOpen).toBe(false);

        // Even if we simulate mouse leave, nothing should change
        act(() => {
            result.current.hoverHandlers.onMouseLeave();
            vi.advanceTimersByTime(200);
        });
        expect(result.current.isPanelOpen).toBe(false);
    });
});