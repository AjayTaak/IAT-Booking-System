var express = require('express');
var app = express();
const host = '0.0.0.0';
const port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('This is test project!');
});
// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
app.listen(port, host, function() {
  console.log("Server started.......");
});