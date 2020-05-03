import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import { matchRoutes } from 'react-router-config';
import proxy from 'express-http-proxy';

import Routes from './client/Routes';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';

export const API_ENDPOINT = 'http://react-ssr-api.herokuapp.com';
const PORT = 3000;

const app = express();

app.use(
  '/api',
  proxy(API_ENDPOINT, {
    proxyReqOptDecorator(opts) {
      opts.headers['x-forwarded-host'] = `localhost:${PORT}`;
      return opts;
    },
  }),
);
app.use(express.static('public'));
app.get('*', (req, res) => {
  const store = createStore(req);

  const promises = matchRoutes(Routes, req.path)
    .map(({ route }) => {
      return route.loadData ? route.loadData(store) : null;
    })
    .map(promise => {
      if (promise) {
        return new Promise((resolve, _reject) => {
          promise.then(resolve).catch(resolve);
        });
      }
    });

  Promise.all(promises).then(() => {
    const context = {};
    const content = renderer(req, store, context);

    if (context.url) {
      return res.redirect(301, context.url);
    }
    if (context.notFound) {
      res.status(404);
    }

    res.send(content);
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
