import os
import sqlite3


DEFAULT_PATH = os.path.join(os.path.dirname(__file__),'monitor.sqlite3')

NAME="status service"
VERSION="0.1"

def updateFromConfig(connection, conf, modified):
	cursor = connection.cursor()
	query = """
	UPDATE OR ABORT meta
	SET last_modified = ?
	"""
	cursor.execute(query, [modified])

	query = """
	SELECT hosts.name, group_concat(modules.name) FROM hostmodule
	INNER JOIN hosts ON hostmodule.host_id = hosts.id
	INNER JOIN modules ON hostmodule.module_id = modules.id
	GROUP BY hosts.id
	"""

	cursor.execute(query)
	result = cursor.fetchall()
	print(conf)
	print(result)

	for host in result:
		return

	connection.commit()

	return

def shouldUpdate(connection, modified):
	cursor = connection.cursor()
	query = """
	SELECT last_modified FROM meta
	"""

	fetched = cursor.fetchone()
	if not fetched:
		return True

	if fetched[2] < modified:
		return True

	return False

def generate(connection):
	cursor = connection.cursor()
	query = """
	CREATE TABLE "meta" (
		"sw_name" TEXT NOT NULL,
		"version" TEXT NOT NULL,
		"last_modified" INTEGER NOT NULL DEFAULT 0
	);
	"""
	cursor.execute(query);

	cursor = connection.cursor()
	query = """
	INSERT INTO "meta" (sw_name, version) 
	VALUES (?, ?)
	"""
	cursor.execute(query,(NAME,VERSION))

	query = """
	CREATE TABLE "modules" (
		"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		"name"	TEXT NOT NULL UNIQUE,
		"long_name"	TEXT,
		"description"	TEXT DEFAULT "A Module"
	);
	"""
	cursor.execute(query)

	query = """
	CREATE TABLE "hosts" (
		"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		"name"	TEXT NOT NULL UNIQUE,
		"address"	TEXT NOT NULL,
		"info"	TEXT NOT NULL DEFAULT ""
	);
	"""
	cursor.execute(query)


	query = """
	CREATE TABLE "hostmodule" (
		"module_id"	INTEGER NOT NULL,
		"host_id"	INTEGER NOT NULL,
		FOREIGN KEY("host_id") REFERENCES "hosts"("id") ON UPDATE CASCADE ON DELETE CASCADE,
		FOREIGN KEY("module_id") REFERENCES "modules"("id") ON UPDATE CASCADE ON DELETE CASCADE
	);
	"""
	cursor.execute(query)


	query = """
	CREATE UNIQUE INDEX "hostmodule_index" ON "hostmodule" (
		"host_id",
		"module_id"
	);
	"""
	cursor.execute(query)

	connection.commit()

	return 

def isHealthy(connection):
	cursor = connection.cursor()
	query = """
	PRAGMA table_info(meta);
	"""
	cursor.execute(query);

	fetched = cursor.fetchall()
	if not(fetched):
		print("No meta table")
		return None

	if fetched[0][1] != "sw_name" or fetched[1][1] != "version":
		print("Badly formed meta table")
		return None

	query = """
	SELECT sw_name, version
	FROM meta
	"""
	cursor.execute(query)
	fetched = cursor.fetchone()
	if not fetched:
		print("No entries in meta table")
		return None

	if fetched[0] != NAME or fetched[1] != VERSION:
		print("Bad version of database")
		return None

	return True

def createHost(connection, name, address, info=""):
	cursor = connection.cursor()
	query = """
		INSERT OR REPLACE INTO hosts (name, address, info)
		VALUES (?,?,?)
	"""
	cursor.execute(query, (name,address,info))

	connection.commit()

	return cursor.lastrowid

def createModule(connection, name, long_name, description):
	cursor = connection.cursor()
	query = """
		INSERT OR REPLACE INTO modules (name, long_name, description)
		VALUES (?,?,?)
	"""
	cursor.execute(query, (name,long_name,description))

	connection.commit()

	return cursor.lastrowid

def createHostModule(connection, host_id, module_id):
	cursor = connection.cursor()
	query = """
		INSERT OR REPLACE INTO hostmodule (host_id, module_id)
		VALUES (?,?)
	"""
	cursor.execute(query, (host_id, module_id))

	connection.commit()

	return

def connect(db_path=DEFAULT_PATH):
	try:
		con = sqlite3.connect("file:"+db_path+"?mode=rw",uri=True)
		if (isHealthy(con)):
			print("DB is healthy")
		else:
			print("DB is corrupted")

		return con
	except sqlite3.OperationalError:
		print("Database doesn't exist at specified path. Generating new database")

	con = sqlite3.connect(db_path)
	generate(con)
	if not (isHealthy(con)):
		print("Failed to generate Database")
		return None
	return con