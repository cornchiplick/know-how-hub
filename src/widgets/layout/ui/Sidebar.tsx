import { getAllGuides } from "@/entities/guide/queries";
import { getAllTags } from "@/entities/tag/queries";
import { SidebarContent } from "./SidebarContent";

export async function Sidebar() {
  const [guides, tags] = await Promise.all([getAllGuides(), getAllTags()]);

  return <SidebarContent guides={guides} tags={tags} />;
}
