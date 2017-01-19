var c = require("./crawler.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var url = "mongodb://crawler:ccnsccns@ds111798.mlab.com:11798/ncku-course-db";

function updateDeptList() {
  function* run() {
    var colleges = yield c.getDeptNo();
    var db = yield MongoClient.connect(url);
    var collection = db.collection('depts');
    yield collection.drop();
    var result = yield collection.insertMany(colleges);
    assert.equal(12, result.result.n);
    assert.equal(12, result.ops.length);
    console.log("Inserted 12 documents into the collection");
    db.close();
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
}

function updateCourseList(dept) {
  function* run(dept) {
    var dept_no = dept.dept_no
    var courses = yield c.getCourses(dept_no);

    if (courses<0) {
      yield new Error(dept_no+": timeout");
    } else {
      console.log(dept_no+": "+courses.length);
      if (courses.length > 0) {
        var db = yield MongoClient.connect(url);
        var collection = db.collection('courses');
        yield collection.deleteMany({"dept_no": dept_no});
        var result = yield collection.insertMany(courses);
        console.log(dept_no + " updated.");
        db.close();
      }
    }
  }

  let gen = run(dept);
  function go(result) {
    if(result.value instanceof Error) {
      console.log(result.value);
      console.log("Retry ...");
      gen.return();
      gen = run(dept);
      go(gen.next());
      return;
    }
    if(result.done) return;
    result.value.then(function(r) {
      go(gen.next(r));
    }).catch(function(err) {
      console.log(err);
      return;
    });
  }
  go(gen.next());
}

module.exports = {
  updateDeptList: updateDeptList,
  updateCourseList: updateCourseList
}
