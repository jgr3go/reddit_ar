import praw
from datetime import datetime, timedelta
import calendar
import sys
import operator


AGENT='windows:blood_bender.reddit-data:v1.0.1 (by /u/blood_bender)'
reddit = praw.Reddit(user_agent=AGENT)

def main():
  oneYear = timedelta(days=365)
  current = datetime.utcnow()
  start = current - oneYear - oneYear - oneYear - oneYear
  end = start + oneYear

  results = []

  while start < current:
    votes, comments = querytop(start, end)
    results.append({'votes': votes, 'comments': comments, 'start': start, 'end': end})
    start = end
    end = end + oneYear


  with open('arstats.txt', 'wb') as f:

    f.write('**Votes**  \n\n')
    for result in results:
      printrange(f, result['start'], result['end'])
      for post in result['votes']:
        printpost(f, post, 'score')
    
    f.write('\n\n')
    f.write('**Comments**  \n\n')
    for i, result in enumerate(results):
      printrange(f, result['start'], result['end'])
      for post in result['comments']:
        printpost(f, post, 'comments')


def querytop(start, end):
  print("Querying {0} - {1}".format(start, end))
  starttime = calendar.timegm(start.timetuple())
  endtime = calendar.timegm(end.timetuple())

  sub = reddit.get_subreddit('advancedrunning')
  topcomments = sub.search(
    timestamp(starttime, endtime),
    subreddit='advancedrunning',
    sort='comments',
    limit=5,
    t='all',
    syntax='cloudsearch'
  )
  comments = []
  for post in topcomments:
    comments.append(parsepost(post))


  topvotes = sub.search(
    timestamp(starttime, endtime),
    subreddit='advancedrunning',
    sort='top',
    limit=5,
    t='all',
    syntax='cloudsearch'
  )
  votes = []
  for post in topvotes:
    votes.append(parsepost(post))

  return votes, comments


def timestamp(start, end):
  return 'timestamp:' + str(start) + '..' + str(end)


def printpost(f, p, extra):
  safewrite(f, '* ([{0}]({1})) {2} [/u/{3}]  \n'.format(p[extra], p['link'], enc(p['title']), p['author']))

def printrange(f, start, end):
  safewrite(f, '\n*{0} - {1}*  \n\n'.format(fromdatetime(start), fromdatetime(end)))


def parsepost(post):
  ret = {}
  ret['id'] = post.id
  ret['comments'] = post.num_comments
  ret['link'] = post.permalink
  ret['score'] = post.score
  ret['title'] = unicode(post.title)
  ret['created'] = fromtimestamp(post.created)
  ret['author'] = str(post.author)

  return ret

def fromtimestamp(timestamp):
  return datetime.fromtimestamp(
    int(timestamp)
  ).strftime('%Y-%m-%d %H:%M:%S')

def fromdatetime(dt):
  return dt.strftime('%B %d, %Y')

def enc(p):
  return p.encode(sys.stdout.encoding, errors='replace')

def safewrite(f, p):
  f.write(enc(p))

if __name__=="__main__":
  main()
