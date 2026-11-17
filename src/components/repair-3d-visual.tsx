"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Wrench,
  Cpu,
  Flame,
  CheckCircle2,
  Activity,
  Zap,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

type RepairMode = "diagnosa" | "perbaikan" | "pengujian";

export function Repair3DVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(12);
  const [rotateY, setRotateY] = useState(-14);
  const [activeMode, setActiveMode] = useState<RepairMode>("perbaikan");
  const [scanProgress, setScanProgress] = useState(88);

  // Auto scan counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 98 ? 85 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // 3D Parallax Tilt with Mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12 + 10;
    const rY = ((x - centerX) / centerX) * 16 - 12;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(12);
    setRotateY(-14);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="repair-3d-stage"
      style={{
        position: "relative",
        perspective: "1200px",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(6px) rotate(1deg); }
        }
        @keyframes laserBeam {
          0% { top: 15%; opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #00f0ff); }
          100% { top: 85%; opacity: 0.3; }
        }
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.03); }
        }
        @keyframes circuitPulse {
          0% { stroke-dashoffset: 100; opacity: 0.2; }
          50% { opacity: 1; stroke: #38bdf8; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        @keyframes toolHover {
          0%, 100% { transform: translateY(0) rotate(25deg); }
          50% { transform: translateY(-10px) rotate(32deg); }
        }
        @keyframes sparkTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* Ambient Radial Backlight */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "70%",
          height: "70%",
          background: "radial-gradient(circle, rgba(2, 132, 199, 0.28) 0%, rgba(6, 182, 212, 0.15) 45%, transparent 75%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 1,
          animation: "pulseGlow 6s ease-in-out infinite",
        }}
      />

      {/* Main Glassmorphism Frame Container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderRadius: "1.75rem",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.25), 0 0 40px rgba(2, 132, 199, 0.15)",
          padding: "1.5rem",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#f8fafc",
          overflow: "hidden",
        }}
      >
        {/* Top Header: System Telemetry Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", borderBottom: "1px solid rgba(51, 65, 85, 0.7)", paddingBottom: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)",
              }}
            >
              <Cpu style={{ width: "1.25rem", height: "1.25rem", color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Live Bench Telemetry
                </span>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "var(--font-mono, monospace)" }}>
                Unit: Asus ROG Strix G15 (Workstation-01)
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(2, 132, 199, 0.18)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "#38bdf8",
              fontSize: "0.6875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Activity style={{ width: "0.875rem", height: "0.875rem", animation: "pulseGlow 2s infinite" }} />
            <span>Sedang Dikerjakan</span>
          </div>
        </div>

        {/* 3D Scene Wrapper with Dynamic Perspective Tilt */}
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: "transform 0.15s ease-out",
            position: "relative",
            minHeight: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem 0",
          }}
        >
          {/* Floating Laser Scanning Grid Effect */}
          <div
            style={{
              position: "absolute",
              width: "85%",
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, #00f0ff 50%, transparent 100%)",
              zIndex: 10,
              pointerEvents: "none",
              animation: "laserBeam 3.5s ease-in-out infinite",
              boxShadow: "0 0 15px #00f0ff, 0 0 30px #0284c7",
            }}
          />

          {/* Floating Hologram Tool (Precision Screwdriver / Repair Probe) */}
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "20px",
              zIndex: 15,
              animation: "toolHover 3s ease-in-out infinite",
              pointerEvents: "none",
              filter: "drop-shadow(0 0 12px rgba(56, 189, 248, 0.7))",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.85)",
                border: "1.5px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
              }}
            >
              <Wrench style={{ width: "1.35rem", height: "1.35rem" }} />
            </div>
            {/* Energy Sparkle */}
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#38bdf8",
                boxShadow: "0 0 10px #38bdf8",
                animation: "sparkTwinkle 1.5s infinite",
              }}
            />
          </div>

          {/* THE 3D LAPTOP BODY */}
          <div
            style={{
              width: "320px",
              transformStyle: "preserve-3d",
              position: "relative",
            }}
          >
            {/* LAPTOP SCREEN (LID) - Angled up at ~105 degrees */}
            <div
              style={{
                width: "300px",
                height: "175px",
                margin: "0 auto",
                borderRadius: "12px 12px 4px 4px",
                background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)",
                border: "2px solid #334155",
                boxShadow: "0 0 30px rgba(2, 132, 199, 0.25), inset 0 0 15px rgba(0,0,0,0.8)",
                padding: "8px",
                transform: "rotateX(-22deg) translateZ(10px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Webcam Dot */}
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "#0284c7",
                  boxShadow: "0 0 6px #06b6d4",
                  margin: "0 auto 6px",
                }}
              />

              {/* Inside Screen: Holographic Diagnostic Console */}
              <div
                style={{
                  width: "100%",
                  height: "145px",
                  borderRadius: "8px",
                  background: "radial-gradient(circle at 50% 40%, #082f49 0%, #030712 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  padding: "8px 10px",
                  position: "relative",
                  overflow: "hidden",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {/* Radar Grid Graphic */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "12px",
                    width: "54px",
                    height: "54px",
                    borderRadius: "50%",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "conic-gradient(from 0deg, rgba(6, 182, 212, 0.4) 0deg, transparent 90deg, transparent 360deg)",
                      animation: "radarSpin 3s linear infinite",
                    }}
                  />
                  <div style={{ position: "absolute", width: "30px", height: "30px", borderRadius: "50%", border: "1px dashed rgba(56, 189, 248, 0.4)" }} />
                  <div style={{ position: "absolute", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                </div>

                {/* HUD Live Text Telemetry */}
                <div style={{ position: "relative", zIndex: 5, fontSize: "0.6875rem", lineHeight: 1.4 }}>
                  <div style={{ color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "4px" }}>
                    <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
                    <span>DIAGNOSTIC CORE v2.5</span>
                  </div>

                  <div style={{ color: "#e2e8f0", fontSize: "0.625rem", opacity: 0.9 }}>
                    <div>CPU Temp: <span style={{ color: "#22c55e", fontWeight: 700 }}>41.8°C (OPTIMAL)</span></div>
                    <div>Thermal Paste: <span style={{ color: "#38bdf8" }}>Arctic MX-4 Applied</span></div>
                    <div>Cooling Fan: <span style={{ color: "#facc15" }}>3,240 RPM [OK]</span></div>
                    <div>Motherboard VRM: <span style={{ color: "#22c55e" }}>Stable (0.95V)</span></div>
                  </div>

                  {/* Progress Bar in Screen */}
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5625rem", color: "#94a3b8", marginBottom: "2px" }}>
                      <span>System Health Score</span>
                      <span style={{ color: "#38bdf8", fontWeight: 700 }}>{scanProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", borderRadius: "9999px", backgroundColor: "rgba(51, 65, 85, 0.8)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${scanProgress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #0284c7 0%, #22c55e 100%)",
                          boxShadow: "0 0 8px #22c55e",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LAPTOP KEYBOARD / MOTHERBOARD DECK (BASE) */}
            <div
              style={{
                width: "320px",
                height: "140px",
                borderRadius: "4px 4px 16px 16px",
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 80%, #0f172a 100%)",
                border: "2px solid #334155",
                borderTop: "3px solid #475569",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(2, 132, 199, 0.2)",
                transform: "rotateX(58deg) translateZ(-15px) translateY(-25px)",
                padding: "8px 12px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Motherboard Circuit Lines (Glowing SVG) */}
              <svg
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.35, pointerEvents: "none" }}
                viewBox="0 0 320 140"
              >
                <path d="M 30,20 L 80,20 L 110,60 L 160,60" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" />
                <path d="M 290,20 L 240,20 L 210,60 L 160,60" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 3" />
                <path d="M 160,60 L 160,110 L 200,110" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                <circle cx="160" cy="60" r="4" fill="#38bdf8" />
                <circle cx="80" cy="20" r="3" fill="#06b6d4" />
                <circle cx="240" cy="20" r="3" fill="#06b6d4" />
              </svg>

              {/* Glowing CPU Chip & Heatpipe Block */}
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60px",
                  height: "50px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #1e293b 0%, #090d16 100%)",
                  border: "1.5px solid #38bdf8",
                  boxShadow: "0 0 15px rgba(56, 189, 248, 0.5), inset 0 0 8px rgba(6, 182, 212, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                }}
              >
                <Cpu style={{ width: "1.25rem", height: "1.25rem", color: "#38bdf8" }} />
                <span style={{ fontSize: "0.5rem", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  RYZEN 7
                </span>
                {/* Copper Heatpipe Lines */}
                <div style={{ position: "absolute", top: "50%", left: "-28px", width: "28px", height: "4px", backgroundColor: "#b45309", borderRadius: "2px", boxShadow: "0 0 4px #d97706" }} />
                <div style={{ position: "absolute", top: "50%", right: "-28px", width: "28px", height: "4px", backgroundColor: "#b45309", borderRadius: "2px", boxShadow: "0 0 4px #d97706" }} />
              </div>

              {/* Stylized Backlit Keyboard Keys */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120px",
                  height: "35px",
                  borderRadius: "6px",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  background: "rgba(15, 23, 42, 0.6)",
                  boxShadow: "inset 0 0 10px rgba(56, 189, 248, 0.15)",
                }}
              />
            </div>
          </div>

          {/* Floating 3D Badge 1: Thermal System (Left) */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "-10px",
              zIndex: 20,
              padding: "0.45rem 0.75rem",
              borderRadius: "0.75rem",
              background: "rgba(15, 23, 42, 0.88)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(34, 197, 94, 0.2)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              animation: "floatSlow 4s ease-in-out infinite",
            }}
          >
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame style={{ width: "0.875rem", height: "0.875rem", color: "#22c55e" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffffff", display: "block" }}>
                Thermal Cleaned
              </span>
              <span style={{ fontSize: "0.5625rem", color: "#86efac" }}>Pasta Kering Terganti</span>
            </div>
          </div>

          {/* Floating 3D Badge 2: Quality Inspection (Right) */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "-8px",
              zIndex: 20,
              padding: "0.45rem 0.75rem",
              borderRadius: "0.75rem",
              background: "rgba(15, 23, 42, 0.88)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(56, 189, 248, 0.2)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              animation: "floatReverse 4.5s ease-in-out infinite",
            }}
          >
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "rgba(2, 132, 199, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "#38bdf8" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffffff", display: "block" }}>
                100% QC Passed
              </span>
              <span style={{ fontSize: "0.5625rem", color: "#7dd3fc" }}>Garansi Servis Resmi</span>
            </div>
          </div>
        </div>

        {/* Interactive Mode Pills */}
        <div style={{ marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(51, 65, 85, 0.7)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <button
              type="button"
              onClick={() => setActiveMode("diagnosa")}
              style={{
                padding: "0.45rem 0.5rem",
                borderRadius: "0.625rem",
                border: activeMode === "diagnosa" ? "1px solid #38bdf8" : "1px solid rgba(51, 65, 85, 0.6)",
                backgroundColor: activeMode === "diagnosa" ? "rgba(2, 132, 199, 0.25)" : "rgba(15, 23, 42, 0.5)",
                color: activeMode === "diagnosa" ? "#38bdf8" : "#94a3b8",
                fontSize: "0.6875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              1. Diagnosa
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("perbaikan")}
              style={{
                padding: "0.45rem 0.5rem",
                borderRadius: "0.625rem",
                border: activeMode === "perbaikan" ? "1px solid #38bdf8" : "1px solid rgba(51, 65, 85, 0.6)",
                backgroundColor: activeMode === "perbaikan" ? "rgba(2, 132, 199, 0.25)" : "rgba(15, 23, 42, 0.5)",
                color: activeMode === "perbaikan" ? "#38bdf8" : "#94a3b8",
                fontSize: "0.6875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              2. Perbaikan
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("pengujian")}
              style={{
                padding: "0.45rem 0.5rem",
                borderRadius: "0.625rem",
                border: activeMode === "pengujian" ? "1px solid #38bdf8" : "1px solid rgba(51, 65, 85, 0.6)",
                backgroundColor: activeMode === "pengujian" ? "rgba(2, 132, 199, 0.25)" : "rgba(15, 23, 42, 0.5)",
                color: activeMode === "pengujian" ? "#38bdf8" : "#94a3b8",
                fontSize: "0.6875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              3. Pengujian
            </button>
          </div>

          {/* Quick Tracking CTA button */}
          <Link
            href="/lacak"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              padding: "0.625rem 1rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            <Search style={{ width: "0.875rem", height: "0.875rem" }} />
            <span>Lacak Status Laptop Anda Secara Real-Time</span>
            <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
