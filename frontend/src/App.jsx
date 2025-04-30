import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useUserStore } from "./stores/userStore";
import Translator from "./components/Translator";
import Header from "./components/Header";
import Features from "./components/Features";
import Stats from "./components/Stats";
import TextToSpeech from "./components/TextToSpeech";
import SpeechToText from "./components/SpeechToText";
import KeywordAbstractor from "./components/KeywordAbstractor";
import EnglishQuiz from "./components/EnglishQuiz";
import PageTransition from "./components/PageTransition";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import QuizManagement from "./components/admin/QuizManagement";
import CreateQuiz from "./components/admin/CreateQuiz";
import EditQuiz from "./components/admin/EditQuiz";
import LoginModal from "./components/admin/LoginModal";
import { useState } from "react";
import { useAdminStore } from "./stores/adminStore";
import { QuizProvider } from "./contexts/QuizContext.jsx"; // Make sure to import with .jsx extension
import { Toaster } from "react-hot-toast";
import Synonyms from "./components/synonyms";
import Antonyms from "./components/antonyms";
import AdminAntonyms from "./components/admin/AdminAntonyms.jsx";
import AdminSynonyms from "./components/admin/AdminSynonyms";
import Footer from "./components/Footer"; // Import the new Footer component

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, admin } = useAdminStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
  }));

  // Check if authenticated and has admin role
  if (!isAuthenticated || (admin && admin.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, admin, logout } = useAdminStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
    logout: state.logout,
  }));
  const initAuth = useUserStore((state) => state.initAuth);

  useEffect(() => {
    // Initialize Firebase auth listener
    const unsubscribe = initAuth();
    return () => unsubscribe(); // Cleanup on unmount
  }, [initAuth]);

  const handleAdminLogout = () => {
    logout();
    // Optionally, redirect to home page after logout
    if (location.pathname.startsWith("/admin")) {
      navigate("/");
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <>
                  <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 mb-4 animate-text floating">
                      Translate Anything, Anywhere
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto animate-fade-in-down">
                      Break language barriers with our powerful translation
                      tool. Fast, accurate, and easy to use.
                    </p>
                  </div>
                  <div className="mt-16">
                    <Translator />
                  </div>
                  <div className="mt-24">
                    <Stats />
                  </div>
                  <div className="mt-24">
                    <Features />
                  </div>
                </>
              </PageTransition>
            }
          />
          <Route
            path="/text-to-speech"
            element={
              <PageTransition>
                <TextToSpeech />
              </PageTransition>
            }
          />
          <Route
            path="/speech-to-text"
            element={
              <PageTransition>
                <SpeechToText />
              </PageTransition>
            }
          />
          <Route
            path="/keyword-abstractor"
            element={
              <PageTransition>
                <KeywordAbstractor />
              </PageTransition>
            }
          />
          <Route
            path="/english-quiz"
            element={
              <PageTransition>
                <QuizProvider>
                  <EnglishQuiz />
                </QuizProvider>
              </PageTransition>
            }
          />
          <Route
            path="/synonyms"
            element={
              <PageTransition>
                <Synonyms />
              </PageTransition>
            }
          />
          <Route
            path="/antonyms"
            element={
              <PageTransition>
                <Antonyms />
              </PageTransition>
            }
          />

          {/* Admin Routes - Wrapped with QuizProvider */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <QuizProvider>
                  <AdminLayout />
                </QuizProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="quizzes/create" element={<CreateQuiz />} />
            <Route path="quizzes/edit/:id" element={<EditQuiz />} />
            <Route
              path="users"
              element={<div className="text-white">User Management</div>}
            />
            <Route
              path="analytics"
              element={<div className="text-white">Analytics</div>}
            />
            <Route
              path="settings"
              element={<div className="text-white">Settings</div>}
            />

            {/* Admin Synonyms and Antonyms */}
            <Route path="synonyms" element={<AdminSynonyms />} />
            <Route path="antonyms" element={<AdminAntonyms />} />
          </Route>
        </Routes>
      </AnimatePresence>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Using the new enhanced Footer component */}
      <Footer
        isAuthenticated={isAuthenticated}
        admin={admin}
        handleAdminLogout={handleAdminLogout}
        setShowLoginModal={setShowLoginModal}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#38bdf8",
              secondary: "#1e293b",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#1e293b",
            },
          },
        }}
      />
    </>
  );
}

function App() {
  useEffect(() => {
    // Create animated background elements
    const createBackgroundElement = () => {
      const element = document.createElement("div");
      element.className = "animated-bg-element";

      // Randomize properties
      const size = Math.random() * 150 + 100; // Larger size range
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const duration = Math.random() * 20 + 15; // Longer duration
      const delay = Math.random() * 5;
      const rotation = Math.random() * 360;
      const scale = Math.random() * 0.5 + 0.8;

      // Random gradient colors
      const colors = [
        ["rgba(56, 189, 248, 0.1)", "rgba(129, 140, 248, 0.1)"], // Blue to Purple
        ["rgba(236, 72, 153, 0.1)", "rgba(167, 139, 250, 0.1)"], // Pink to Purple
        ["rgba(34, 211, 238, 0.1)", "rgba(56, 189, 248, 0.1)"], // Cyan to Blue
        ["rgba(167, 139, 250, 0.1)", "rgba(236, 72, 153, 0.1)"], // Purple to Pink
      ];
      const [color1, color2] =
        colors[Math.floor(Math.random() * colors.length)];

      element.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: linear-gradient(${rotation}deg, ${color1}, ${color2});
        border-radius: 50%;
        filter: blur(${size * 0.2}px);
        animation: float ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        transform: scale(${scale});
        pointer-events: none;
        z-index: -1;
        mix-blend-mode: screen;
      `;

      document.body.appendChild(element);

      // Create a companion element for additional visual effect
      const companionElement = document.createElement("div");
      companionElement.className = "animated-bg-element companion";
      companionElement.style.cssText = `
        position: fixed;
        width: ${size * 0.8}px;
        height: ${size * 0.8}px;
        left: ${x + size * 0.1}px;
        top: ${y + size * 0.1}px;
        background: radial-gradient(circle at center, ${color2}, transparent);
        border-radius: 50%;
        filter: blur(${size * 0.15}px);
        animation: floatCompanion ${duration * 0.8}s ease-in-out infinite;
        animation-delay: ${delay + 0.5}s;
        transform: scale(${scale * 0.8});
        pointer-events: none;
        z-index: -1;
        mix-blend-mode: screen;
      `;

      document.body.appendChild(companionElement);

      // Remove elements after animation
      setTimeout(() => {
        element.remove();
        companionElement.remove();
      }, duration * 1000);
    };

    // Create initial elements
    for (let i = 0; i < 20; i++) {
      createBackgroundElement();
    }

    // Create new elements periodically with varying intervals
    let interval = 2000;
    const createElementWithDynamicInterval = () => {
      createBackgroundElement();
      interval = Math.random() * 2000 + 1000; // Random interval between 1-3 seconds
      setTimeout(createElementWithDynamicInterval, interval);
    };

    const timer = setTimeout(createElementWithDynamicInterval, interval);

    return () => {
      clearTimeout(timer);
      // Clean up existing elements
      document
        .querySelectorAll(".animated-bg-element")
        .forEach((el) => el.remove());
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen animate-gradient-xy">
        <Header />
        <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatedRoutes />
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
