import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
// import { Tasks } from "./pages/Tasks";
// import { Performance } from "./pages/Performance";
import { LanguageProvider } from "./hooks/useLanguage";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/tasks" element={<Tasks />} />
          <Route path="/performance" element={<Performance />} /> */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
