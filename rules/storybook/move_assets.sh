#!/usr/bin/env bash

cp -r $1/* $2
mv $2/$3/* $2/.
rmdir $2/$3
