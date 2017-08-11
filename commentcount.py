import praw
import sys 
import pickle 
import operator
import csv
import os
import json
import moment
from datetime import datetime

AGENT='windows:blood_bender.reddit-data:v1.0.1 (by /u/blood_bender)'
CLIENT_ID='UGFZG3Bcp8Ui3Q'
CLIENT_SECRET=os.environ['PRAW_CLIENT_SECRET']


reddit = praw.Reddit(user_agent=AGENT, client_id=CLIENT_ID, client_secret=CLIENT_SECRET)

commentsByDate = {}

def main():
  for sub in reddit.subreddit('AdvancedRunning').new(limit=None):
    dt = moment.unix(sub.created_utc).format('YYYY-MM-DD')
    if dt not in commentsByDate:
      commentsByDate[dt] = 0
    commentsByDate[dt] += sub.num_comments

  for dt in sorted(commentsByDate.iterkeys()):
    print(dt + ' ' + str(commentsByDate[dt]))

def safe(st):
  return st.encode('utf-8').strip()

def fts(timestamp):
  return datetime.utcfromtimestamp(timestamp).isoformat()

if __name__=='__main__':
  main()


