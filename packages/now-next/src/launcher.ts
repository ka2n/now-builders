import { IncomingMessage, ServerResponse } from 'http';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV =
    process.env.NOW_REGION === 'dev1' ? 'development' : 'production';
}

const { Server } = require('http');
const { Bridge } = require('./now__bridge');
const page = require('./page');

function ensureURIDecoded(input?: string | string[] | undefined): any {
  if (typeof input === 'string') {
    return decodeURIComponent(input);
  }
  if (Array.isArray(input)) {
    return input.map(decodeURIComponent);
  }
  return undefined;
}

const server = new Server((req: IncomingMessage, res: ServerResponse) => {
  Object.keys(req.headers).forEach(k => {
    req.headers[k] = ensureURIDecoded(req.headers[k]);
  });
  req.rawHeaders = ensureURIDecoded(req.rawHeaders);
  req.url = ensureURIDecoded(req.url as any);
  return page.handler(req, res);
});
const bridge = new Bridge(server);
bridge.listen();

exports.launcher = bridge.launcher;
