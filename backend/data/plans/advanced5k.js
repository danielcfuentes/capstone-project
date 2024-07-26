const advanced5K = {
  id: "advanced_5k",
  name: "Advanced 5K",
  description:
    "Designed for experienced runners aiming to set a new personal best in the 5K.",
  distance: "5K",
  level: "Advanced",
  duration: 8,
  goalTime: "20:00",
  terrain: ["Road", "Track", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Easy run 8K" },
        { day: "Tuesday", workout: "10x400m intervals with 60s rest" },
        { day: "Wednesday", workout: "Medium-long run 12K" },
        { day: "Thursday", workout: "40 min tempo run" },
        { day: "Friday", workout: "Rest or easy 5K" },
        { day: "Saturday", workout: "Long run 15K with last 5K at race pace" },
        { day: "Sunday", workout: "Recovery run 6K" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Incorporate plyometrics and hill sprints for power",
    "Practice race-pace running in your long runs",
    "Use a foam roller for recovery after hard workouts",
    "Consider getting a professional gait analysis",
  ],
};

module.exports = advanced5K;
