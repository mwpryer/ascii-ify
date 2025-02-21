import { useApp } from "@/context/app-context";
import { WebcamDisplay } from "@/components/display/webcam-display";
import { UploadDisplay } from "@/components/display/upload-display";
import { Controls } from "@/components/controls/controls";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Footer } from "@/components/footer";

export function App() {
  const { display } = useApp();

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <Controls />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t py-2.5">
          <Footer />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex h-full flex-1">
        {display === "webcam" ? <WebcamDisplay /> : <UploadDisplay />}
      </div>
    </div>
  );
}
