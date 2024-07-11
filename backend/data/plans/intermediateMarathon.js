const intermediateMarathon = {
  id: "intermediate_marathon",
  name: "Intermediate Marathon",
  description:
    "A 16-week plan for runners who have completed a marathon and want to improve their time.",
  distance: "Marathon",
  level: "Intermediate",
  duration: 16,
  goalTime: "3:45:00",
  terrain: ["Road", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Easy run 8K + strength training" },
        { day: "Tuesday", workout: "8x800m intervals with 90s rest" },
        { day: "Wednesday", workout: "Medium run 12K" },
        { day: "Thursday", workout: "Tempo run 8K" },
        { day: "Friday", workout: "Rest or cross-train" },
        { day: "Saturday", workout: "Long run 20K" },
        { day: "Sunday", workout: "Recovery run 8K or rest" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Incorporate marathon pace runs into your training",
    "Practice mental strategies for the latter part of the race",
    "Experiment with different types of energy gels and drinks",
    "Include regular massage or foam rolling in your recovery routine",
  ],
};

module.exports = intermediateMarathon
