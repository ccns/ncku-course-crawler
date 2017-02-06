#!/bin/bash
timeout 1m python get_all.py
while [ "$(<retry.json)" != "[]" ]; do
  timeout 1m python retry.py
done
