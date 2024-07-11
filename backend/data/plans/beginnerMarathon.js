const beginnerMarathon =
{
    id: 'beginner_marathon',
    name: 'Beginner Marathon',
    description: 'A 20-week plan designed to get first-time marathoners to the finish line.',
    distance: 'Marathon',
    level: 'Beginner',
    duration: 20,
    goalTime: '4:30:00',
    terrain: ['Road', 'Trail'],
    weeklySchedule: [
      {
        week: 1,
        days: [
          { day: 'Monday', workout: 'Rest or light cross-training' },
          { day: 'Tuesday', workout: 'Easy run 5K' },
          { day: 'Wednesday', workout: 'Cross-train or rest' },
          { day: 'Thursday', workout: 'Easy run 6K' },
          { day: 'Friday', workout: 'Rest' },
          { day: 'Saturday', workout: 'Long run 10K' },
          { day: 'Sunday', workout: 'Easy walk or rest' }
        ]
      },
      // ... (add more weeks following a similar pattern)
    ],
    tips: [
      'Focus on finishing rather than time for your first marathon',
      'Gradually increase your long run distance',
      'Practice your fueling strategy during long runs',
      "Listen to your body and don't be afraid to take extra rest days"
    ]
  };

  module.exports = beginnerMarathon
