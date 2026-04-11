// src/App.jsx
import Navbar from "./components/common/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/common/Footer";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideChrome = /^\/(owner|admin|staff)(\/|$)/.test(location.pathname);

  return (
    <div className="app-shell">
      {!hideChrome && <Navbar />}
      <AppRoutes />
      {!hideChrome && <Footer />}
    </div>
  );
}

export default App;
