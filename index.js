require('dotenv').config()
const express = require('express');
const cors = require('cors');
const SerpApi = require('google-search-results-nodejs');

const app = express();
const port = process.env.PORT;
const search = new SerpApi.GoogleSearch(process.env.API_KEY);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let images = [];

app.get('/getImages', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  console.log('Images : ', JSON.stringify(images));
  res.end(JSON.stringify(images));
});

app.post('/findImages', function(req, res) {
  search.json({
    q: req.body.query,
    tbm: "isch",
    ijn: "0"
    }, (result) => {
      console.log(result);
      images.push(result);
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.send(JSON.stringify(images));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
