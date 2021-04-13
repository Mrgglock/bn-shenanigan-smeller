// This creates a file out.json with an object of users, of which these users have maps, of which have the nominators who pushed the map.

const fetch = require("node-fetch");
const fs = require("fs");
const session = JSON.parse(fs.readFileSync('cookie.json'));

(async () => {
  // Fetch all nominator's IDs. This returns an object with keys `osuId` and values `nominator's name`.
  const nominatorIDs = await getNominatorsIDs();

  // Prepare a list of creators with their maps and which nominators participated in it. This will be an object with keys `mapper name` and the values being another object.
  // This object has keys `map name the mapper made` and the value is an array of nominators involved in pushing that map name.
  let creatorMaps = {};
  // Fetch each nominator's nominations
  let n = [];
  console.log("Fetching everyone's nominations...");
  for (let [id, nominator] of Object.entries(nominatorIDs)) {
    console.log("Loading " + nominator + "...");
    let nominations = await getNominations(id, 365)
    // The returned object `nominations` is received from a GET request, an object with many details, with which we are extracting artistTitle and creatorName from it.
    for (let nomination of nominations) {
      // Call a function to update the object `creatorMaps`.
      addMapAndCreators(nomination.artistTitle, nomination.creatorName, nominator);
      console.log(`Processed: ${nomination.artistTitle} by ${nomination.creatorName}`)
    }
  }
  console.log("Done!");
  // Write them to a .json file to store it in memory for access by outprocessing.js
  fs.writeFileSync('bns.json', JSON.stringify(nominatorIDs, null, 2));
  fs.writeFileSync('maps.json', JSON.stringify(creatorMaps, null, 2));



  function addMapAndCreators(map, creator, nominator) {
    if (!creatorMaps.hasOwnProperty(creator)) {
      creatorMaps[creator] = {};
    }
    if (!creatorMaps[creator].hasOwnProperty(map)) {
      creatorMaps[creator][map] = [];
    }
    creatorMaps[creator][map].push(nominator);
    return;
  }

  async function getNominatorsIDs() {
    // Whitelisted hardcoded people I want to allow in my program
    let whitelist = ["Myxo", "Stefan"];
    console.log("Fetching current and previous BNs...");
    // Fetch request for all BNs and NATs, even old ones.
    let t = await fetch("https://bn.mappersguild.com/users/loadPreviousBnAndNat", {
      "headers": {
        "cookie": `bnsite_session=${session}`
      },
    });
    t = await t.json();
    console.log("Fetched! Data processing...");
    t = t.users;
    // Cutoff date; beatmap nominators who have left before this date will not be considered.
    const cutoff = new Date() - 365 * 24 * 60 * 60 * 1000;
    // Do some data processing and filtering on the users returned.
    t = t.filter(user => {
      // Allow the user through if they are whitelisted.
      if (whitelist.includes(user)) return true;
      // If the user is in charge of taiko or mania or catch AND NOT osu standard, Disallow the user.
      let modes = user.modes;
      if ((modes.includes("taiko") || modes.includes("mania") || modes.includes("catch")) && !modes.includes("osu")) {
        return false;
      }
      // Check the beatmap nominators history. If the last ever record of that is them leaving, they are not in the group.
      // Check when they left. If they left before the cutoff date, disallow them. Otherwise, allow them.
      const hist = user.history;
      const lastHist = hist[hist.length - 1];
      if (lastHist.kind == "left" && new Date(lastHist.date) < cutoff) {
          return false;
      }
      return true;
    });
    // t is now a filtered dictionary of beatmap nominators from the GET request.
    // Simply prepare a new object `idToUserMap` with keys osuId and values username.
    let idToUserMap = {};
    for (let info of t) {
      idToUserMap[info.osuId] = info.username;
    }
    console.log("Done processing data!")
    return idToUserMap;
  }

  async function getNominations(nominatorID, days) {
    // Fetch the nominator's history using their ID.
    let s = await fetch(`https://bn.mappersguild.com/users/activity?osuId=${nominatorID}&modes=osu&deadline=1618153877000&mongoId=5ccfd837279ca8001893e1a1&days=${days}`,
      {
      "headers": {
        "cookie": `bnsite_session=${session}`
      }
    });

    s = await s.json();
    // Look through their nominations - not their disqualifications etc.
    s = s.uniqueNominations;
    s = s.filter(nomination => nomination.type == 'nominate' || nomination.type == 'qualify');
    // access data with .beatmapsetId or .creatorId or .artistTitle or .creatorName or
    return s;
  }
})()
