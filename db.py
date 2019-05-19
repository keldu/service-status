import os
import sqlite3


DEFAULT_PATH = os.path.join(os.path.dirname(__file__),'monitor.sqlite3')

NAME="status service"
VERSION="0.1"

def generate(connection):
	cursor = connection.cursor()
	query = """
	CREATE TABLE "meta" (
		"sw_name" TEXT NOT NULL,
		"version" TEXT NOT NULL
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
		"modules_id"	INTEGER NOT NULL,
		"host_id"	INTEGER NOT NULL,
		FOREIGN KEY("host_id") REFERENCES "hosts"("id") ON UPDATE CASCADE ON DELETE CASCADE,
		FOREIGN KEY("modules_id") REFERENCES "modules"("id") ON UPDATE CASCADE ON DELETE CASCADE
	);
	"""
	cursor.execute(query)


	query = """
	CREATE UNIQUE INDEX "hostmodule_index" ON "hostmodule" (
		"host_id",
		"modules_id"
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
		INSERT INTO hosts (name, address, info)
		VALUES (?,?,?)
	"""
	cursor.execute(query, (name,address,info))

	connection.commit()

	return cursor.lastrowid

def createModule(connection, name, long_name, description):
	cursor = connection.cursor()
	query = """
		INSERT INTO modules (name, long_name, description)
		VALUES (?,?,?)
	"""
	cursor.execute(query, (name,long_name,description))

	connection.commit()

	return cursor.lastrowid

def createHostModule(connection, host_id, module_id):

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