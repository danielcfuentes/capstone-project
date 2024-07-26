const advancedhalfmarathon = {
  id: "advanced_half_marathon",
  name: "Advanced Half Marathon",
  description:
    "A 14-week high-intensity plan for experienced runners aiming for a competitive half marathon time.",
  distance: "Half Marathon",
  level: "Advanced",
  duration: 14,
  goalTime: "1:30:00",
  terrain: ["Road", "Track", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Easy run 10K + strength training" },
        { day: "Tuesday", workout: "12x400m intervals with 60s rest" },
        { day: "Wednesday", workout: "Medium-long run 16K" },
        { day: "Thursday", workout: "Tempo run 10K" },
        { day: "Friday", workout: "Rest or easy 8K" },
        {
          day: "Saturday",
          workout: "Long run 22K with middle 10K at goal pace",
        },
        { day: "Sunday", workout: "Recovery run 10K or cross-train" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Incorporate race-specific workouts",
    "Use a heart rate monitor for precise training",
    "Practice your race-day routine, including nutrition",
    "Include regular foam rolling and stretching for recovery",
  ],
};

module.exports = advancedhalfmarathon
