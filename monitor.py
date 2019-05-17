#!/usr/bin/env python3
import toml
import json
import os

def monitor():
	config = toml.load("monitor.toml")

	print(config)

	return

if __name__ == "__main__":
	monitor()
