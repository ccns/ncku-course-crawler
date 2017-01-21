var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var home_url = "http://course-query.acad.ncku.edu.tw/qry/index.php";
var qry_url = "http://course-query.acad.ncku.edu.tw/qry/qry001.php?dept_no=";

function getDeptNo(html) {
  var $ = cheerio.load(html);
  var result = [];
  var lis = $("#dept_list li");
  var i = 0;
  for (var i=0; i<lis.length; i++) {
    var li = lis[i];
    var title = $(li).find(".theader").attr("title");
    var as = $(li).find(".dept a, .institute a");
    var depts = [];
    for (var j=0; j<as.length; j++) {
      var a = as[j];
      var dept_no = $(a).attr("href").split("=")[1];
      var dept_name = $(a).text().replace(/\s+/g,"").replace("）",")");
      depts.push({dept_no: dept_no, dept_name: dept_name});
    }
    result.push({title: title, depts: depts});
  }
  return result;
}

function getCourses(html) {
  var $ = cheerio.load(html);
  var trs = $("tr[class^=course_]");
  var result = [];
  for (var i=0; i<trs.length; i++) {
    var tr = trs[i];
    var tds = $(tr).find("td");
    var dept_no = $(tds).eq(1).text();
    var course_no = $(tds).eq(2).text();
    var code = $(tds).eq(3).text();
    var classes = $(tds).eq(5).text().replace(/\s+/, "");
    var year = $(tds).eq(6).text();
    var group = $(tds).eq(8).text();
    var name = $(tds).eq(10).text();
    var map_url = $(tds).eq(10).find("a").attr("href");
    map_url = typeof map_url === 'undefined'? '': map_url;
    var required = $(tds).eq(11).text();
    var credit = $(tds).eq(12).text();
    var teacher = $(tds).eq(13).text();
    var selected = $(tds).eq(14).text();
    var remain = $(tds).eq(15).text();
    var time = $(tds).eq(16).text();
    var classroom = $(tds).eq(17).text().replace(/\s+/, " ");
    var memo = $(tds).eq(18).text();
    var moodle_url = "http://course-query.acad.ncku.edu.tw/qry/" + $(tds).eq(18).find("a").attr("href");
    var limit = $(tds).eq(19).text().replace(/\s+\//, "/");
    if (i > 0 && dept_no === "") {
      var last = result[result.length-1];
      dept_no = last.dept_no;
      course_no = last.course_no;
    }
    result.push({
      dept_no: dept_no,
      course_no: course_no,
      code: code,
      classes: classes,
      year: year,
      group: group,
      name: name,
      map_url: map_url,
      required: required,
      credit: credit,
      teacher: teacher,
      selected: selected,
      remain: remain,
      time: time,
      classroom: classroom,
      memo: memo,
      moodle_url: moodle_url,
      limit: limit
    });
  }
  return result;
}

function getDeptNoUrl() {
  return new Promise((resolve, reject) => {
    request(home_url, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        resolve(getDeptNo(body));
      } else {
        resolve(-1);
      }
    })
  })
}

function getCoursesUrl(dept_no) {
  return new Promise((resolve, reject) => {
    request(qry_url+dept_no, (err, res, body) => {
      if(!err && res.statusCode == 200) {
        resolve(getCourses(body));
      } else {
        resolve(-1);
      }
    })
  })
}

function getDeptNoFile(dept_no) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname+"/pages/index.html", (err, body) => {
      if(!err) {
        resolve(getDeptNo(body));
      } else {
        resolve(-1);
      }
    });
  })
}

function getCoursesFile(dept_no) {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname+"/pages/depts/"+dept_no+".html", (err, body) => {
      if(!err) {
        resolve(getCourses(body));
      } else {
        resolve(-1);
      }
    });
  })
}

module.exports = {
  getDeptNo: getDeptNoFile,
  getCourses: getCoursesFile
}
