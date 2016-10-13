# reddit.com/r/advancedrunning scripts

### `arstats.py`

Gets the top 5 voted and top 5 most commented on posts for the past 4 years, starting today.  Could probably make it configurable but whatever. 

### `artopcommenters.py`  

`python artopcommenters.py <redditid>[.dat]`  

`redditid` is the unique id for a url, e.g. for https://www.reddit.com/r/AdvancedRunning/comments/4yu5rv/ar_olympic_discussion_day_10/ it would be `4yu5rv`.  

This saves the results into a file `<redditid>.dat`, mostly because it takes foreeevvvveeerrrr to run for a single thread due to reddit API buffering.  You can rerun it on that file by running the script with a .dat extension, it'll load data from the file instead of querying the site (for instance if you want to show the top 10 commenters instead of the default). 