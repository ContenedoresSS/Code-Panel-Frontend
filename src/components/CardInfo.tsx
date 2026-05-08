    import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react";
    interface StatCardProps {
    title: string;
    value: string | number; 
    icon: ReactNode;        
    iconBgClass: string;
    iconColorClass: string;
    }

export function StatCard({ 
    title, 
    value, 
    icon, 
    iconBgClass, 
    iconColorClass 
    }: StatCardProps) {
    return (
        <Card className="rounded-[1.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
        <CardContent className="p-8 flex justify-between items-center">
            
            <div className="flex flex-col">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                {title}
            </p>
            
            <h2 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tighter">
                {value}
            </h2>
            </div>

            <div className={`p-4 rounded-2xl flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
            {icon}
            </div>
            
        </CardContent>
        </Card>
    );
    }