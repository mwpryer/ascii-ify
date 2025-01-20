import { useApp } from "@/context/app-context";
import { WebcamDisplay } from "@/components/display/webcam-display";
import { UploadDisplay } from "@/components/display/upload-display";
import { Controls } from "@/components/controls/controls";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarRail,
} from "@/components/ui/sidebar";

export function App() {
  const { display } = useApp();

  return (
    <div className="relative flex w-full overflow-hidden rounded-lg border bg-card md:h-[calc(480px+53px)] md:w-auto xl:h-[calc(480px*1.4+53px)]">
      {display === "webcam" ? <WebcamDisplay /> : <UploadDisplay />}
      <Sidebar side="right" className="h-full">
        <SidebarContent>
          <SidebarGroup>
            <Controls />
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
