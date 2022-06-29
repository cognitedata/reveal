/* eslint-disable no-underscore-dangle */
export const dragPan = {
  enable(ctx: any) {
    setTimeout(() => {
      // First check we've got a map and some context.
      if (
        !ctx.map ||
        !ctx.map.dragPan ||
        !ctx._ctx ||
        !ctx._ctx.store ||
        !ctx._ctx.store.getInitialConfigValue
      )
        return;
      // Now check initial state wasn't false (we leave it disabled if so)
      if (!ctx._ctx.store.getInitialConfigValue('dragPan')) return;
      ctx.map.dragPan.enable();
    }, 0);
  },
  disable(ctx: any) {
    setTimeout(() => {
      if (!ctx.map || !ctx.map.dragPan) return;
      // Always disable here, as it's necessary in some cases.
      ctx.map.dragPan.disable();
    }, 0);
  },
};
