import { SidebarMenuApp } from "@/components/SidebarMenuApp"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"


export default function Dashboard () {
return(
    
    <SidebarProvider>
        <SidebarMenuApp />
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 flex items-center border-b">
                <SidebarTrigger />
                <span className="ml-4 font-medium">Menu</span>
            </div>
            <div className="p-6">
                {/*aqui ira lo que renderiza configurar children */}
            </div>
        </main>
    </SidebarProvider>
)
}