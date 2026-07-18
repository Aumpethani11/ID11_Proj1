
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import {
  Navbar,
  Footer,
  Home,
  Detect,
  NotFound,
  Dashboard,
  Resources,
  SpeechToText,
  SignLingo,
} from "./components";
import SignUser from "./pages/SignUser";
import NormalUser from "./pages/NormalUser";
import RequireAuth from "./components/auth/RequireAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notifyMsg = (type, msg) => {
  if (type === "success") {
    const notify = () => toast.success(msg);
    notify();
  } else {
    const notify = () => toast.error(msg);
    notify();
  }
};

const Layout = ({ children }) => {
  return (
    <>
      <Navbar notifyMsg={notifyMsg} />
      {children}
      <Footer />
    </>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  // Loader hide after 2.5 sec
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Custom Cursor Logic
  useEffect(() => {
    const cursor = document.querySelector(".cursor");

    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const addHover = () => cursor.classList.add("hover");
    const removeHover = () => cursor.classList.remove("hover");

    const addRipple = () => {
      cursor.classList.add("ripple");
      setTimeout(() => cursor.classList.remove("ripple"), 600);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", addRipple);

    const links = document.querySelectorAll("a, button");
    links.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", addRipple);
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="loader-container">
          <div className="jumping-circles">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <div className="loader-text">Loading...</div>
        </div>
      ) : (
        <div className="App">
          <Routes>
            <Route
              exact
              path="/"
              element={
                <Layout notifyMsg={notifyMsg}>
                  <Home />
                </Layout>
              }
            />

            <Route
              exact
              path="/detect"
              element={
                <Layout>
                  <RequireAuth pageName="Detect">
                    <Detect />
                  </RequireAuth>
                </Layout>
              }
            />

        <Route
              exact
              path="/resources"
              element={
                <Layout>
                  <RequireAuth pageName="Resources">
                    <Resources />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route
              exact
              path="/speech-to-text"
              element={
                <Layout>
                  <RequireAuth pageName="Speech to Text">
                    <SpeechToText />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route
              exact
              path="/dashboard"
              element={
                <Layout>
                  <RequireAuth pageName="Dashboard">
                    <Dashboard />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route
              exact
              path="/signlingo"
              element={
                <Layout>
                  <RequireAuth pageName="SignLingo">
                    <SignLingo />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route
              exact
              path="/sign-user"
              element={
                <Layout>
                  <RequireAuth pageName="Sign Chat">
                    <SignUser />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route
              exact
              path="/normal-user"
              element={
                <Layout>
                  <RequireAuth pageName="Voice Chat">
                    <NormalUser />
                  </RequireAuth>
                </Layout>
              }
            />

            <Route exact path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-left"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
          />
        </div>
      )}

      {/* Custom Cursor */}
      <div className="cursor"></div>
    </>
  );
}

export default App;
