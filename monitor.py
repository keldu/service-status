#!/usr/bin/env python3
import json
import os
#Local
import db
import config


OUTPUT_PATH=os.path.join(os.path.dirname(__file__),'output/')


def generateInfo(config):

	for mod in config['modules']:
		print(mod)

	return

def monitor():
	modified = config.lastModified()

	connection = db.connect()
	if not connection:
		return

	if db.shouldUpdate(connection,modified):
		conf = config.load()
		db.updateFromConfig(connection, conf, modified)
	
	generateInfo(conf)

	return

if __name__ == "__main__":
	monitor()
