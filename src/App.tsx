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
      <div className="min-h-screen bg-gray-900 text-white relative">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Show Portfolio fullscreen until permissions granted */}
                {!hasPermissions && (
                  <div className="absolute inset-0 z-50 bg-black">
                    <Portfolio onPermissionsGranted={() => setHasPermissions(true)} />
                  </div>
                )}

                {hasPermissions && (
                  <>
                    <Navigation />
                    <main>
                      <Hero />
                      <About />
                      <Projects />
                      <Skills />
                      <Contact />
                    </main>
                    <Footer />
                  </>
                )}
              </>
            }
          />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
