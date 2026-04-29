import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarMenuApp } from "@/components/SidebarMenuApp";
import { Outlet } from "react-router";
import { ModeToggle } from "@/components/ModeToggle";
export default function DashboardLayout() {
return (
    <SidebarProvider>
        <SidebarMenuApp />
        <main className="flex-1 overflow-y-auto bg-background min-h-screen">
            
            <div className="p-4 flex items-center border-b border-border bg-background text-foreground">
            <SidebarTrigger />
            <span className="ml-4 font-medium">CodePanel</span>
            
            <div className="ml-auto">
                <ModeToggle/>
            </div>
        </div>
            
            <div className="p-6">
                <Outlet /> 
            </div>
        </main>
    </SidebarProvider>
    );
}