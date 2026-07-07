"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./launch-splash.css";

const SPLASH_KEY = "site-splash-seen";
const DRAW_MS = 2800;
const HOLD_MS = 400;
const FLY_MS = 520;
const ACCENT = "#821019";

/** Heart + center QRS share this viewBox point. */
const VB_CENTER_X = 500;
const VB_BASELINE_Y = 50;

/** R-peak x positions: left of heart, center, right of heart. */
const SPIKE_X = [400, 500, 600] as const;

type Phase = "check" | "playing" | "climax" | "done";

/** Left → right only. Starts x=260, ends x=740 after the right spike. */
const EKG_PATH =
  `M 260 ${VB_BASELINE_Y}` +
  " H 368" +
  " L 374 52 L 378 48 L 382 54" +
  " L 400 4 L 404 90 L 408 52" +
  " L 414 48 L 420 50" +
  " H 468" +
  " L 474 52 L 478 48 L 482 54" +
  " L 500 4 L 504 90 L 508 52" +
  " L 514 48 L 520 50" +
  " H 568" +
  " L 574 52 L 578 48 L 582 54" +
  " L 600 4 L 604 90 L 608 52" +
  " L 614 48 L 620 50" +
  " H 740";

function arcLenAtRPeak(path: SVGPathElement, total: number, spikeX: number) {
  let bestLen = 0;
  let bestY = Infinity;

  for (let i = 0; i <= 400; i++) {
    const len = (i / 400) * total;
    const pt = path.getPointAtLength(len);
    if (Math.abs(pt.x - spikeX) > 14) continue;
    if (pt.y < bestY) {
      bestY = pt.y;
      bestLen = len;
    }
  }

  return bestLen;
}

function buildHeartKeyframes(spikePercents: number[]) {
  const base = "translate(-50%, -58%)";
  const [p1, p2, p3] = spikePercents;

  const pulse = (p: number, peak: number) => [
    { offset: Math.max(0, p - 0.04), transform: `${base} scale(0.94)`, opacity: 0.82 },
    { offset: p, transform: `${base} scale(${peak})`, opacity: 1 },
    { offset: Math.min(1, p + 0.05), transform: `${base} scale(0.96)`, opacity: 0.92 },
  ];

  return [
    { offset: 0, transform: `${base} scale(0.88)`, opacity: 0.45 },
    { offset: 0.05, transform: `${base} scale(0.9)`, opacity: 0.62 },
    ...pulse(p1, 1.28),
    ...pulse(p2, 1.34),
    ...pulse(p3, 1.38),
    { offset: 1, transform: `${base} scale(1)`, opacity: 1 },
  ];
}

