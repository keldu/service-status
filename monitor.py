#!/usr/bin/env python3
import json
import os
#Local
import db
import config


OUTPUT_PATH=os.path.join(os.path.dirname(__file__),'output/')


def generateInfo(config):

	for mod in config['module']:
		print(mod['name'])

	return

def monitor():

	connection = db.connect()
	if(connection):
		print("hurray")

	conf = config.load()

	generateInfo(conf)

	return

if __name__ == "__main__":
	monitor()
