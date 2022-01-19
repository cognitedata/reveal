import { KeyboardEvent } from "react";

export class HTMLUtils {
  public static onEnter<T>(callback: (...args: any) => void): (event: KeyboardEvent<T>) => void {

    return (event: KeyboardEvent<T>): void => {
      if (event.key === "Enter") {
        callback(event);
      }
    };
  }
}
