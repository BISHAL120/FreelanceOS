import { Routes, Route } from "react-router-dom";

import Home from "./routes/(public)/home/home";
import NotFound from "./routes/(shared)/NotFound/not-found";
import Header from "./routes/(public)/shared/header";

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
