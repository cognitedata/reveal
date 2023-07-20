/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const cors = require('cors');
const functions = require('firebase-functions');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cdfProxy = express();

let proxyToEnv = 'staging';

if (process.env.GCLOUD_PROJECT === 'fbhosting-217032465111-preview') {
  // proxyToEnv = 'preview';
  // for testing purposes only
  proxyToEnv = 'staging';
}

if (process.env.GCLOUD_PROJECT === 'fbhosting-217032465111') {
  proxyToEnv = 'prod';
}

console.log('Proxying to project: ' + proxyToEnv, process.env.GCLOUD_PROJECT);

// This part should be refactored to read the config from a separate file
const firebaseAppSites = {
  'cdf-solutions-ui': {
    firebaseSiteName: 'platypus',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-data-exploration': {
    firebaseSiteName: 'data-exploration',
    staging: 'preview',
    prod: 'prod',
  },
  'cdf-vision-subapp': {
    firebaseSiteName: 'vision',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-data-catalog': {
    firebaseSiteName: 'data-catalog',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-raw-explorer': {
    firebaseSiteName: 'raw-explorer',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-coding-conventions': {
    firebaseSiteName: 'coding-conventions',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-copilot': {
    firebaseSiteName: 'copilot',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-industry-canvas-ui': {
    firebaseSiteName: 'industry-canvas-ui',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-context-ui-pnid': {
    firebaseSiteName: 'pnid-contextualization',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-iot-hub': {
    firebaseSiteName: 'iot-hub',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-3d-management': {
    firebaseSiteName: '3d-management',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-transformations-2': {
    firebaseSiteName: 'transformations',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-transformations': {
    firebaseSiteName: 'transformations',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-document-search-ui': {
    firebaseSiteName: 'document-search',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-functions-ui': {
    firebaseSiteName: 'functions',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-integrations-ui': {
    firebaseSiteName: 'extraction-pipelines',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-extractor-downloads': {
    firebaseSiteName: 'extractor-downloads',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-charts-ui': {
    firebaseSiteName: 'charts',
    staging: 'staging',
    prod: 'prod',
  },
  'cdf-ui-entity-matching': {
    firebaseSiteName: 'entity-matching',
    staging: 'prod',
    prod: 'prod',
  },
  'cdf-access-management': {
    firebaseSiteName: 'access-management',
    staging: 'staging',
    prod: 'prod',
  },
};

cdfProxy.use(cors({ origin: true }));

for (const projectName in firebaseAppSites) {
  const firebaseSiteConfig = firebaseAppSites[projectName];
  const proxyTarget = `https://cdf-${firebaseSiteConfig.firebaseSiteName}-${firebaseSiteConfig[proxyToEnv]}.web.app`;
  cdfProxy.use(
    '/cdf/apps/' + projectName,
    createProxyMiddleware({
      target: proxyTarget,
      secure: false,
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: (path) => {
        return path.replace(`/cdf/apps/${projectName}`, '');
      },
      onProxyRes: function (proxyRes, req) {
        if (
          req.originalUrl.startsWith('/cdf/apps/') &&
          (req.originalUrl.endsWith('/index.js') ||
            req.originalUrl.endsWith('/remoteEntry.js'))
        ) {
          proxyRes.headers['cache-control'] =
            'max-age=0, no-cache, no-store, must-revalidate';
          proxyRes.headers['pragma'] = 'no-cache';
          proxyRes.headers['x-content-type-options'] = 'nosniff';
          proxyRes.headers['x-app'] = 'proxy';
          delete proxyRes.headers['Etag'];
        }
      },
    })
  );
}

exports.cdfProxy = functions.https.onRequest(cdfProxy);
