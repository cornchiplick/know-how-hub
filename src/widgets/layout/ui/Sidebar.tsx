import { getCategories } from "@/entities/category/queries";
import { SidebarContent } from "./SidebarContent";

export async function Sidebar() {
  const categories = await getCategories();

  return <SidebarContent categories={categories} />;
}
