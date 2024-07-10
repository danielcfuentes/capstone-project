const beginner5K = require("./plans/beginner5k");
const intermediate5K = require("./plans/intermediate5k");
const beginner10K = require("./plans/beginner10K");
const intermediateHalfMarathon = require("./plans/intermediateHalfMarathon");
const advancedMarathon = require("./plans/advancedMarathon");

const runningPlans = [
  beginner5K,
  intermediate5K,
  beginner10K,
  intermediateHalfMarathon,
  advancedMarathon,
];

module.exports = runningPlans;
