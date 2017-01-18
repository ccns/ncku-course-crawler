var c = require("./crawler.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var url = "mongodb://crawler:ccnsccns@ds111798.mlab.com:11798/ncku-course-db";

var promiseFor = Promise.method(function(value, condition, action) {
    if (!condition(value)) return value;
    return action(value).then(promiseFor.bind(null, condition, action));
});

function* updateCollegeList() {
  var colleges = yield c.getDeptNo();
  var db = yield MongoClient.connect(url);

  var collection = db.collection('colleges');

  var result = yield collection.insertMany(colleges);
  assert.equal(12, result.result.n);
  assert.equal(12, result.ops.length);
  console.log("Inserted 12 documents into the collection");
  db.close();
}

function* updateCoursesList(colleges) {
  for (let i=0; i<colleges.length; i++) {
    let depts = colleges[i];
    let dept_no = depts.depts;
    promiseFor( 0, (j)=>j<dept_no.length, (j,courses)=> {
      c.getCourses(dept_no[j]).then(function(courses) {
        if (courses<0) {
          console.log(dept_no[j]+": timeout");
        } else {
          console.log(dept_no[j]+": "+courses.length);
          if (courses.length > 0) {
            MongoClient.connect(url).then(function(db) {
              assert.equal(null, err);
              var collection = db.collection('courses');
              return collection.insertMany({
                dept: dept_no[j],
                courses: courses
              })
            }).then(function(result) {
              assert.equal(err, null);
              assert.equal(courses.length, result.result.n);
              assert.equal(courses.length, result.ops.length);
              console.log("Inserted "+courses.length+" to dept_no[j]");
              db.close();
            }).fail(function(err) {
              console.log(err);
            });
          }
        }
      });
    })
  }
}
