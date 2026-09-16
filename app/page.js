import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseServer";
import CosplayHunt from "./CosplayHunt";
import { getCurrentConvention } from "@/lib/common_queries";

export default async function Page() {
  let conventionData = await getCurrentConvention();
  let hunterData;

  if (conventionData) {
    const cookieStore = await cookies();

    const hunterId =
      cookieStore.get("hunter_app_uid")?.value ?? null;
    
    if (hunterId) {
      const { data: foundHunterData, error } = await supabase
        .from("players")
        .select("*")
        .eq("convention_id", conventionData.id)
        .eq("app_uid", hunterId)
        .single();
      hunterData = foundHunterData;
    }

    return (
      <CosplayHunt convention={conventionData} hunter={hunterData}/>
    );
  } else {
    return <div>No Convention found</div>
  }


}