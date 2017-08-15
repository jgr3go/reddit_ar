import sys
import os
import moment
from datetime import datetime
from google.cloud import bigquery
from google_auth_oauthlib import flow
from oauth2client.service_account import ServiceAccountCredentials
import psycopg2
import psycopg2.extras
import json

AGENT='windows:blood_bender.reddit-data:v1.0.0 (by /u/blood_bender)'
CLIENT_ID='UGFZG3Bcp8Ui3Q'
CLIENT_SECRET=os.environ['PRAW_CLIENT_SECRET']
DBPASS=os.environ['ARTC_DB_PASS']

COMMENTS = [
  'arcomments_all_asof_20170710',
  'results_201705_through_201707'
]
POSTS = [
  'arposts_2016_to_201705',
  'posts_201705_through_201706'
]


def main():
  db = database()
  bq = bigquery.Client()

  for COM in COMMENTS:
    downloadTable(bq, db, COM, 'comments')
  for PO in POSTS:
    downloadTable(bq, db, PO, 'posts')


def downloadTable(bq, db, table, ttype):
  query = """
    SELECT * 
    FROM [reddit-154021.reddit_advancedrunning.{0}]
  """.format(table)

  results = bq.run_sync_query(query)
  results.run()
  if (results.errors):
    raise Exception(results.errors)
  else:
    print('Found {0} rows in {1}'.format(results.total_rows, table))
  
  toInsert = []
  rows = results.fetch_data()

  total = 0
  for row in rows:
    obj = convertToObject(row, results.schema)
    if (ttype == 'comments'):
      dbobj = prepareCommentInsert(obj)
    else:
      dbobj = preparePostInsert(obj)
    
    toInsert.append(dbobj)

    if (len(toInsert) >= 1000):
      if (ttype == 'comments'):
        writeComments(db, toInsert, total)
      else:
        writePosts(db, toInsert, total)
      
      total += len(toInsert)
      toInsert = []


def writeComments(db, rows, total):
  print("Writing {0} comments to db ({1})".format(len(rows), total + len(rows)))
  cur = db.cursor()
  psycopg2.extras.execute_values(cur, 
    """INSERT INTO comments (id, author, created, subreddit, score, raw) 
      VALUES %s
      ON CONFLICT (id) DO NOTHING""", 
    rows, 
    "(%(id)s, %(author)s, %(created)s, %(subreddit)s, %(score)s, %(raw)s)")
  db.commit()

def prepareCommentInsert(obj):
  dbobj = {
    'id': obj['id'],
    'author': obj['author'],
    'created': obj['created_utc'],
    'subreddit': obj['subreddit'],
    'score': obj['score'],
    'raw': json.dumps(obj)
  }
  return dbobj

def writePosts(db, rows, total):
  print("Writing {0} posts to db ({1})".format(len(rows), total + len(rows)))
  cur = db.cursor()
  psycopg2.extras.execute_values(cur,
    """INSERT INTO posts (id, author, created, subreddit, score, num_comments, title, raw)
      VALUES %s
      ON CONFLICT (id) DO NOTHING""",
    rows,
    "(%(id)s, %(author)s, %(created)s, %(subreddit)s, %(score)s, %(num_comments)s, %(title)s, %(raw)s)")
  db.commit()

def preparePostInsert(obj):
  dbobj = {
    'id': obj['id'],
    'author': obj['author'],
    'created': obj['created_utc'],
    'subreddit': obj['subreddit'],
    'score': obj['score'],
    'num_comments': obj['num_comments'],
    'title': obj['title'],
    'raw': json.dumps(obj)
  }
  return dbobj

def convertToObject(row, schema):
  obj = {}
  for idx, col in enumerate(schema):
    val = row[idx]
    if (col.name in ['created_utc', 'retrieved_on'] and val):
      val = fromtimestamp(val)
    
    obj[col.name] = val 
  
  return obj




def database():
  conn = psycopg2.connect("dbname='artc' user='artc' host='localhost' password='{0}'".format(DBPASS))
  return conn


def fromtimestamp(timestamp):
  return datetime.utcfromtimestamp(timestamp).isoformat()

if __name__=='__main__':
  main()
