require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const mySecret = process.env['PW']

// Basic Configuration
const port = process.env.PORT || 8080;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ...`);
});

const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI);

let url = 'mongodb+srv://Admin-Gerald:' + mySecret+'@helix.vzrxf.mongodb.net/FreeCodeDB'

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original: {type: String, required: true},
  short: Number
});

let Url = mongoose.model('Url', urlSchema);

let responseObject = {};

app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (req, res) => {
let inputUrl = req.body.url;

let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

if(!inputUrl.match(urlRegex)){
  res.json({error: 'Invalid URL'})
  return
}

responseObject['original_url'] = inputUrl;

let inputShort = 1

Url.findOne({})
    .sort({short: 'desc'})  
    .exec((error, result) =>{
      if (!error && result != undefined){
        inputShort = result.short + 1;
      }
      if (!error){
        Url.findOneAndUpdate(
          {original: inputUrl},
          {original: inputUrl, short: inputShort},
          {new: true, upsert: true},
          (error, savedUrl) => {
            if(!error){
              responseObject['short_url'] = savedUrl.short
              res.json(responseObject);
            }
          }
        );
      }
    });
});

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      res.redirect(result.original)
    } else {
      res.json('URL not found')
    }
  })
})