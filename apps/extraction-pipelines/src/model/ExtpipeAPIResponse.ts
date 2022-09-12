import { Extpipe } from './Extpipe';

export interface ExtpipeAPIResponse {
  items: Extpipe[];
  nextCursor?: string;
}
