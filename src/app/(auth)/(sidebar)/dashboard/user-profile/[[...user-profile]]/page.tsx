import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="my-6 -ml-16">
      <UserProfile />
    </div>
  );
}
