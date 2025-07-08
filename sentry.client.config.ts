// This file configures the initialization of Sentry for the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c493be77118a15c139dc9b35ec750fb0@o4509610687135744.ingest.us.sentry.io/4509610688315392",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // This sets the sample rate to be 10%. You may want to change it to 100% while in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});