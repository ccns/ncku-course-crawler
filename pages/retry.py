import requests
import hashlib
import json
import threading

requests.adapters.DEFAULT_RETRIES = 10
dept_f = open("retry.json", "r")
depts = json.load(dept_f)
dept_f.close()

lock = threading.Lock()

def download(dept):
    url = "http://course-query.acad.ncku.edu.tw/qry/qry001.php?dept_no=" + dept
    print(url)

    req = requests.Session()
    res = req.get(url)
    res.encoding = "utf8"

    t = res.text

    f = open("depts/"+dept+".html", "w")
    f.write(t.encode("utf8"))
    f.close()

    print(dept+" updated.")

    lock.acquire()
    depts.remove(dept)
    f = open("retry.json", "w")
    json.dump(depts, f)
    f.close()
    lock.release()

for dept in depts:
    threading.Thread(target=download, args=(dept,)).start()

while (len(depts)>0):
    continue

print("All done.")
