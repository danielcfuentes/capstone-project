const intermediate10K = {
  id: "intermediate_10k",
  name: "Intermediate 10K",
  description: "An 8-week plan for runners looking to improve their 10K time.",
  distance: "10K",
  level: "Intermediate",
  duration: 8,
  goalTime: "50:00",
  terrain: ["Road", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Easy run 6K" },
        { day: "Tuesday", workout: "6x800m intervals with 2 min rest" },
        { day: "Wednesday", workout: "Easy run 8K" },
        { day: "Thursday", workout: "Tempo run 5K" },
        { day: "Friday", workout: "Rest or cross-train" },
        { day: "Saturday", workout: "Long run 12K" },
        { day: "Sunday", workout: "Recovery run 5K or rest" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Incorporate hill training for strength",
    "Practice race pace during tempo runs",
    "Focus on proper nutrition and hydration",
    "Include dynamic stretching in your warm-up routine",
  ],
};

module.exports = intermediate10K
