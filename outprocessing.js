const fs = require("fs");

const data = JSON.parse(fs.readFileSync('maps.json'));
let n = JSON.parse(fs.readFileSync('bns.json'));
// Prepare an object `nominators`. It is an object with `nominator name` keys and a `times nominated with` values.
let nominators = {};
for (let nominator of Object.values(n)) {
  nominators[nominator] = {};
}
// From the data, loop through every mapper's maps. Then loop through each of those map's pushers. Run the function to update the `nominators` object.
for (let [mapper, maps] of Object.entries(data)) {
  for (let pushers of Object.values(maps)) {
    addAffinity(pushers);
  }
}
// Prepare an object `partnerTimesMap`. It is an object with `nominator 1 & nominator 2` keys and a `times nominated as this pair` values.
let partnerTimesMap = {};
// From the new `nominators` object, loop through each nominator's partners. Then loop through each of those partner's `times nominated with`.
for (let [pusher, partners] of Object.entries(nominators)) {
  for (let [partner, times] of Object.entries(partners)) {
    // Link their names, and check if the inverse case has already been added. Make sure it isn't, then log it.
    const linkedName = `${pusher} & ${partner}`;
    if (partnerTimesMap.hasOwnProperty(`${partner} & ${pusher}`)) continue;
    partnerTimesMap[linkedName] = times;
  }
}

// From this object `partnerTimesMap`, turn it into an array. Sort this array in descending order, and print the result.
let partnerTimesArray = Object.entries(partnerTimesMap).sort((a, b) => b[1] - a[1]);
console.log(partnerTimesArray);

function addAffinity(pushers) {
  // From the array `pushers`, which has elements of nominators who pushed some x map.
  for (let pusher of pushers) {
    for (let partner of pushers) {
      // Find every possible pair (that is not with itself) and increment their index in the `nominators` object.
      if (pusher == partner) continue;
      if (nominators[pusher].hasOwnProperty(partner)) {
        nominators[pusher][partner]++;
      } else {
        nominators[pusher][partner] = 1;
      }
    }
  }
}
