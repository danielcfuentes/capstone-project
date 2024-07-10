const intermediate5K = {
  id: "intermediate_5k",
  name: "Intermediate 5K",
  description:
    "A 6-week plan for runners who can already run 5K and want to improve their time. This plan introduces speed work and longer runs to boost performance.",
  distance: "5K",
  level: "Intermediate",
  duration: 6,
  goalTime: "Sub 25 minutes",
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Rest or 30 min cross-training" },
        {
          day: "Tuesday",
          workout: "5x400m intervals at 5K pace with 90 sec rest",
        },
        { day: "Wednesday", workout: "40 min easy run" },
        { day: "Thursday", workout: "30 min tempo run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "50 min long run" },
        { day: "Sunday", workout: "30 min easy run or cross-training" },
      ],
    },
    {
      week: 2,
      days: [
        { day: "Monday", workout: "Rest or 30 min cross-training" },
        {
          day: "Tuesday",
          workout: "6x400m intervals at 5K pace with 90 sec rest",
        },
        { day: "Wednesday", workout: "45 min easy run" },
        { day: "Thursday", workout: "35 min tempo run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "55 min long run" },
        { day: "Sunday", workout: "35 min easy run or cross-training" },
      ],
    },
    {
      week: 3,
      days: [
        { day: "Monday", workout: "Rest or 35 min cross-training" },
        {
          day: "Tuesday",
          workout: "7x400m intervals at 5K pace with 90 sec rest",
        },
        { day: "Wednesday", workout: "45 min easy run" },
        { day: "Thursday", workout: "40 min tempo run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "60 min long run" },
        { day: "Sunday", workout: "35 min easy run or cross-training" },
      ],
    },
    {
      week: 4,
      days: [
        { day: "Monday", workout: "Rest or 35 min cross-training" },
        {
          day: "Tuesday",
          workout: "8x400m intervals at 5K pace with 90 sec rest",
        },
        { day: "Wednesday", workout: "50 min easy run" },
        { day: "Thursday", workout: "40 min tempo run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "65 min long run" },
        { day: "Sunday", workout: "40 min easy run or cross-training" },
      ],
    },
    {
      week: 5,
      days: [
        { day: "Monday", workout: "Rest or 40 min cross-training" },
        {
          day: "Tuesday",
          workout: "6x800m intervals at 5K pace with 2 min rest",
        },
        { day: "Wednesday", workout: "50 min easy run" },
        { day: "Thursday", workout: "45 min tempo run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "70 min long run" },
        { day: "Sunday", workout: "40 min easy run or cross-training" },
      ],
    },
    {
      week: 6,
      days: [
        { day: "Monday", workout: "Rest or 30 min easy cross-training" },
        {
          day: "Tuesday",
          workout: "4x400m intervals at 5K pace with 90 sec rest",
        },
        { day: "Wednesday", workout: "30 min easy run" },
        { day: "Thursday", workout: "20 min easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "5K Race" },
        { day: "Sunday", workout: "Rest and celebrate your achievement!" },
      ],
    },
  ],
  tips: [
    "Warm up with 10 minutes of easy jogging before speed work.",
    "Cool down with 10 minutes of easy jogging after hard workouts.",
    "Tempo runs should be at a 'comfortably hard' pace.",
    "Don't increase your weekly mileage by more than 10% each week.",
    "Stay hydrated and fuel properly, especially before long runs.",
    "Focus on maintaining good form during speed work.",
    "Use a running watch or app to track your pace during workouts.",
    "Consider doing some runs on varied terrain to build strength.",
  ],
};

export default intermediate5K;
