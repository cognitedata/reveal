type EventNames = 'onHide' | 'onShow' | 'onUnreadCountChange';
type Callback = (() => void) | ((unreadCount: number) => void);

export default (eventName: EventNames, callback: Callback): void => {
  if (window.Intercom) {
    window.Intercom(eventName, callback);
  }
};
