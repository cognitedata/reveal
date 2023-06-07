export abstract class Hooks {
  /**
   * Register hook in the system.
   * Attach function and gets called when hook is triggered.
   *
   * @param hookName - name, should contain namespace - NAMESPACE:HOOK_NAME
   * @param callback - Function to be called. Must accept arguments and should return value.
   * @param priority - Priority of execution. Default is 1
   */
  abstract register(
    hookName: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    callback: Function,
    priority?: number
  ): void;

  /**
   * Remove registered hook.
   * @param hookName - hook name with namespace - NAMESPACE:HOOK_NAME
   */
  abstract remove(hookName: string): void;

  /**
   * Removes all registered hook listeners with same hook name.
   * @param hookName
   */
  abstract removeAll(hookName: string): void;

  /**
   * Execute (call) registered hooks.
   * Hooks are being executed with the specified order.
   * @param hookName - name of the hook with namespace - NAMESPACE:HOOK_NAME
   */
  abstract execute(hookName: string, content: any, ...args: any[]): any;

  /**
   * Execute (call) registered hooks.
   * Hooks are being executed with the specified order.
   * @param hookName - name of the hook with namespace - NAMESPACE:HOOK_NAME
   */
  abstract executeAsync(
    hookName: string,
    content: any,
    ...args: any[]
  ): Promise<any>;

  /**
   * Returns bool if such hook exists
   * @param hookName
   */
  abstract hasHook(hookName: string): boolean;

  /**
   * Returns bool if hooks was executed.
   * @param hookName
   */
  abstract isExecuted(hookName: string): boolean;
}
