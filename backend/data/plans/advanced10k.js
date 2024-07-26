const advanced10k = {
  id: "advanced_10k",
  name: "Advanced 10K",
  description:
    "A challenging 10-week plan for experienced runners aiming to set a new 10K personal best.",
  distance: "10K",
  level: "Advanced",
  duration: 10,
  goalTime: "40:00",
  terrain: ["Road", "Track", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Easy run 8K + strength training" },
        { day: "Tuesday", workout: "10x1000m intervals with 90s rest" },
        { day: "Wednesday", workout: "Medium-long run 14K" },
        { day: "Thursday", workout: "Tempo run 8K" },
        { day: "Friday", workout: "Rest or easy 6K" },
        { day: "Saturday", workout: "Long run 18K with last 5K at race pace" },
        { day: "Sunday", workout: "Recovery run 8K" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Incorporate plyometrics for explosive power",
    "Use a GPS watch to track your pace accurately",
    "Practice mental toughness during hard workouts",
    "Consider getting a lactate threshold test",
  ],
};

module.exports = advanced10k
