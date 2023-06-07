export abstract class EventDispatcher {
  /**
   * Subscribe and listen for event.
   * Events are emmited when some domain action is finished or should be done.
   *
   * @param eventName - event name with namespace - NAMESPACE:EVENT_NAME
   * @param callback - Function to be executed, must accept parameters
   * @param priority - priority of execution. Default value is 1
   */
  abstract subscribe(
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    callback: Function,
    priority?: number
  ): void;

  /**
   * Unsubscribe registered listener.
   * @param eventName - event name with namespace - NAMESPACE:EVENT
   */
  abstract unsubscribe(eventName: string): void;

  /**
   * Unsubscribe all registered listeners for specified event.
   * @param eventName
   */
  abstract unsubscribeAll(eventName: string): void;

  /**
   * Dispatch event system wide.
   * @param eventName - event name with namespace - NAMESPACE:EVENT_NAME
   * @param args - additional args to be passed
   */
  abstract dispatch(eventName: string, ...args: any[]): void;

  /**
   * Returns bool if has such event
   * @param eventName
   */
  abstract hasEvent(eventName: string): boolean;
}