export function LaunchSplash() {
  const [phase, setPhase] = useState<Phase>("check");

  const overlayRef = useRef<HTMLDivElement>(null);
  const ekgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const finishingRef = useRef(false);
  const flyingRef = useRef(false);
  const holdTimerRef = useRef(0);
  const finishTimerRef = useRef(0);
  const drawAnimRef = useRef<Animation | null>(null);
  const heartAnimRef = useRef<Animation | null>(null);

  const alignHeartToEkgCenter = useCallback(() => {
    const svg = ekgRef.current;
    const heart = heartRef.current;
    if (!svg || !heart) return;

    const pt = svg.createSVGPoint();
    pt.x = VB_CENTER_X;
    pt.y = VB_BASELINE_Y;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const { x, y } = pt.matrixTransform(ctm);
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
  }, []);

  const beginClimax = useCallback(() => {
    if (finishingRef.current || flyingRef.current) return;
    overlayRef.current?.classList.add("launch-splash--climax");
    setPhase("climax");
  }, []);

  const startAnimations = useCallback(() => {
    const path = pathRef.current;
    const heart = heartRef.current;
    if (!path || !heart) return;

    drawAnimRef.current?.cancel();
    heartAnimRef.current?.cancel();
    window.clearTimeout(holdTimerRef.current);

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;

    drawAnimRef.current = path.animate(
      [{ strokeDashoffset: total }, { strokeDashoffset: 0 }],
      { duration: DRAW_MS, fill: "forwards", easing: "linear" },
    );

    const spikePercents = SPIKE_X.map((x) => arcLenAtRPeak(path, total, x) / total);
    heartAnimRef.current = heart.animate(buildHeartKeyframes(spikePercents), {
      duration: DRAW_MS,
      fill: "forwards",
      easing: "linear",
    });

    void drawAnimRef.current.finished
      .then(() => {
        holdTimerRef.current = window.setTimeout(beginClimax, HOLD_MS);
      })
      .catch(() => {
        // Cancelled animations reject with AbortError (expected on skip/unmount).
      });
  }, [beginClimax]);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    document.documentElement.classList.remove("splash-logo-hidden");
    window.clearTimeout(holdTimerRef.current);
    window.clearTimeout(finishTimerRef.current);
    drawAnimRef.current?.cancel();
    heartAnimRef.current?.cancel();
    sessionStorage.setItem(SPLASH_KEY, "1");
    document.body.style.overflow = "";
    setPhase("done");
  }, []);

  const flyHeartToLogo = useCallback(() => {
    if (flyingRef.current) return;
    flyingRef.current = true;

    const heart = heartRef.current;
    const overlay = overlayRef.current;
    const logo = document.getElementById("site-home-logo");
    if (!heart || !overlay || !logo) {
      finish();
      return;
    }

    document.documentElement.classList.add("splash-logo-hidden");
    alignHeartToEkgCenter();
    heartAnimRef.current?.cancel();
    heart.style.opacity = "1";

    const hr = heart.getBoundingClientRect();
    const lr = logo.getBoundingClientRect();
    const dx = lr.left + lr.width / 2 - (hr.left + hr.width / 2);
    const dy = lr.top + lr.height / 2 - (hr.top + hr.height / 2);
    const scale = lr.width / hr.width;

    // Scale down early so it "molds" into the header heart on overlap.
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const settleAt = 0.62;

    const fly = heart.animate(
      [
        { transform: "translate(-50%, -58%) scale(1)" },
        {
          offset: settleAt,
          transform: `translate(calc(-50% + ${dx * settleAt}px), calc(-58% + ${dy * settleAt}px)) scale(${scale})`,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-58% + ${dy}px)) scale(${scale})`,
        },
      ],
      { duration: FLY_MS, fill: "forwards", easing: ease },
    );

    void fly.finished
      .then(() => finish())
      .catch(() => {
        // Cancelled animation (skip/unmount).
      });
  }, [alignHeartToEkgCenter, finish]);

  const skipToClimax = useCallback(() => {
    if (finishingRef.current || phase === "climax") return;
    window.clearTimeout(holdTimerRef.current);
    drawAnimRef.current?.cancel();
    heartAnimRef.current?.cancel();
    beginClimax();
  }, [beginClimax, phase]);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setPhase("done");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setPhase("done");
      return;
    }

    setPhase("playing");
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(holdTimerRef.current);
      window.clearTimeout(finishTimerRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase === "check" || phase === "done") return;

    alignHeartToEkgCenter();
    startAnimations();

    window.addEventListener("resize", alignHeartToEkgCenter);
    return () => {
      window.removeEventListener("resize", alignHeartToEkgCenter);
      drawAnimRef.current?.cancel();
      heartAnimRef.current?.cancel();
      window.clearTimeout(holdTimerRef.current);
    };
  }, [phase, alignHeartToEkgCenter, startAnimations]);

  useEffect(() => {
    if (phase !== "climax") return;
    flyHeartToLogo();
  }, [phase, flyHeartToLogo]);

  if (phase === "done") return null;
  if (phase === "check") {
    return <div className="launch-splash launch-splash--loading" aria-hidden />;
  }

  return (
    <div
      ref={overlayRef}
      className="launch-splash"
      onPointerDown={skipToClimax}
      role="presentation"
      aria-hidden
    >
      <div className="launch-splash__backdrop" aria-hidden />
      <div className="launch-splash__stage">
        <svg
          ref={ekgRef}
          className="launch-splash__ekg"
          viewBox="250 0 500 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            ref={pathRef}
            className="launch-splash__ekg-path"
            d={EKG_PATH}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <svg
          ref={heartRef}
          className="launch-splash__heart"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            className="launch-splash__heart-path"
            fill={ACCENT}
            d="M12 20.5c-.2 0-.4-.1-.5-.2C6.1 15.9 2 12.4 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.9-4.1 7.4-9.5 11.8-.1.1-.3.2-.5.2z"
          />
        </svg>
      </div>
    </div>
  );
}
