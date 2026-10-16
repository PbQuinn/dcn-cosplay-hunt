"use server";

import { loadConvention } from "@/app/actions/convention";
import AdminPage from "./AdminPage";

export default async function AdminConventionPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams || {};

  const convention = await loadConvention(id);

  return <AdminPage convention={convention} />;
}