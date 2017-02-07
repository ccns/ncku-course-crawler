var c = require("./crawler.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var config = require("config");
var url = config.get("mongo.url");
var sleep = require("sleep");

function updateDeptList() {
  function* run() {
    var colleges = yield c.getDeptNo();
    var db = yield MongoClient.connect(url);
    var collection = db.collection('depts');
    yield collection.deleteMany({});
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

function update(updateDept) {
  if(updateDept) {
    update.updateDeptList();
    sleep.sleep(3);
  }

  function* run() {
    var db = yield MongoClient.connect(url);
    var collection = db.collection('depts');
    var colleges = yield collection.find({}).toArray();
    db.close();

    for (let i=0; i<colleges.length; i++) {
      let depts = colleges[i].depts;
      for (let j=0; j<depts.length; j++) {
        updateCourseList(depts[j]);
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
}

module.exports = update
