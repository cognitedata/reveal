import { DTO } from './dto';

export interface Command<T> {
  execute(dto?: DTO): Promise<T>;
}

export interface Query<T> {
  execute(dto?: DTO): Promise<T>;
}
