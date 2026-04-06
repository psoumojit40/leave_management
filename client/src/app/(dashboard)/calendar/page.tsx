import TeamCalendar from '@/components/calendar/TeamCalendar';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Team Calendar</h2>
        <p className="text-gray-600">
          View team members' leave schedules and plan accordingly.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <TeamCalendar />
      </div>
    </div>
  );
}