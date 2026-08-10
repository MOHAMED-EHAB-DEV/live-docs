import Header from "@/components/Header";
import Notifications from "@/components/Notifications";
import UserDropdown from "@/components/UserDropdown";
import SettingsView from "@/components/SettingsView";
import DeveloperBadge from "@/components/DeveloperBadge";

export const metadata = {
  title: "Account Settings | LiveDocs",
  description: "Manage your LiveDocs profile details, avatar, and security preferences.",
};

const SettingsPage = () => {
  return (
    <main className="min-h-screen bg-dark-100 flex flex-col">
      <Header className="sticky inset-s-0 top-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <UserDropdown />
        </div>
      </Header>

      <div className="flex-1 w-full">
        <SettingsView initialTab="profile" />
      </div>

      <DeveloperBadge variant="floating" />
    </main>
  );
};

export default SettingsPage;

