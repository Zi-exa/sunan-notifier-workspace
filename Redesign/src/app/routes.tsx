import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { TugasPage } from "./pages/Tugas";
import { AbsensiPage } from "./pages/Absensi";
import { KalenderPage } from "./pages/Kalender";
import { SettingsPage } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "tugas", Component: TugasPage },
      { path: "absensi", Component: AbsensiPage },
      { path: "kalender", Component: KalenderPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
