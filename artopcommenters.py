import praw
import sys
import pickle
import operator

AGENT='windows:blood_bender.reddit-data:v1.0.1 (by /u/blood_bender)'
reddit = praw.Reddit(user_agent=AGENT)


def main():
  print("Warning: this takes a tooonnnnn of time, sorry")
  if (len(sys.argv) != 2):
    print("Must pass in postid")
    sys.exit(1)

  postid = sys.argv[1]

  if postid[-4:] == '.dat':
    ret = read(postid)
  else:
    ret = query(postid)

  users = ret['users']

  topusers = sorted(users.items(), key=operator.itemgetter(1), reverse=True)

  pusers = topusers[0:7]

  print('* {0}'.format(ret['title']))
  print('  * ' + ', '.join(map(lambda x: '({0}) /u/{1}'.format(x[1], x[0]), pusers)))


def read(postid):
  with open(postid, 'r') as dumpfile:
    ret = pickle.load(dumpfile)
    return ret

def query(postid):
  post = reddit.get_submission(submission_id=postid, comment_limit=None)
  # here's your bottleneck :(
  post.replace_more_comments(limit=None, threshold=0)
  comments = praw.helpers.flatten_tree(post.comments)

  users = {}
  for comment in comments:
    if (comment.author in users):
      users[comment.author] += 1
    else:
      users[comment.author] = 1


  ret = {}
  ret['id'] = post.id
  ret['title'] = post.title
  ret['link'] = post.permalink
  ret['score'] = post
  ret['users'] = users
  with open('{0}.dat'.format(postid), 'w') as dumpfile:
    pickle.dump(ret, dumpfile)

  return ret



if __name__=="__main__":
  main()