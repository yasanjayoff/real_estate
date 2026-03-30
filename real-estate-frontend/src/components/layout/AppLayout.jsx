import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "../../Header";
import Footer from "../../Footer";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
