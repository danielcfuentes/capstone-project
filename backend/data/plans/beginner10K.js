const beginner10K = {
  id: "beginner_10k",
  name: "Beginner 10K",
  description:
    "A 10-week plan for runners who have completed a 5K and want to step up to the 10K distance.",
  distance: "10K",
  level: "Beginner",
  duration: 10,
  goalTime: "60:00",
  terrain: ["Road", "Treadmill"],
  weeklySchedule: [
    {
      week: 1,
      days: [
        { day: "Monday", workout: "Rest or 30 min cross-training" },
        { day: "Tuesday", workout: "3 miles easy run" },
        { day: "Wednesday", workout: "30 min cross-training" },
        { day: "Thursday", workout: "3 miles easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "4 miles long run" },
        { day: "Sunday", workout: "30 min easy run or brisk walk" },
      ],
    },
    {
      week: 2,
      days: [
        { day: "Monday", workout: "Rest or 30 min cross-training" },
        { day: "Tuesday", workout: "3.5 miles easy run" },
        { day: "Wednesday", workout: "30 min cross-training" },
        { day: "Thursday", workout: "3.5 miles easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "4.5 miles long run" },
        { day: "Sunday", workout: "30 min easy run or brisk walk" },
      ],
    },
    {
      week: 3,
      days: [
        { day: "Monday", workout: "Rest or 35 min cross-training" },
        { day: "Tuesday", workout: "4 miles easy run" },
        { day: "Wednesday", workout: "35 min cross-training" },
        { day: "Thursday", workout: "4 miles easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "5 miles long run" },
        { day: "Sunday", workout: "35 min easy run or brisk walk" },
      ],
    },
    {
      week: 4,
      days: [
        { day: "Monday", workout: "Rest or 35 min cross-training" },
        { day: "Tuesday", workout: "4 miles easy run with 4x20 sec strides" },
        { day: "Wednesday", workout: "35 min cross-training" },
        { day: "Thursday", workout: "4 miles easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "5.5 miles long run" },
        { day: "Sunday", workout: "35 min easy run or brisk walk" },
      ],
    },
    {
      week: 5,
      days: [
        { day: "Monday", workout: "Rest or 40 min cross-training" },
        { day: "Tuesday", workout: "4.5 miles easy run" },
        { day: "Wednesday", workout: "40 min cross-training" },
        {
          day: "Thursday",
          workout: "4.5 miles easy run with 5x20 sec strides",
        },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "6 miles long run" },
        { day: "Sunday", workout: "40 min easy run or brisk walk" },
      ],
    },
    {
      week: 6,
      days: [
        { day: "Monday", workout: "Rest or 40 min cross-training" },
        { day: "Tuesday", workout: "5 miles easy run" },
        { day: "Wednesday", workout: "40 min cross-training" },
        { day: "Thursday", workout: "5 miles easy run with 6x20 sec strides" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "6.5 miles long run" },
        { day: "Sunday", workout: "40 min easy run or brisk walk" },
      ],
    },
    {
      week: 7,
      days: [
        { day: "Monday", workout: "Rest or 45 min cross-training" },
        { day: "Tuesday", workout: "5 miles easy run" },
        { day: "Wednesday", workout: "45 min cross-training" },
        { day: "Thursday", workout: "5 miles easy run with 6x20 sec strides" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "7 miles long run" },
        { day: "Sunday", workout: "45 min easy run or brisk walk" },
      ],
    },
    {
      week: 8,
      days: [
        { day: "Monday", workout: "Rest or 45 min cross-training" },
        { day: "Tuesday", workout: "5.5 miles easy run" },
        { day: "Wednesday", workout: "45 min cross-training" },
        {
          day: "Thursday",
          workout: "5.5 miles easy run with 7x20 sec strides",
        },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "7.5 miles long run" },
        { day: "Sunday", workout: "45 min easy run or brisk walk" },
      ],
    },
    {
      week: 9,
      days: [
        { day: "Monday", workout: "Rest or 30 min easy cross-training" },
        { day: "Tuesday", workout: "5 miles easy run" },
        { day: "Wednesday", workout: "30 min easy cross-training" },
        { day: "Thursday", workout: "4 miles easy run with 4x20 sec strides" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "5 miles easy run" },
        { day: "Sunday", workout: "30 min easy run or brisk walk" },
      ],
    },
    {
      week: 10,
      days: [
        { day: "Monday", workout: "Rest" },
        { day: "Tuesday", workout: "3 miles easy run" },
        { day: "Wednesday", workout: "Rest" },
        { day: "Thursday", workout: "2 miles very easy run" },
        { day: "Friday", workout: "Rest" },
        { day: "Saturday", workout: "10K Race" },
        { day: "Sunday", workout: "Rest and celebrate your achievement!" },
      ],
    },
  ],
  tips: [
    "Run at a conversational pace for most of your runs.",
    "Incorporate hills into some of your runs to build strength.",
    "Cross-training can include cycling, swimming, or strength training.",
    "Make sure to rest adequately between runs to prevent burnout.",
    "Consider joining a local running group for long runs.",
    "Stay hydrated during your runs, especially as the distances increase.",
    "Practice your race-day nutrition strategy during your longer runs.",
    "Invest in proper running gear, including shoes that fit well and moisture-wicking clothes.",
    "Listen to your body and don't be afraid to take an extra rest day if needed.",
  ],
};

module.exports = beginner10K;
