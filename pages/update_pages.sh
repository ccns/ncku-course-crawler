#!/bin/bash
timeout 1m python -u get_all.py
while [ "$(<retry.json)" != "[]" ]; do
  echo "Execution timeout, retry ..."
  timeout 1m python -u get_all.py retry
done
