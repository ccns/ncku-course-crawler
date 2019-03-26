const axios = require('axios')
const cheerio = require('cheerio')
// const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const homeUrl = 'http://course-query.acad.ncku.edu.tw/qry/index.php'
const qryUrl = 'http://course-query.acad.ncku.edu.tw/qry/qry001.php?deptNo='

function getDeptNo (html) {
  const $ = cheerio.load(html)
  const lis = $('#dept_list li')

  var result = []

  for (var i = 0; i < lis.length; i++) {
    var li = lis[i]
    var title = $(li).find('.theader').attr('title')
    var as = $(li).find('.dept a, .institute a')

    var depts = []
    for (var j = 0; j < as.length; j++) {
      var a = as[j]
      var deptNo = $(a).attr('href').split('=')[1]
      var deptName = $(a).text().replace(/\s+/g, '').replace('）', ')')
      depts.push({ deptNo: deptNo, deptName: deptName })
    }
    result.push({ title, depts })
  }
  return result
}

function getCourses (html) {
  var $ = cheerio.load(html)
  var trs = $('tr[class^=course_]')
  var deptName = $($(trs[0]).find('td')).eq(0).text().replace(/\s+/, '')

  var result = []
  for (var i = 0; i < trs.length; i++) {
    var tr = trs[i]
    var tds = $(tr).find('td')
    var deptNo = $(tds).eq(1).text()
    var courseNo = $(tds).eq(2).text()
    var code = $(tds).eq(3).text()
    var classes = $(tds).eq(5).text().replace(/\s+/, '')
    var year = $(tds).eq(6).text()
    var group = $(tds).eq(8).text()
    var name = $(tds).eq(10).text()
    var mapUrl = $(tds).eq(10).find('a').attr('href')
    mapUrl = typeof mapUrl === 'undefined' ? '' : mapUrl
    var required = $(tds).eq(11).text()
    var credit = $(tds).eq(12).text()
    var teacher = $(tds).eq(13).text()
    var selected = $(tds).eq(14).text()
    var remain = $(tds).eq(15).text()
    var time = timeFormatter($(tds).eq(16).text())
    var classroom = $(tds).eq(17).text().replace(/\s+/, ' ')
    var memo = $(tds).eq(18).text()
    var moodleUrl = 'http://course-query.acad.ncku.edu.tw/qry/' + $(tds).eq(18).find('a').attr('href')
    var limit = $(tds).eq(19).text().replace(/\s+\//, '/')
    if (i > 0 && deptNo === '') {
      var last = result[result.length - 1]
      deptNo = last.deptNo
      courseNo = last.courseNo
    }
    result.push({
      deptName,
      deptNo,
      courseNo,
      code,
      classes,
      year,
      group,
      name,
      mapUrl,
      required,
      credit,
      teacher,
      selected,
      remain,
      time,
      classroom,
      memo,
      moodleUrl,
      limit
    })
  }
  return result
}

async function getDeptNoUrl () {
  try {
    const body = await axios(homeUrl)
    return getDeptNo(body)
  } catch (err) {
    return -1
  }
}

async function getCoursesUrl (deptNo) {
  try {
    const body = axios(qryUrl + deptNo)
    return getCourses(body)
  } catch (err) {
    return -1
  }
}

function getDeptNoFile (deptNo) {
  const body = fs.readFileSync(path.join(__dirname, '/pages/index.html'))
  return getDeptNo(body)
}

function getCoursesFile (deptNo) {
  const body = fs.readFileSync(path.join(__dirname, '/pages/depts/', deptNo, '.html'))
  return getCourses(body)
}

function timeFormatter (origin) {
  if (origin === '未定') return ''
  var times = origin.split(/(?=\[)/g)
  var result = []
  for (var t in times) {
    var time = times[t]
    var day = weekdays(time.substring(1, 2))
    var ts = time.substr(3, time.length).split('~').map(t => parseInt(classtimes(t)))
    if (ts.length > 1) {
      for (var i = ts[0]; i <= ts[1]; i++) { result.push(day + i) }
    } else { result.push(day + ts[0]) }
  }
  return result.join()
}

function weekdays (s) {
  switch (s) {
    case '1': return 'M'
    case '2': return 'T'
    case '3': return 'W'
    case '4': return 'R'
    case '5': return 'F'
    case '6': return 'S'
    case '7': return 'U'
  }
}

function classtimes (s) {
  switch (s) {
    case '0': return 0
    case '1': return 1
    case '2': return 2
    case '3': return 3
    case '4': return 4
    case 'N': return 5
    case '5': return 6
    case '6': return 7
    case '7': return 8
    case '8': return 9
    case '9': return 10
    case 'A': return 11
    case 'B': return 12
    case 'C': return 13
    case 'D': return 14
    case 'E': return 15
  }
}

module.exports = {
  getDeptNo: getDeptNoFile,
  getCourses: getCoursesFile,
  getDeptNoFile,
  getCoursesFile,
  getDeptNoUrl
  getCoursesUrl,
}
