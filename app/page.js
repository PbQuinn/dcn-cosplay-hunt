import { cookies } from "next/headers";
import CosplayHunt from "./CosplayHunt";
import { getCurrentConvention } from "./actions/convention";
import { loadPlayerFromUid } from "./actions/player";

export default async function Page() {
  let conventionData = await getCurrentConvention();
  let hunterData = null;

  if (conventionData) {
    const cookieStore = await cookies();
    const hunterId = cookieStore.get("hunter_app_uid")?.value ?? null;

    if (hunterId) {
      const foundHunterData = await loadPlayerFromUid(hunterId);
      hunterData = foundHunterData;
    }

    return <CosplayHunt convention={conventionData} hunter={hunterData} />;
  } else {
    return <div>No Convention found</div>;
  }
}