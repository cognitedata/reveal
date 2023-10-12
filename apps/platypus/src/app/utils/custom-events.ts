export type CustomEventCallback = (event: CustomEvent | Event) => void;
function subscribe(eventName: string, callback: CustomEventCallback) {
  document.addEventListener(eventName, callback);
}

function unsubscribe(eventName: string, callback: CustomEventCallback) {
  document.removeEventListener(eventName, callback);
}

function publish(eventName: string, data: string | Object) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
