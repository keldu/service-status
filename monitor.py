#!/usr/bin/env python3
import toml
import json
import os
import sqlite3


def generateInfo(config):

	for mod in config['module']:
		print(mod['name'])

	return

def monitor():
	config = toml.load("monitor.toml")
	print(config)

	generateInfo(config)

	return

if __name__ == "__main__":
	monitor()
