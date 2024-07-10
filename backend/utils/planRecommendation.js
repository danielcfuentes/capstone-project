// // Import the running plans data from a local file
// const runningPlans = require("../data/runningPlans");

// // Main function to recommend a running plan based on user profile
// function recommendPlan(userProfile) {
//   // Destructure user profile object to extract relevant properties
//   const {
//     fitnessLevel,
//     runningExperience,
//     preferredDistance,
//     weeklyMileage,
//     goalTime,
//     weight,
//     height,
//     age,
//     gender,
//     preferredTerrains,
//     healthConditions,
//   } = userProfile;

//   // Convert preferred distance to a standardized format (e.g., "5K", "Marathon")
//   const normalizedDistance = normalizeDistance(preferredDistance);

//   // Filter plans to only include those that match the user's preferred distance
//   let eligiblePlans = runningPlans.filter(
//     (plan) => plan.distance === normalizedDistance
//   );

//   // If no plans match the preferred distance, return null to indicate no suitable plans were found
//   if (eligiblePlans.length === 0) {
//     return null; // No suitable plans found
//   }

//   // Score each eligible plan based on the user profile
//   const scoredPlans = eligiblePlans.map((plan) => ({
//     ...plan, // Spread the plan object to maintain its properties
//     score: scorePlan(plan, userProfile), // Calculate and add the score property
//   }));

//   // Sort the plans by their score in descending order to get the best match at the top
//   scoredPlans.sort((a, b) => b.score - a.score);

//   // Return the top recommendation, i.e., the plan with the highest score
//   return scoredPlans[0];
// }

// // Function to score each plan based on how well it matches the user profile
// function scorePlan(plan, userProfile) {
//   // Initialize the score for the plan
//   let score = 0;

//   // Destructure user profile object again to use inside this function
//   const {
//     fitnessLevel,
//     runningExperience,
//     weeklyMileage,
//     goalTime,
//     weight,
//     height,
//     age,
//     gender,
//     preferredTerrains,
//     healthConditions,
//   } = userProfile;

//   // Score based on fitness level match
//   // Perfect match gives 3 points, close match gives 1 point
//   if (plan.level.toLowerCase() === fitnessLevel.toLowerCase()) score += 3;
//   else if (
//     Math.abs(getLevelScore(plan.level) - getLevelScore(fitnessLevel)) === 1
//   )
//     score += 1;

//   // Score based on running experience
//   // Match specific experience levels with corresponding plan levels to add points
//   if (plan.level === "Beginner" && runningExperience === "Novice") score += 2;
//   if (plan.level === "Intermediate" && runningExperience === "Recreational")
//     score += 2;
//   if (plan.level === "Advanced" && runningExperience === "Competitive")
//     score += 2;

//   // Score based on weekly mileage
//   // Calculate plan's max mileage and check if user's weekly mileage is within a specific range around it
//   const planMaxMileage = estimatePlanMaxMileage(plan);
//   if (
//     weeklyMileage >= planMaxMileage * 0.7 && // At least 70% of plan's max mileage
//     weeklyMileage <= planMaxMileage * 1.2 // At most 120% of plan's max mileage
//   )
//     score += 2;

//   // Score based on goal time similarity (if applicable)
//   // Compare user's goal time with plan's goal time and add points if they are close
//   if (plan.goalTime && goalTime) {
//     const planGoalSeconds = convertTimeToSeconds(plan.goalTime);
//     const userGoalSeconds = convertTimeToSeconds(goalTime);
//     if (Math.abs(planGoalSeconds - userGoalSeconds) / planGoalSeconds <= 0.1)
//       score += 2;
//   }

//   // Score based on preferred terrains
//   // Check how many of the user's preferred terrains are included in the plan's terrain
//   if (preferredTerrains && preferredTerrains.length > 0) {
//     const terrainScore =
//       preferredTerrains.reduce((sum, terrain) => {
//         return sum + (plan.terrain.includes(terrain) ? 1 : 0);
//       }, 0) / preferredTerrains.length;
//     score += terrainScore * 2;
//   }

//   // Adjust score based on health conditions
//   // Add points for plans that are suitable for the user's health conditions
//   if (healthConditions && healthConditions.length > 0) {
//     const healthScore = assessHealthConditions(healthConditions, plan);
//     score += healthScore;
//   }

//   // Adjust score based on age and gender if the plan has specific recommendations
//   // Add points if the user's age and gender match the plan's recommendations
//   if (plan.ageRecommendation && isWithinRange(age, plan.ageRecommendation))
//     score += 1;
//   if (
//     plan.genderFocus &&
//     plan.genderFocus.toLowerCase() === gender.toLowerCase()
//   )
//     score += 1;

//   // Return the total score for the plan
//   return score;
// }

// // Function to assess and score health conditions against the plan
// function assessHealthConditions(healthConditions, plan) {
//   let healthScore = 0;
//   // Example scoring logic based on health conditions and plan characteristics
//   if (healthConditions.includes("asthma") && plan.terrain.includes("flat"))
//     healthScore += 1; // Add point if the plan is suitable for asthma patients
//   if (
//     healthConditions.includes("kneeIssues") &&
//     plan.terrain.includes("low-impact")
//   )
//     healthScore += 1; // Add point if the plan is suitable for those with knee issues
//   return healthScore;
// }

// // Function to check if a value is within a specified range
// function isWithinRange(value, range) {
//   const [min, max] = range.split("-").map(Number); // Split the range string into min and max values
//   return value >= min && value <= max; // Check if the value falls within the range
// }

// // Function to normalize distance to a standard format
// function normalizeDistance(distance) {
//   const distanceLower = distance.toLowerCase(); // Convert distance to lowercase for comparison
//   if (distanceLower.includes("5k")) return "5K"; // Normalize to "5K"
//   if (distanceLower.includes("10k")) return "10K"; // Normalize to "10K"
//   if (distanceLower.includes("half") || distanceLower.includes("21k"))
//     return "Half Marathon"; // Normalize to "Half Marathon"
//   if (distanceLower.includes("marathon") || distanceLower.includes("42k"))
//     return "Marathon"; // Normalize to "Marathon"
//   return distance; // Return the original distance if no match
// }

// // Function to convert fitness level to a numerical score for comparison
// function getLevelScore(level) {
//   switch (level.toLowerCase()) {
//     case "beginner":
//       return 1;
//     case "intermediate":
//       return 2;
//     case "advanced":
//       return 3;
//     default:
//       return 0; // Return 0 if the level is not recognized
//   }
// }

// // Function to estimate the maximum mileage for a plan based on its distance
// function estimatePlanMaxMileage(plan) {
//   switch (plan.distance) {
//     case "5K":
//       return 30; // Estimate 30 miles for a 5K plan
//     case "10K":
//       return 40; // Estimate 40 miles for a 10K plan
//     case "Half Marathon":
//       return 50; // Estimate 50 miles for a Half Marathon plan
//     case "Marathon":
//       return 70; // Estimate 70 miles for a Marathon plan
//     default:
//       return 30; // Default to 30 miles if the distance is not recognized
//   }
// }

// // Function to convert a time string (HH:MM:SS) to total seconds
// function convertTimeToSeconds(timeString) {
//   const [hours, minutes, seconds] = timeString.split(":").map(Number); // Split the time string into hours, minutes, and seconds
//   return hours * 3600 + minutes * 60 + (seconds || 0); // Calculate total seconds
// }

// // Export the recommendPlan function for use in other modules
// module.exports = { recommendPlan };
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
