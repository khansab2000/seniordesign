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

let response = {};

function uploadFile(imageUrl) {
  response['imageUrl'] = imageUrl;

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
      getGender(filename);
    })
    .catch((err) => console.error(err));
}

function getGender(filename) {
  const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  })
  const client = new AWS.Rekognition();
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Name: filename
      },
    },
    Attributes: ['ALL']
  }
  client.detectFaces(params, function(err, response) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      console.log(`Detected faces for: ${filename}`)
      response.FaceDetails.forEach(data => {
        let low  = data.AgeRange.Low
        let high = data.AgeRange.High
        console.log(`The detected face is between: ${low} and ${high} years old`)
        console.log("All other attributes:")
        console.log(`  BoundingBox.Width:      ${data.BoundingBox.Width}`)
        console.log(`  BoundingBox.Height:     ${data.BoundingBox.Height}`)
        console.log(`  BoundingBox.Left:       ${data.BoundingBox.Left}`)
        console.log(`  BoundingBox.Top:        ${data.BoundingBox.Top}`)
        console.log(`  Age.Range.Low:          ${data.AgeRange.Low}`)
        response['ageLow'] = data.AgeRange.Low;
        response['ageHigh'] = data.AgeRange.High;
        console.log(`  Age.Range.High:         ${data.AgeRange.High}`)
        console.log(`  Smile.Value:            ${data.Smile.Value}`)
        console.log(`  Smile.Confidence:       ${data.Smile.Confidence}`)
        console.log(`  Eyeglasses.Value:       ${data.Eyeglasses.Value}`)
        console.log(`  Eyeglasses.Confidence:  ${data.Eyeglasses.Confidence}`)
        console.log(`  Sunglasses.Value:       ${data.Sunglasses.Value}`)
        console.log(`  Sunglasses.Confidence:  ${data.Sunglasses.Confidence}`)
        console.log(`  Gender.Value:           ${data.Gender.Value}`)
        response['genderValue'] = data.Gender.Value;
        console.log(`  Gender.Confidence:      ${data.Gender.Confidence}`)
        response['genderConfidence'] = data.Gender.Confidence;
        console.log(`  Beard.Value:            ${data.Beard.Value}`)
        console.log(`  Beard.Confidence:       ${data.Beard.Confidence}`)
        console.log(`  Mustache.Value:         ${data.Mustache.Value}`)
        console.log(`  Mustache.Confidence:    ${data.Mustache.Confidence}`)
        console.log(`  EyesOpen.Value:         ${data.EyesOpen.Value}`)
        console.log(`  EyesOpen.Confidence:    ${data.EyesOpen.Confidence}`)
        console.log(`  MouthOpen.Value:        ${data.MouthOpen.Value}`)
        console.log(`  MouthOpen.Confidence:   ${data.MouthOpen.Confidence}`)
        console.log(`  Emotions[0].Type:       ${data.Emotions[0].Type}`)
        console.log(`  Emotions[0].Confidence: ${data.Emotions[0].Confidence}`)
        console.log(`  Landmarks[0].Type:      ${data.Landmarks[0].Type}`)
        console.log(`  Landmarks[0].X:         ${data.Landmarks[0].X}`)
        console.log(`  Landmarks[0].Y:         ${data.Landmarks[0].Y}`)
        console.log(`  Pose.Roll:              ${data.Pose.Roll}`)
        console.log(`  Pose.Yaw:               ${data.Pose.Yaw}`)
        console.log(`  Pose.Pitch:             ${data.Pose.Pitch}`)
        console.log(`  Quality.Brightness:     ${data.Quality.Brightness}`)
        console.log(`  Quality.Sharpness:      ${data.Quality.Sharpness}`)
        console.log(`  Confidence:             ${data.Confidence}`)
        console.log("------------")
        console.log("")
      })
    }
  });
}

app.post('/findImages', function(req, res) {
  search.json({
    q: req.body.query,
    tbm: "isch",
    ijn: "0"
    }, (result) => {
      response['query'] = req.body.query;
      uploadFile(result.images_results[0].thumbnail);
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  
  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
