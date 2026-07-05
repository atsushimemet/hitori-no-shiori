import { AdminPlaceManager } from "@/components/admin/AdminPlaceManager";
import { hasAdminConfig, isAdminAuthenticated } from "@/lib/adminAuth";
import { getAdminPlaceData, type AdminCategory, type AdminPlace } from "@/lib/adminPlaces";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isConfigured = hasAdminConfig();
  const hasDbConfig = hasSupabaseAdminConfig();
  const isAuthenticated = isConfigured ? await isAdminAuthenticated() : false;
  let data: { categories: AdminCategory[]; places: AdminPlace[] } = { categories: [], places: [] };
  let setupError = "";

  if (isAuthenticated && hasDbConfig) {
    try {
      data = await getAdminPlaceData();
    } catch {
      setupError = "Supabase の管理用接続を確認してください。";
    }
  } else if (isAuthenticated) {
    setupError = "管理DB接続が未設定です。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。";
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-16 sm:px-6 lg:px-10">
      <AdminPlaceManager
        initialCategories={data.categories}
        initialIsAuthenticated={isAuthenticated}
        initialPlaces={data.places}
        isConfigured={isConfigured}
        setupError={setupError}
      />
    </main>
  );
}
