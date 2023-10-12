import { Notification } from '../components/Notification/Notification';
import { PlatypusError } from '../types';

const showErrorNotification = (error: PlatypusError) => {
  Notification({ type: 'error', message: error.message });
};

export function withToastForError<Returned>(
  payloadCreator: () => Promise<Returned>
) {
  return async () => {
    try {
      return await payloadCreator();
    } catch (error) {
      showErrorNotification(error as PlatypusError);
      throw error; // throw error so createAsyncThunk will dispatch '/rejected'-action
    }
  };
}

export function withToastForErrorWithArgs<Args, Returned>(
  payloadCreator: (args?: Args) => Promise<Returned>
) {
  return async (args?: Args) => {
    try {
      return await payloadCreator(args);
    } catch (error) {
      showErrorNotification(error as PlatypusError);
      throw error; // throw error so createAsyncThunk will dispatch '/rejected'-action
    }
  };
}
