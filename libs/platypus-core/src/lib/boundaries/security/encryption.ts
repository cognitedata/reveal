import { EncryptionType } from './encryption-type.enum';

export abstract class Encryption {
  abstract encode(data: string, encryptionType?: EncryptionType): string;
  abstract decode(hash: string, encryptionType?: EncryptionType): string;
}
