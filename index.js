require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});
const cors = require('cors');
const download = require('image-downloader');
const express = require('express');
const fs = require('fs');
const path = require('path');
const SerpApi = require('google-search-results-nodejs');

const search = new SerpApi.GoogleSearch(process.env.GOOGLE_SEARCH_API_KEY);
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let images = [];

function uploadFile(imageUrl) {
  options = {
    url: imageUrl,
    dest: 'test1.jpeg'
  }
  download.image(options)
    .then(({ filename }) => {
      let params = {Bucket: process.env.AWS_S3_BUCKET_NAME, Key: '', Body: ''};

      // Read content from the file
      const fileStream = fs.createReadStream(filename);
      fileStream.on('error', function(err) {
        console.log('File Error', err);
      });
      params.Body = fileStream;
      console.log("PATHNAME:" + path.basename(filename));
      params.Key = path.basename(filename);

      // Uploading files to the bucket
      s3.upload(params, function(err, data) {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
      });
    })
    .catch((err) => console.error(err));
}

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
      uploadFile(result.images_results[0].thumbnail);
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
