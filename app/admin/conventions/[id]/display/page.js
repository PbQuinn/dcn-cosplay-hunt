"use server"

import { loadConvention } from "@/app/actions/convention";
import ConventionDisplayPage from "./DisplayPage";

export default async function AdminConventionPage({ params }) {
  const { id } = await params;

  const convention = await loadConvention(id);

  return (
      <ConventionDisplayPage convention={convention}/>
  );
}