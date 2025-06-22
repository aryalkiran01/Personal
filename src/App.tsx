import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Portfolio from "./components/Portfolio";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminDashboard from "./components/admindashboard";

function App() {
  const [hasPermissions, setHasPermissions] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Main User Portfolio Route */}
          <Route
            path="/"
            element={
              <>
                <Portfolio onPermissionsGranted={() => setHasPermissions(true)} />
                <Navigation />
                {hasPermissions ? (
                  <main>
                    <Hero />
                    <About />
                    <Projects />
                    <Skills />
                    <Contact />
                  </main>
                ) : (
                  <div className="flex justify-center items-center h-screen text-white">
                    <p>Please grant permissions to view portfolio</p>
                  </div>
                )}
                <Footer />
              </>
            }
          />

          {/* Admin Dashboard Route */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
