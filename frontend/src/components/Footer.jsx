import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GlobeAltIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BookOpenIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Footer = ({
  isAuthenticated,
  admin,
  handleAdminLogout,
  setShowLoginModal,
}) => {
  return (
    <footer className="mt-32 relative overflow-hidden border-t border-slate-800">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900/90 pointer-events-none" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-purple-500/10 rounded-full filter blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <GlobeAltIcon className="h-8 w-8 text-sky-400 group-hover:text-sky-300 transition-colors" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-400">
                TranslaterHUB
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Breaking language barriers with cutting-edge translation
              technology. Making global communication seamless and accessible
              for everyone.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              {["twitter", "facebook", "linkedin", "github"].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-sky-400 transition-all duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d={
                        social === "twitter"
                          ? "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                          : social === "facebook"
                          ? "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          : social === "linkedin"
                          ? "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                          : "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                      }
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Tools Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-sky-400" />
              <span>Tools</span>
            </h3>
            <ul className="space-y-4">
              {[
                { text: "Translator", icon: GlobeAltIcon, to: "/" },
                {
                  text: "Text to Speech",
                  icon: SpeakerWaveIcon,
                  to: "/text-to-speech",
                },
                {
                  text: "Speech to Text",
                  icon: MicrophoneIcon,
                  to: "/speech-to-text",
                },
                {
                  text: "Keyword Abstractor",
                  icon: DocumentTextIcon,
                  to: "/keyword-abstractor",
                },
                {
                  text: "English Quiz",
                  icon: AcademicCapIcon,
                  to: "/english-quiz",
                },
                { text: "Synonyms", icon: ArrowPathIcon, to: "/synonyms" },
                { text: "Antonyms", icon: ArrowPathIcon, to: "/antonyms" },
              ].map((link) => (
                <li key={link.text}>
                  <Link
                    to={link.to}
                    className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                  >
                    <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{link.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <BookOpenIcon className="w-5 h-5 text-sky-400" />
              <span>Resources</span>
            </h3>
            <ul className="space-y-4">
              {[
                { text: "Documentation", icon: DocumentTextIcon },
                { text: "API Reference", icon: BookOpenIcon },
                { text: "Community", icon: UserGroupIcon },
                { text: "Support", icon: HeartIcon },
              ].map((resource) => (
                <li key={resource.text}>
                  <a
                    href="#"
                    className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                  >
                    <resource.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{resource.text}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Admin Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <AcademicCapIcon className="w-5 h-5 text-sky-400" />
                <span>Admin</span>
              </h3>
              <ul className="space-y-4">
                {!isAuthenticated ? (
                  <li>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                    >
                      <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Admin Login</span>
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                      >
                        <BookOpenIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleAdminLogout}
                        className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                      >
                        <ArrowPathIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout ({admin?.name || "Admin"})</span>
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <PhoneIcon className="w-5 h-5 text-sky-400" />
              <span>Contact Us</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                >
                  <PhoneIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>+1 (234) 567-890</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@translaterhub.com"
                  className="flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors group"
                >
                  <EnvelopeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>info@translaterhub.com</span>
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-1" />
                <span>123 Translation Street, Language City, LC 12345</span>
              </li>
            </ul>

            {/* Newsletter Subscription */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-white mb-4">
                Subscribe to Newsletter
              </h4>
              <div className="relative group mt-2">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-white"
                  />
                  <button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-r-lg hover:from-sky-600 hover:to-blue-700 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400 text-sm"
            >
              © {new Date().getFullYear()} TranslaterHUB. All rights reserved.
            </motion.p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
