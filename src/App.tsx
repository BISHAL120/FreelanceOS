import { Routes, Route } from "react-router-dom";

import Home from "./routes/(public)/home/home";
import NotFound from "./routes/(shared)/NotFound/not-found";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
