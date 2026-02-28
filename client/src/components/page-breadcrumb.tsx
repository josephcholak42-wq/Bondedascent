import { useLocation } from "wouter";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumb({ current }: { current: string }) {
  const [, setLocation] = useLocation();
  return (
    <Breadcrumb className="mb-6" data-testid="breadcrumb-nav">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer transition-colors text-xs"
            onClick={() => setLocation("/")}
            data-testid="breadcrumb-dashboard"
          >
            <Home size={13} />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-slate-600" />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs text-slate-200 font-semibold" data-testid="breadcrumb-current">
            {current}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
