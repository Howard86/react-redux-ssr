import 'babel-polyfill';
import express from 'express';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';

const app = express();
const PORT = 3003;

app.use(express.static('public'));
app.get('*', (req, res) => {
  const store = createStore();

  res.send(renderer(req, store));
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
