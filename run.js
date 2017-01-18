var c = require("./crawler.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var url = "mongodb://crawler:ccnsccns@ds111798.mlab.com:11798/ncku-course-db";

function* run() {
  var colleges = yield c.getDeptNo();
  var db = yield MongoClient.connect(url);

  console.log("Connected successfully to server");
  var collection = db.collection('colleges');

  var result = yield collection.insertMany(colleges);
  assert.equal(12, result.result.n);
  assert.equal(12, result.ops.length);
  console.log("Inserted 12 documents into the collection");

  for (let i=0; i<colleges.length; i++) {
    let depts = colleges[i];
    let dept_no = depts.depts;
    for (let j=0; j<dept_no.length; j++) {

      c.getCourses(dept_no[j]).then(function(courses) {

        if (courses<0) {
          console.log(dept_no[j]+": timeout");
        }
        else {
          console.log(dept_no[j]+": "+courses.length);
          if (courses.length > 0) {

            MongoClient.connect(url, function(err, db) {
              assert.equal(null, err);
              var collection = db.collection('courses');
              collection.insert({dept: dept_no[j], courses: courses}, function(err, result) {
                assert.equal(err, null);
                console.log("Inserted "+dept_no[j]);
                db.close();
              });
            });

          }
        }

      });

    }
  }

  db.close();
}

function runGenerator(){
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
}

runGenerator();
