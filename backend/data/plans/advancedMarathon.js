const advancedMarathon = {
  id: "advanced_marathon",
  name: "Advanced Marathon",
  description:
    "An 18-week plan for experienced runners aiming to achieve a competitive marathon time. This high-mileage plan includes intense speed work and long runs.",
  distance: "Marathon",
  level: "Advanced",
  duration: 18,
  goalTime: "Sub 3 hours",
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "6 miles easy + strength training" },
        {
          day: "Tuesday",
          workout: "10x800m at 5K pace with 400m jog recovery",
        },
        { day: "Wednesday", workout: "8 miles medium-long run" },
        { day: "Thursday", workout: "6 miles easy + 6x100m strides" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "15 miles long run" },
        { day: "Sunday", workout: "6 miles recovery run" },
      ],
    },
    // Weeks 2-17 would follow a similar pattern, gradually increasing in intensity and volume.
    // Here's an example of a peak week (week 14):
    {
      week: 14,
      days: [
        { day: "Monday", workout: "8 miles easy + strength training" },
        {
          day: "Tuesday",
          workout: "6x1600m at 10K pace with 800m jog recovery",
        },
        { day: "Wednesday", workout: "12 miles medium-long run" },
        {
          day: "Thursday",
          workout: "10 miles with middle 5 at half marathon pace",
        },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "22 miles long run" },
        { day: "Sunday", workout: "8 miles recovery run" },
      ],
    },
    // The final week (taper):
    {
      week: 18,
      days: [
        { day: "Monday", workout: "5 miles easy" },
        {
          day: "Tuesday",
          workout: "4x800m at goal marathon pace with 400m jog recovery",
        },
        { day: "Wednesday", workout: "4 miles easy" },
        { day: "Thursday", workout: "3 miles easy + 4x100m strides" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "2 miles very easy" },
        { day: "Sunday", workout: "Marathon Race" },
      ],
    },
  ],
  tips: [
    "Monitor your heart rate to ensure you're training in the right zones.",
    "Pay close attention to your nutrition and hydration, especially during peak weeks.",
    "Consider getting a professional gait analysis to optimize your running form.",
    "Incorporate regular massage or physical therapy to prevent injuries.",
    "Taper properly in the last 2-3 weeks before your race.",
    "Mental preparation is key; practice visualization and positive self-talk.",
    "Use long runs to practice your race-day fueling strategy.",
    "Invest in high-quality running gear to minimize discomfort during long training sessions.",
    "Keep a training log to track your progress and identify any potential issues early.",
    "Don't neglect recovery - proper sleep and nutrition are crucial for this high-volume plan.",
  ],
};

module.exports = advancedMarathon;
