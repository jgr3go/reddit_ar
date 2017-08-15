import praw
from datetime import datetime, timedelta
import sys
import os
import json
import moment
import psycopg2
import psycopg2.extras
import argparse

AGENT='windows:blood_bender.reddit-data:v1.0.0 (by /u/blood_bender)'
CLIENT_ID='UGFZG3Bcp8Ui3Q'
CLIENT_SECRET=os.environ['PRAW_CLIENT_SECRET']
DBPASS=os.environ['ARTC_DB_PASS']

reddit = praw.Reddit(user_agent=AGENT, client_id=CLIENT_ID, client_secret=CLIENT_SECRET, store_json=True)

def main():
  _parser = parser()
  args = _parser.parse_args()
  now = datetime.now()
  after = now - timedelta(days=args.days)
  
  db = database()
  (postsJSON, posts) = download_posts(after)
  writePosts(db, postsJSON)

  for post in posts:
    (commentsJSON, comments) = download_comments(post)
    writeComments(db, commentsJSON)

def parser():
  parse = argparse.ArgumentParser(description="Download /r/artc to database")
  parse.add_argument('--days', dest='days', type=int, default=3, help='The number of days back to download')
  return parse

def database():
  conn = psycopg2.connect("dbname='artc' user='artc' host='localhost' password='{0}'".format(DBPASS))
  return conn

def download_posts(after):
  postsJSON = []
  posts = []
  for post in reddit.subreddit('AdvancedRunning+artc').new(limit=None):
    if (fromtimestamp(post.created_utc, 'datetime') > after):
      obj = preparePost(post.json_dict)
      postsJSON.append(obj)
      posts.append(post)

  return (postsJSON, posts)

def download_comments(post):
  print("Downloading comments for post {0} {1}".format(post.id, printenc(post.title)))
  post.comments.replace_more(limit=None)
  commentsJSON = []
  comments = []
  for comment in post.comments.list():
    obj = prepareComment(comment.json_dict)
    commentsJSON.append(obj)
    comments.append(comment)

  return (commentsJSON, comments)


def prepareObj(obj):
  for key in obj.iterkeys():
    if (key in ['created_utc', 'retrieved_on'] and obj[key]):
      obj[key] = fromtimestamp(obj[key])
    if (key in ['title', 'body'] and obj[key]):
      obj[key] = enc(obj[key])
  return obj

def preparePost(post):

  obj = prepareObj(post)

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
  
def prepareComment(comment):
  obj = prepareObj(comment)

  dbobj = {
    'id': obj['id'],
    'author': obj['author'],
    'created': obj['created_utc'],
    'subreddit': obj['subreddit'],
    'score': obj['score'],
    'raw': json.dumps(obj)
  }
  return dbobj

def writePosts(db, rows):
  print("Writing {0} posts to db".format(len(rows)))
  cur = db.cursor()
  # psycopg2.extras.execute_batch(cur,
    # """INSERT INTO posts (id, author, created, subreddit, score, num_comments, title, raw)
    #   VALUES (%(id)s, %(author)s, %(created)s, %(subreddit)s, %(score)s, %(num_comments)s, %(title)s, %(raw)s)
    #   ON CONFLICT (id) DO UPDATE SET title = %(title)s, raw = %(raw)s""",
  psycopg2.extras.execute_values(cur, 
    """INSERT INTO posts (id, author, created, subreddit, score, num_comments, title, raw)
      VALUES %s
      ON CONFLICT (id) DO NOTHING""",
    rows,
    "(%(id)s, %(author)s, %(created)s, %(subreddit)s, %(score)s, %(num_comments)s, %(title)s, %(raw)s)")
  db.commit()

def writeComments(db, rows):
  print("Writing {0} comments to db".format(len(rows)))
  cur = db.cursor()
  psycopg2.extras.execute_values(cur, 
    """INSERT INTO comments (id, author, created, subreddit, score, raw) 
      VALUES %s
      ON CONFLICT (id) DO NOTHING""", 
    rows, 
    "(%(id)s, %(author)s, %(created)s, %(subreddit)s, %(score)s, %(raw)s)")
  db.commit()
    
def fromtimestamp(timestamp, return_type='str'):
  if (return_type == 'datetime'):
    return datetime.utcfromtimestamp(timestamp)
  return datetime.utcfromtimestamp(timestamp).isoformat()

def enc(p):
  return p.encode('utf-8', errors='replace')
def printenc(p):
  return p.encode(sys.stdout.encoding, errors='replace')

if __name__=='__main__':
  main()