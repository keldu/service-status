#!/usr/bin/env python3
import json
import os
#Local
import db
import config


OUTPUT_PATH=os.path.join(os.path.dirname(__file__),'output/')


def runModules(connection):
	modules = db.getModules(connection)
	if not len(modules) > 0:
		return True
	for module in modules:
		mod = importlib.import_module(module)
		pid = os.fork()
		if pid == 0:
			mod.run()
			return False

	os.wait()
	return True

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

	if not runModules(connection):
		return

	return

if __name__ == "__main__":
	monitor()
