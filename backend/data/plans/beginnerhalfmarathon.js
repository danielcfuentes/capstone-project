const beginnerhalfmarathon = {
  id: "beginner_half_marathon",
  name: "Beginner Half Marathon",
  description: "A 12-week plan for runners new to the half marathon distance.",
  distance: "Half Marathon",
  level: "Beginner",
  duration: 12,
  goalTime: "2:15:00",
  terrain: ["Road", "Trail"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Easy run 5K" },
        { day: "Wednesday", workout: "Cross-train or rest" },
        { day: "Thursday", workout: "Easy run 6K" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Long run 8K" },
        { day: "Sunday", workout: "Easy walk or rest" },
      ],
    },
    // ... (add more weeks following a similar pattern)
  ],
  tips: [
    "Build your endurance gradually",
    "Practice proper pacing during long runs",
    "Invest in good running shoes and socks",
    "Stay motivated by running with a group or partner",
  ],
};

module.exports = beginnerhalfmarathon
