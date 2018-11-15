#!/bin/bash
timeout 1m python2 -u get_all.py
RET=$?
if [ $RET -gt 0 ] && [ $RET != 124 ]; then
  exit $RET
fi

while [ "$(<retry.json)" != "[]" ]; do
  echo "Execution timeout, retry ..."
  timeout 1m python2 -u get_all.py retry
  if [ $RET -gt 0 ] && [ $RET != 124 ]; then
    exit $RET
  fi
done
