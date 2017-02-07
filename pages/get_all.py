import requests
import hashlib
import json
import threading
import sys

deptFile = "depts.json"
if(len(sys.argv)>1 and sys.argv[1] == "retry"):
    deptFile = "retry.json"

requests.adapters.DEFAULT_RETRIES = 10
dept_f = open(deptFile, "r")
depts = json.load(dept_f)
dept_f.close()

lock = threading.Lock()

def download(dept):
    global depts
    url = "http://course-query.acad.ncku.edu.tw/qry/qry001.php?dept_no=" + dept
    print("Request sent: "+dept)

    req = requests.Session()
    res = req.get(url)
    res.encoding = "utf8"

    t = res.text

    f = open("depts/"+dept+".html", "w")
    f.write(t.encode("utf8"))
    f.close()

    lock.acquire()
    depts.remove(dept)
    f = open("retry.json", "w")
    json.dump(depts, f)
    f.close()
    print(dept+".html updated. Remain: "+str(len(depts)))
    if(len(depts)==0):
        print("All done.")
    lock.release()

for dept in depts:
    threading.Thread(target=download, args=(dept,)).start()
