import praw
import sys
import pickle
import operator
import json
from datetime import datetime

AGENT='windows:blood_bender.reddit-data:v1.0.1 (by /u/blood_bender)'
reddit = praw.Reddit(user_agent=AGENT)


def main():
  print("Warning: this takes a tooonnnnn of time, sorry")
  if (len(sys.argv) != 2):
    print("Must pass in postid")
    sys.exit(1)

  postid = sys.argv[1]

  ret = query(postid)

  users = ret['users']

  topusers = sorted(users.items(), key=operator.itemgetter(1), reverse=True)

  pusers = topusers[0:7]

  print('* {0}'.format(ret['title']))
  print('  * ' + ', '.join(map(lambda x: '({0}) /u/{1}'.format(x[1], x[0]), pusers)))


def query(postid):
  post = reddit.get_submission(submission_id=postid, comment_limit=None)
  
  # here's your bottleneck :(
  post.replace_more_comments(limit=None, threshold=0)
  comments = praw.helpers.flatten_tree(post.comments)
  dumpedcomments = []
  users = {}

  with open('{0}_comments_raw.dat'.format(postid), 'w') as comfile:
    pickle.dump(comments, comfile)

    
  for comment in comments:
    c = {}
    c['id'] = comment.id
    c['link_id'] = comment.link_id
    c['link'] = comment.permalink
    c['score'] = comment.score 
    c['author'] = str(comment.author)
    if (comment.parent_id == comment.link_id):
      c['parent_id'] = None
    else:
      c['parent_id'] = comment.parent_id
    c['created'] = fromtimestamp(comment.created_utc)
    c['is_root'] = comment.is_root
    c['body'] = comment.body

    dumpedcomments.append(c)

    if (comment.author in users):
      users[comment.author] += 1
    else:
      users[comment.author] = 1


  ret = {}
  ret['id'] = post.id
  ret['title'] = post.title
  ret['link'] = post.permalink
  ret['score'] = post.score
  ret['users'] = users

  with open('{0}.dat'.format(postid), 'w') as dumpfile:
    pickle.dump(ret, dumpfile)

  with open('{0}_comments.json'.format(postid), 'wb') as cfile:
    cfile.write(json.dumps(dumpedcomments))

  return ret


def fromtimestamp(timestamp):
  return datetime.utcfromtimestamp(timestamp).isoformat()

def enc(p):
  return p.encode(sys.stdout.encoding, errors='replace')

if __name__=="__main__":
  main()