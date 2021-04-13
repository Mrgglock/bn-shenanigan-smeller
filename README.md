# bn-shenanigan-smeller
A small pet project to discern to gain data on possible beatmap nominator biases in working with others.

This program was made in Node.js (version 12.19.0).

# Usage
Input your own session cookie to log in to https://bn.mappersguild.com/.


Run `node bnanalysis.js` to obtain a file `bns.json` and `maps.json`.

This is the data processing step, involving many GET requests from the website to gain information such as beatmap nominators, their IDs, all the maps that they nominated, etc.

Open the source code of `bnanalysis.js` to see how the data is processed.


Run `node outprocessing.js` to do some analysis on these obtained files.

Open the source code of `outprocessing.js` to see what analysis is being done.
