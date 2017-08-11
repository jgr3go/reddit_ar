import praw
import sys 
import pickle 
import operator
import csv
import os
import json
from datetime import datetime

AGENT='windows:blood_bender.reddit-data:v1.0.1 (by /u/blood_bender)'
CLIENT_ID='UGFZG3Bcp8Ui3Q'
CLIENT_SECRET=os.environ['PRAW_CLIENT_SECRET']


reddit = praw.Reddit(user_agent=AGENT, client_id=CLIENT_ID, client_secret=CLIENT_SECRET)

def main():
  username = sys.argv[1]
  if (username is None):
    print('must pass in username')
    sys.exit(1)

  redditor = reddit.redditor(username)

  comments = []
  for comment in redditor.comments.new(limit=None):
    c = {}
    c['date'] = fts(comment.created_utc)
    c['subreddit'] = str(comment.subreddit)
    comments.append(c)

  with open('{0}.txt'.format(username), 'wb') as file:
    file.write(json.dumps(comments, indent=2))

  with open('{0}.csv'.format(username), 'wb') as csvfile:
    writer = csv.writer(csvfile)
    for comment in comments:
      writer.writerow([comment['date'], comment['subreddit']])



def fts(timestamp):
  return datetime.utcfromtimestamp(timestamp).isoformat()

if __name__=='__main__':
  main()


