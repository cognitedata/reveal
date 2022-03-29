import { parseEpt } from './eptBinaryDecoderWorkerInternal';

const ctx: Worker = self as any;

ctx.onmessage = function (arg0: any) {
  parseEpt(arg0);
};

export default null as any;
