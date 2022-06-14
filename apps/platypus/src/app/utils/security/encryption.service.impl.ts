import { Encryption, EncryptionType } from '@platypus/platypus-core';

export class EncryptionServiceImpl implements Encryption {
  encode(data: string, encryptionType?: EncryptionType): string {
    switch (encryptionType) {
      default:
      case EncryptionType.base64:
        return btoa(data);
    }
  }

  decode(hash: string, encryptionType?: EncryptionType): string {
    switch (encryptionType) {
      default:
      case EncryptionType.base64:
        return atob(hash);
    }
  }
}
