import 'babel-polyfill';
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

  const promises = matchRoutes(Routes, req.path).map(({ route }) =>
    route.loadData ? route.loadData(store) : null,
  );

  Promise.all(promises).then(() => {
    res.send(renderer(req, store));
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
