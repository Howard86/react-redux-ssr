import express from 'express';
import renderer from './helpers/renderer';

const app = express();
const PORT = 3003;

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send(renderer());
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
