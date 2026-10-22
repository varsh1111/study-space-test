import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { LayoutDashboard, Trophy, Plus, Clock3, ChartNoAxesCombined, GraduationCap } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { usePlanner, subjectColor, progressOf } from "@/lib/planner";
import { AddSubjectDialog } from "./AddSubjectDialog";

export function AppSidebar() {
  const { subjects, assignments } = usePlanner();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-card p-0.5 shadow-soft">
            <img src={logo} alt="Study Space alien logo" width={1024} height={1024} className="size-full object-contain" />
          </div>
          {!collapsed && <span className="font-display text-lg font-bold">Study Space</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/"} tooltip="Dashboard">
                  <Link to="/"><LayoutDashboard /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/progress"} tooltip="My Progress">
                  <Link to="/progress"><Clock3 /><span>My Progress</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/report"} tooltip="Weekly Report">
                  <Link to="/report"><ChartNoAxesCombined /><span>Weekly Report</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/exams"} tooltip="Exam Tracker">
                  <Link to="/exams"><GraduationCap /><span>Exam Tracker</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/achievements"} tooltip="Achievements">
                  <Link to="/achievements"><Trophy /><span>Achievements</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>My subjects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subjects.map((s) => {
                const p = progressOf(assignments.filter((a) => a.subjectId === s.id));
                return (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton asChild isActive={path === `/subjects/${s.id}`} tooltip={s.name}>
                      <Link to="/subjects/$id" params={{ id: s.id }}>
                        <span className="grid size-4 place-items-center text-sm">{s.emoji}</span>
                        <span className="truncate">{s.name}</span>
                        <span className="ml-auto size-2 shrink-0 rounded-full" style={{ background: subjectColor(s.color) }} />
                      </Link>
                    </SidebarMenuButton>
                    {!collapsed && <SidebarMenuBadge className="mr-4 text-sidebar-foreground/60">{p}%</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AddSubjectDialog>
          <SidebarMenuButton tooltip="Add subject" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground">
            <Plus /><span>Add subject</span>
          </SidebarMenuButton>
        </AddSubjectDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
