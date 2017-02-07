#!/bin/bash
while read line ; do
  echo "[$(date '+%Y-%m-%d %H:%M')] ${line}"
done
