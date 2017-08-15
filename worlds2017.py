import textract
import re

text = textract.process('7d57a8b9-fae1-4171-8559-3c65ee5dbf8d.pdf')

countries = {}

for line in text.split('\n'):
  line = line.strip()
  if re.match('^\d+\s+[A-Z]{3}', line):
    parts = line.split(' ')
    print(parts)
    for ii in range(0, len(parts), 2):
      countries[parts[ii+1]] = parts[ii]

for cc in sorted(countries.iterkeys()):
  print(cc + ' ' + str(countries[cc]))