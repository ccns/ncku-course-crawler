import requests
import hashlib
import json
import threading

requests.adapters.DEFAULT_RETRIES = 10

url = "http://course-query.acad.ncku.edu.tw/qry/index.php"
print(url)

req = requests.Session()
res = req.get(url)
res.encoding = "utf8"

t = res.text

f = open("index.html", "w")
f.write(t.encode("utf8"))
f.close()

print("All done.")
