import { Hello } from '@/components/Hello';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>
      <Hello />
    </div>
  );
}
