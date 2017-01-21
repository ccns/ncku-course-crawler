var sleep = require("sleep");
var update = require("./update.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var url = "mongodb://crawler:ccnsccns@localhost:27017/ncku-course-db";


// update.updateDeptList();
// sleep.sleep(3);

function* run() {
  var db = yield MongoClient.connect(url);
  var collection = db.collection('depts');
  var colleges = yield collection.find({}).toArray();
  db.close();

  for (let i=0; i<colleges.length; i++) {
    let depts = colleges[i].depts;
    for (let j=0; j<depts.length; j++) {
      update.updateCourseList(depts[j]);
    }
  }
}

var gen = run();
function go(result){
  if(result.done) return;
  result.value.then(function(r){
    go(gen.next(r));
  }).catch(function(err){
    console.log(err);
    return;
  });
}
go(gen.next());
