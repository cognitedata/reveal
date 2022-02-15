import { BasicUserInfo } from 'modules/user/types';

export interface UserProfileUpdateQueryData {
  payload: Omit<BasicUserInfo, 'id'>;
}
