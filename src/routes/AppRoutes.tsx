import PdfPage from "@/pages/PdfPage";
import { Route, Routes } from "react-router";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PdfPage />} />
    </Routes>
  );
}
