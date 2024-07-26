const runningPlans = require("../data/runningPlans");

function recommendPlan(userProfile) {
  const normalizedDistance = normalizeDistance(userProfile.preferredDistance);
  let eligiblePlans = runningPlans.filter(
    (plan) => plan.distance === normalizedDistance
  );

  if (eligiblePlans.length === 0) {
    return null; // No suitable plans found
  }

  const scoredPlans = eligiblePlans.map((plan) => ({
    ...plan,
    score: scorePlan(plan, userProfile),
  }));

  scoredPlans.sort((a, b) => b.score - a.score);
  return scoredPlans[0];
}

function scorePlan(plan, userProfile) {
  let score = 0;
  const {
    fitnessLevel,
    runningExperience,
    weeklyMileage,
    goalTime,
    preferredTerrains,
    healthConditions,
  } = userProfile;

  // Score based on fitness level
  if (fitnessLevel && plan.level) {
    if (plan.level.toLowerCase() === fitnessLevel.toLowerCase()) score += 3;
    else if (
      Math.abs(getLevelScore(plan.level) - getLevelScore(fitnessLevel)) === 1
    )
      score += 1;
  }

  // Score based on running experience
  if (runningExperience && plan.level) {
    if (plan.level === "Beginner" && runningExperience === "Novice") score += 2;
    if (plan.level === "Intermediate" && runningExperience === "Recreational")
      score += 2;
    if (plan.level === "Advanced" && runningExperience === "Competitive")
      score += 2;
  }

  // Score based on weekly mileage
  if (typeof weeklyMileage === "number" && !isNaN(weeklyMileage)) {
    const planMaxMileage = estimatePlanMaxMileage(plan);
    if (
      weeklyMileage >= planMaxMileage * 0.7 &&
      weeklyMileage <= planMaxMileage * 1.2
    )
      score += 2;
  }

  // Score based on goal time
  if (plan.goalTime && goalTime) {
    const planGoalSeconds = convertTimeToSeconds(plan.goalTime);
    const userGoalSeconds = convertTimeToSeconds(goalTime);
    if (Math.abs(planGoalSeconds - userGoalSeconds) / planGoalSeconds <= 0.1)
      score += 2;
  }

  // Score based on preferred terrains
  if (
    preferredTerrains &&
    Array.isArray(preferredTerrains) &&
    preferredTerrains.length > 0 &&
    plan.terrain
  ) {
    const terrainScore =
      preferredTerrains.reduce((sum, terrain) => {
        return sum + (plan.terrain.includes(terrain) ? 1 : 0);
      }, 0) / preferredTerrains.length;
    score += terrainScore * 2;
  }

  // Score based on health conditions
  if (
    healthConditions &&
    Array.isArray(healthConditions) &&
    healthConditions.length > 0
  ) {
    const healthScore = assessHealthConditions(healthConditions, plan);
    score += healthScore;
  }

  return score;
}

function assessHealthConditions(healthConditions, plan) {
  let healthScore = 0;
  if (plan.terrain) {
    if (healthConditions.includes("asthma") && plan.terrain.includes("flat"))
      healthScore += 1;
    if (
      healthConditions.includes("kneeIssues") &&
      plan.terrain.includes("low-impact")
    )
      healthScore += 1;
  }
  return healthScore;
}

function normalizeDistance(distance) {
  if (!distance) return "";
  const distanceLower = distance.toLowerCase();
  if (distanceLower.includes("5k")) return "5K";
  if (distanceLower.includes("10k")) return "10K";
  if (distanceLower.includes("half") || distanceLower.includes("21k"))
    return "Half Marathon";
  if (distanceLower.includes("marathon") || distanceLower.includes("42k"))
    return "Marathon";
  return distance;
}

function getLevelScore(level) {
  switch (level.toLowerCase()) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    default:
      return 0;
  }
}

function estimatePlanMaxMileage(plan) {
  switch (plan.distance) {
    case "5K":
      return 30;
    case "10K":
      return 40;
    case "Half Marathon":
      return 50;
    case "Marathon":
      return 70;
    default:
      return 30;
  }
}

function convertTimeToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + (seconds || 0);
}

module.exports = { recommendPlan };
