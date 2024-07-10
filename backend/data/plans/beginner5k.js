const beginner5K = {
  id: "beginner_5k",
  name: "Beginner 5K",
  description:
    "An 8-week plan designed for new runners or those returning to running after a long break. This plan will gradually build your endurance and confidence to complete a 5K race.",
  distance: "5K",
  level: "Beginner",
  duration: 8, // weeks
  goalTime: "Finish comfortably",
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 1 min, walk 2 min x 10" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 1 min, walk 2 min x 10" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 1 min, walk 2 min x 12" },
        { day: "Sunday", workout: "Rest or 20-30 min easy walk" },
      ],
    },
    {
      week: 2,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 2 min, walk 2 min x 8" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 2 min, walk 2 min x 8" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 2 min, walk 2 min x 9" },
        { day: "Sunday", workout: "Rest or 20-30 min easy walk" },
      ],
    },
    {
      week: 3,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 3 min, walk 2 min x 6" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 3 min, walk 2 min x 6" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 3 min, walk 2 min x 7" },
        { day: "Sunday", workout: "Rest or 30 min easy walk" },
      ],
    },
    {
      week: 4,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 5 min, walk 2 min x 4" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 5 min, walk 2 min x 4" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 5 min, walk 2 min x 5" },
        { day: "Sunday", workout: "Rest or 30 min easy walk" },
      ],
    },
    {
      week: 5,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 8 min, walk 2 min x 3" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 8 min, walk 2 min x 3" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 8 min, walk 2 min x 4" },
        { day: "Sunday", workout: "Rest or 40 min easy walk" },
      ],
    },
    {
      week: 6,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 12 min, walk 2 min x 2" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 12 min, walk 2 min x 2" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 12 min, walk 2 min, run 8 min" },
        { day: "Sunday", workout: "Rest or 40 min easy walk" },
      ],
    },
    {
      week: 7,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 15 min, walk 1 min, run 10 min" },
        { day: "Wednesday", workout: "Rest or light cross-training" },
        { day: "Thursday", workout: "Run 15 min, walk 1 min, run 10 min" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "Run 25 min continuous" },
        { day: "Sunday", workout: "Rest or 50 min easy walk" },
      ],
    },
    {
      week: 8,
      days: [
        { day: "Monday", workout: "Rest or light cross-training" },
        { day: "Tuesday", workout: "Run 20 min continuous" },
        { day: "Wednesday", workout: "Rest" },
        { day: "Thursday", workout: "Run 20 min continuous" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "5K Race or 30 min continuous run" },
        { day: "Sunday", workout: "Rest and celebrate your achievement!" },
      ],
    },
  ],
  tips: [
    "Start each run with a 5-minute brisk walk to warm up.",
    "End each run with a 5-minute easy walk to cool down.",
    "Don't worry about speed; focus on completing the time or distance.",
    "Stay hydrated and listen to your body. It's okay to take extra walk breaks if needed.",
    "Cross-training can include activities like swimming, cycling, or strength training.",
    "Invest in a good pair of running shoes to prevent injuries.",
    "Join a local running group or find a running buddy for motivation and accountability.",
  ],
};

module.exports = beginner5K;
