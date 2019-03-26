var c = require("./lib/crawler.js");
var MongoClient = require("mongodb").MongoClient
var assert = require("assert");
var config = require("config");
var url = config.get("mongo.url");
var sleep = require("sleep");

async function updateDeptList() {
    var colleges = await c.getDeptNo();
    var db = await MongoClient.connect(url);
    var collection = db.collection('depts');
    await collection.deleteMany({});
    var result = await collection.insertMany(colleges);
    assert.equal(12, result.result.n);
    assert.equal(12, result.ops.length);
    console.log("Inserted 12 documents into the collection");
    db.close();
}

async function updateCourseList(dept) {
    var dept_no = dept.dept_no
    var courses = await c.getCourses(dept_no);

    if (courses == -1) {
        throw new Error(dept_no+": timeout");
    } else {
        console.log(dept_no+": "+courses.length);
        if (courses.length >= 0) {
            var db = await MongoClient.connect(url);
            var collection = db.collection('courses');
            await collection.deleteMany({"dept_no": dept_no});

            if (courses.length > 0)
                var result = await collection.insertMany(courses);

            console.log(dept_no + " updated.");
            db.close();
        }
    }
}

async function update(updateDept) {
    if(updateDept) {
        update.updateDeptList();
        sleep.sleep(3);
    }

    var db = await MongoClient.connect(url);
    var collection = db.collection('depts');
    var colleges = await collection.find({}).toArray();
    db.close();

    console.log("Start to update course list ...")
    for (let i=0; i<colleges.length; i++) {
        let depts = colleges[i].depts;
        for (let j=0; j<depts.length; j++) {
            updateCourseList(depts[j]);
        }
    }
}

module.exports = {
    update,
    updateDeptList,
    updateCourseList,
}
