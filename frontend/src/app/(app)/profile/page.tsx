import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import Profile from "@/components/profile/Profile";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-muted/20">
      <PageContainer>
        <PageHeader
          title="My profile"
          description="View your account details and manage your password."
        />

        <Profile />
      </PageContainer>
    </div>
  );
}
