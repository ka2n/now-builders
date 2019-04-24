import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';

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
  try {
    Object.keys(req.headers).forEach(k => {
      req.headers[k] = ensureURIDecoded(req.headers[k]);
    });
    req.rawHeaders = ensureURIDecoded(req.rawHeaders);

    const u = url.parse(req.url!);
    req.url =
      (u.protocol || '') +
      (u.host || '') +
      ensureURIDecoded((u.path || '').slice(1));
  } catch (e) {
    console.error(e);
  }
  return page.render(req, res);
});
const bridge = new Bridge(server);
bridge.listen();

exports.launcher = bridge.launcher;
