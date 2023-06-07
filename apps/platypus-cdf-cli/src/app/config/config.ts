export default {
  SENTRY_DSN:
    process.env.SENTRY_DSN ||
    process.env.NX_SENTRY_DSN ||
    'https://2ee821c1a33c43b69b71e25544c80cd3@o124058.ingest.sentry.io/6552769',
};
