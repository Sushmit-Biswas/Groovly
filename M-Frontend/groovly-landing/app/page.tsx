"use client";

import Link from "next/link";
import { CD } from "@/components/CD";
import { StarField } from "@/components/StarField";
import { useEffect, useState } from "react";

const cdData = [
  { src: "/assets/cd1.jpg", alt: "Groovify your night" },
  { src: "/assets/cd2.jpg", alt: "Dance with your F.R.I.E.N.D.S" },
  { src: "/assets/cd3.png", alt: "Trip Mode" },
  { src: "/assets/cd4.jpeg", alt: "Party Vibes" },
  { src: "/assets/cd1.jpg", alt: "Music Vibes" },
];

export default function Page() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar when scrolled past 600px
      setShowNavbar(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_bottom,#1B2735_0%,#090A0F_100%)]">
      {/* Parallax Star Field Background */}
      <StarField />

      {/* Floating Navbar - Appears on Scroll */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur-xl transition-all duration-500 ${
          showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo with Name */}
          <Link href="/" className="group flex items-center gap-3">
            <img
              src="/assets/logo_with_name.png"
              alt="Groovly"
              className="h-10 transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:bg-white/10"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <header className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 pt-24 md:px-10 lg:px-16">
          <div className="flex flex-col items-center gap-10 text-center relative">
            {/* Animated decorations around banner - matching image aesthetic */}

            {/* Top Left - Purple Star */}
            <div className="absolute left-[8%] top-[5%] animate-[float_6s_ease-in-out_infinite]">
              <svg
                className="h-14 w-14 text-purple-500/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            {/* Top Right - Orange Star */}
            <div className="absolute right-[12%] top-[8%] animate-[float_7s_ease-in-out_infinite_1s]">
              <svg
                className="h-12 w-12 text-orange-400/50"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            {/* Top Right Corner - Purple Star */}
            <div className="absolute right-[5%] top-[15%] animate-[float_5s_ease-in-out_infinite_2s]">
              <svg
                className="h-10 w-10 text-purple-400/45"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            {/* Left Side - Music Note (Orange) */}
            <div className="absolute left-[4%] bottom-[25%] animate-[float_8s_ease-in-out_infinite_0.5s]">
              <svg
                className="h-16 w-16 text-orange-500/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>

            {/* Right Side - Music Note (Pink) */}
            <div className="absolute right-[6%] bottom-[20%] animate-[float_6.5s_ease-in-out_infinite_1.5s]">
              <svg
                className="h-14 w-14 text-pink-500/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>

            {/* Bottom Left - Music Note */}
            <div className="absolute left-[15%] bottom-[5%] animate-[float_7.5s_ease-in-out_infinite_1s]">
              <svg
                className="h-11 w-11 text-purple-400/35"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>

            {/* Translucent Twinkle Circles - Inside banner area for subtle effect */}
            <div className="absolute left-[20%] top-[30%] h-20 w-20 rounded-full bg-purple-400/10 animate-[twinkle_4s_ease-in-out_infinite]" />
            <div className="absolute right-[25%] top-[40%] h-16 w-16 rounded-full bg-pink-400/8 animate-[twinkle_5s_ease-in-out_infinite_1s]" />
            <div className="absolute left-[30%] bottom-[25%] h-24 w-24 rounded-full bg-orange-400/12 animate-[twinkle_6s_ease-in-out_infinite_2s]" />
            <div className="absolute right-[20%] bottom-[35%] h-14 w-14 rounded-full bg-purple-500/10 animate-[twinkle_4.5s_ease-in-out_infinite_1.5s]" />
            <div className="absolute left-[35%] top-[50%] h-18 w-18 rounded-full bg-pink-500/9 animate-[twinkle_5.5s_ease-in-out_infinite_0.5s]" />

            {/* Main heading - Banner Image - LARGER */}
            <div className="w-full max-w-6xl px-4 animate-[fadeInUp_1.2s_ease-out] relative z-10">
              <img
                src="/assets/web-banner-no-bg.png"
                alt="Groovly is the new standard for collaboration"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Scattered CD Layout - Edge-to-Edge */}
          <section
            className="relative w-screen -mx-6 md:-mx-10 lg:-mx-16"
            id="features"
          >
            {/* CD 1 - Stuck to Left Edge Top - Higher position with float animation */}
            <div className="fixed left-0 top-[100px] z-20 opacity-0 translate-y-12 transition-all duration-1000 ease-out [animation:fadeInUp_0.8s_ease-out_0.1s_forwards] animate-[floatSlow_8s_ease-in-out_infinite]">
              <CD src={cdData[0].src} side="left" alt={cdData[0].alt} />
            </div>

            {/* CD 2 - Stuck to Right Edge Top - Lower position with float animation */}
            <div className="fixed right-0 top-[200px] z-20 opacity-0 translate-y-12 transition-all duration-1000 ease-out [animation:fadeInUp_0.8s_ease-out_0.3s_forwards] animate-[floatSlow_9s_ease-in-out_infinite_1s]">
              <CD src={cdData[1].src} side="right" alt={cdData[1].alt} />
            </div>

            {/* CD 4 - Stuck to Left Edge Lower with float animation */}
            <div className="fixed left-0 top-[480px] z-20 opacity-0 translate-y-12 transition-all duration-1000 ease-out [animation:fadeInUp_0.8s_ease-out_0.9s_forwards] animate-[floatSlow_10s_ease-in-out_infinite_2s]">
              <CD src={cdData[3].src} side="left" alt={cdData[3].alt} />
            </div>

            {/* CD 5 - Stuck to Right Edge Lower with float animation */}
            <div className="fixed right-0 top-[580px] z-20 opacity-0 translate-y-12 transition-all duration-1000 ease-out [animation:fadeInUp_0.8s_ease-out_1.1s_forwards] animate-[floatSlow_11s_ease-in-out_infinite_1.5s]">
              <CD src="/assets/cd3.png" side="right" alt={cdData[4].alt} />
            </div>

            {/* (Feature cards moved below) */}
          </section>
        </header>

        {/* Centered Feature Showcase Section (moved out of negative margin area) */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-16">
            <div className="text-center max-w-3xl">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-5">
                Your Party, Your Playlist
              </h2>
              <p className="text-lg md:text-xl text-gray-300">
                Every guest becomes a DJ. Vote, queue, and vibe together in
                real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Card 1 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:scale-[1.03] hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    Collaborative Queue
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Add tracks together and build the perfect shared playlist.
                  </p>
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30" />
              </div>

              {/* Card 2 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:scale-[1.03] hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-700 shadow-lg shadow-pink-500/50 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    Democratic Voting
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Upvote favorites. The crowd decides what plays next.
                  </p>
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30" />
              </div>

              {/* Card 3 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:scale-[1.03] hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    Real-Time Sync
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Instant updates. See votes and changes as they happen.
                  </p>
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30" />
              </div>
            </div>
          </div>
        </section>

        {/* Animated Arrow CTA Buttons */}
        <section className="relative mx-auto mt-16 mb-20 max-w-5xl px-6">
          <div className="flex flex-col items-center justify-center gap-14">
            <h2 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Ready to Get Grooving?
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
              {/* Login Button with Arrow Animation */}
              <Link
                href="/auth/login"
                className="cta-button group"
                style={{
                  display: "flex",
                  padding: "16px 50px",
                  textDecoration: "none",
                  fontSize: "32px",
                  color: "white",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  transition: "box-shadow 0.3s, transform 0.1s",
                  boxShadow: "6px 6px 0 rgba(0,0,0,0.3)",
                  transform: "skewX(-15deg)",
                  border: "none",
                  fontWeight: "900",
                  fontFamily: "Poppins, sans-serif",
                  letterSpacing: "1px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    transform: "skewX(15deg)",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  LOGIN
                </span>
                <span
                  className="arrow-container"
                  style={{
                    transform: "skewX(15deg)",
                    width: "20px",
                    marginLeft: "30px",
                    position: "relative",
                    top: "12%",
                    transition: "0.5s",
                    zIndex: 10,
                  }}
                >
                  <svg
                    width="66px"
                    height="43px"
                    viewBox="0 0 66 43"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <path
                        className="arrow-path-one"
                        d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{
                          transition: "0.4s",
                          transform: "translateX(-60%)",
                        }}
                      />
                      <path
                        className="arrow-path-two"
                        d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{
                          transition: "0.5s",
                          transform: "translateX(-30%)",
                        }}
                      />
                      <path
                        className="arrow-path-three"
                        d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{ transition: "0.6s" }}
                      />
                    </g>
                  </svg>
                </span>
              </Link>

              {/* Sign Up Button with Arrow Animation */}
              <Link
                href="/auth/register"
                className="cta-button group"
                style={{
                  display: "flex",
                  padding: "16px 50px",
                  textDecoration: "none",
                  fontSize: "32px",
                  color: "white",
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  transition: "box-shadow 0.3s, transform 0.1s",
                  boxShadow: "6px 6px 0 rgba(0,0,0,0.3)",
                  transform: "skewX(-15deg)",
                  border: "none",
                  fontWeight: "900",
                  fontFamily: "Poppins, sans-serif",
                  letterSpacing: "1px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    transform: "skewX(15deg)",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  SIGN UP
                </span>
                <span
                  className="arrow-container"
                  style={{
                    transform: "skewX(15deg)",
                    width: "20px",
                    marginLeft: "30px",
                    position: "relative",
                    top: "12%",
                    transition: "0.5s",
                    zIndex: 10,
                  }}
                >
                  <svg
                    width="66px"
                    height="43px"
                    viewBox="0 0 66 43"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <path
                        className="arrow-path-one"
                        d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{
                          transition: "0.4s",
                          transform: "translateX(-60%)",
                        }}
                      />
                      <path
                        className="arrow-path-two"
                        d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{
                          transition: "0.5s",
                          transform: "translateX(-30%)",
                        }}
                      />
                      <path
                        className="arrow-path-three"
                        d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z"
                        fill="#FFFFFF"
                        style={{ transition: "0.6s" }}
                      />
                    </g>
                  </svg>
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stunning Footer - Full Width Edge-to-Edge */}
        <footer className="relative mt-32 w-full border-t border-white/5 bg-gradient-to-b from-transparent via-black/40 to-black/80 backdrop-blur-xl">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="mx-auto max-w-screen-2xl px-6 py-16 lg:px-12">
            <div className="grid gap-12 md:grid-cols-3">
              {/* Brand Section */}
              <div className="space-y-4">
                <Link href="/" className="group inline-block">
                  <img
                    src="/assets/logo_with_name.png"
                    alt="Groovly"
                    className="h-16 transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  />
                </Link>
                <p className="max-w-xs text-sm leading-relaxed text-muted">
                  Transform any gathering into an unforgettable collaborative
                  concert. Your music, your votes, your vibe.
                </p>

                {/* Social Links */}
                <div className="flex gap-3 pt-2">
                  <a
                    href="#"
                    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:bg-purple-500/10"
                  >
                    <svg
                      className="h-5 w-5 text-muted transition-colors group-hover:text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-pink-400/30 hover:bg-pink-500/10"
                  >
                    <svg
                      className="h-5 w-5 text-muted transition-colors group-hover:text-pink-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/10"
                  >
                    <svg
                      className="h-5 w-5 text-muted transition-colors group-hover:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/auth/register"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Get Started
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#what-is-groovly"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  Get in Touch
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="mailto:hello@groovly.com"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      hello@groovly.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Support
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-purple-400"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 border-t border-white/5 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted/60">
                  © {new Date().getFullYear()} Groovly. Crafted for
                  unforgettable gatherings.
                </p>
                <div className="flex items-center gap-6 text-sm text-muted/60">
                  <span className="flex items-center gap-2">
                    Made with
                    <svg
                      className="h-4 w-4 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    by music lovers
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative gradient at bottom */}
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </footer>
      </div>
    </main>
  );
}
