import { useAuth } from "@/assets/context/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"

import { LayoutDashboard , User2, Code, Settings, Layers, KeyRound, LogOut, SquareChartGantt, Users } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { UserRole } from "@/types/enum/UserRole";


export function SidebarMenuApp () {
const { user, logoutState } = useAuth();
const navigate = useNavigate();

const handleLogout = () => {
    logoutState();
    navigate("/login");
  };
return(
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Code />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">CodePanel</span>
                
              </div>
              
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to={"/dashboard"}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to={"/course"}>
                  <Layers />
                  <span>Cursos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem></SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>ADMIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {user?.role === UserRole.GOD && (
                   
                  <Link to={"/access"}>
                  <KeyRound />
                  <span>Invitaciones</span>
                  </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {user?.role === UserRole.GOD && (
                  <Link to={"/language"}>
                  <SquareChartGantt />
                  <span>Lenguaje</span>
                  </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {user?.role === UserRole.GOD && (
                  <Link to={"/user"}>
                  <Users />
                  <span>Usuarios</span>
                  </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>SYSTEM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to={"/setting"}>
                  <Settings />
                  <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          {/* Usamos un div con flex para separar la info del botón */}
          <div className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            
            {/* Lado izquierdo: Icono e Info del usuario */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name|| 'Usuario'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Lado derecho: Botón de Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
            
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    </Sidebar>
)
}

export default SidebarMenuApp;