import os
import toml


DEFAULT_PATH = os.path.join(os.path.dirname(__file__),'monitor.toml')


def load(conf_path=DEFAULT_PATH):
	config = toml.load(DEFAULT_PATH)
	return config