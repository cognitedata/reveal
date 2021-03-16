import { notification } from 'antd';

export class ToastUtils {
  public static onSuccess(msg: string) {
    notification.success({
      message: msg,
    });
  }

  public static onFailure(msg: string) {
    notification.error({
      message: msg,
    });
  }
}
