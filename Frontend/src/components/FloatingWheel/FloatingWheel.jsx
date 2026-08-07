import React, { useEffect, useRef } from "react";
import "./FloatingWheel.css";

const FloatingWheel = React.memo(function FloatingWheel() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Status tracking (no state to prevent any component re-renders)
    const isHovered = useRef(false);
    const chatOpenRef = useRef(false);
    const isInViewport = useRef(true);
    const isAnimating = useRef(false);

    // 3D Rotation angles
    const angleX = useRef(0);
    const angleY = useRef(0);
    
    // 3D Tilt parameters
    const tiltX = useRef(0);
    const tiltY = useRef(0);
    const targetTiltX = useRef(0);
    const targetTiltY = useRef(0);

    // Sphere radius & dispersion physics
    const radius = useRef(175);
    const targetRadius = useRef(175);
    const dispersion = useRef(1);

    // Initialize 3D points
    const pointsRef = useRef([]);

    useEffect(() => {
        // Generate points in spherical coordinate system once on mount
        const count = 1200;
        const pts = [];
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            pts.push({
                x0: Math.sin(phi) * Math.cos(theta),
                y0: Math.sin(phi) * Math.sin(theta),
                z0: Math.cos(phi)
            });
        }
        pointsRef.current = pts;
    }, []);

    // Listen to chatbot state changes to hide/show and pause rendering
    useEffect(() => {
        const handleChatState = (e) => {
            if (e.detail) {
                const open = !!e.detail.isOpen;
                chatOpenRef.current = open;
                
                // Direct DOM manipulation for maximum speed
                if (containerRef.current) {
                    containerRef.current.style.opacity = open ? "0" : "1";
                    containerRef.current.style.pointerEvents = open ? "none" : "auto";
                }

                if (open) {
                    isInViewport.current = false;
                } else {
                    // Check if Hero is currently in viewport
                    const hero = document.querySelector(".hero");
                    if (hero) {
                        const rect = hero.getBoundingClientRect();
                        isInViewport.current = rect.bottom > 0 && rect.top < window.innerHeight;
                        if (isInViewport.current) {
                            startAnimation();
                        }
                    }
                }
            }
        };
        window.addEventListener("chatbot-state", handleChatState);
        return () => window.removeEventListener("chatbot-state", handleChatState);
    }, []);

    // Setup Intersection Observer to pause rendering when scrolled out of Hero
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Only run rendering loop if sphere is in view AND chat is closed
                    isInViewport.current = entry.isIntersecting && !chatOpenRef.current;
                    if (isInViewport.current) {
                        startAnimation();
                    }
                });
            },
            { threshold: 0 } // trigger when even 1 pixel is in view
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Setup visibilitychange listener to pause when browser tab is inactive
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                isInViewport.current = false;
            } else if (!chatOpenRef.current) {
                const hero = document.querySelector(".hero");
                if (hero) {
                    const rect = hero.getBoundingClientRect();
                    isInViewport.current = rect.bottom > 0 && rect.top < window.innerHeight;
                    if (isInViewport.current) {
                        startAnimation();
                    }
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    // Start/Resume animation helper
    const startAnimation = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        requestAnimationFrame(renderLoop);
    };

    // Performance-optimized Render Loop
    const renderLoop = () => {
        // Stop calling frame if out of viewport
        if (!isInViewport.current) {
            isAnimating.current = false;
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            isAnimating.current = false;
            return;
        }

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // 1. Continuous Idle Rotation
        angleX.current += 0.003;
        angleY.current += 0.004;

        // 2. Mouse 3D Tilt Interpolation
        tiltX.current += (targetTiltX.current - tiltX.current) * 0.12;
        tiltY.current += (targetTiltY.current - tiltY.current) * 0.12;

        // 3. Radius & Click Dispersion spring physics
        radius.current += (targetRadius.current - radius.current) * 0.12;
        dispersion.current += (1.0 - dispersion.current) * 0.07;

        // Cache projection matrix parameters
        const rotX = angleX.current + tiltY.current;
        const rotY = angleY.current + tiltX.current;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        const cx = width / 2;
        const cy = height / 2;
        const fov = 430;
        const camDistance = 480;

        const pts = pointsRef.current;
        const R = radius.current * dispersion.current;
        
        // Depth-bucketing to reduce draw calls from 1200 to 10
        const buckets = Array.from({ length: 10 }, () => []);

        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];

            // 3D rotation: Y-axis
            const x1 = p.x0 * cosY - p.z0 * sinY;
            const z1 = p.x0 * sinY + p.z0 * cosY;

            // 3D rotation: X-axis
            const y1 = p.y0 * cosX - z1 * sinX;
            const z2 = p.y0 * sinX + z1 * cosX;

            const px = x1 * R;
            const py = y1 * R;
            const pz = z2 * R;

            // Perspective projection mapping
            const scale = fov / (camDistance + pz);
            const sx = cx + px * scale;
            const sy = cy + py * scale;

            if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
                // Normalize depth coordinate between 0 and 1
                const depth = (z2 + radius.current) / (2 * radius.current);
                
                // Map depth to bucket level index (0 to 9)
                const bucketIndex = Math.min(9, Math.floor(depth * 10));
                
                buckets[bucketIndex].push({ sx, sy, depth });
            }
        }

        // Draw each depth bucket in a single path fill operation
        const hovered = isHovered.current;
        const baseSize = hovered ? 1.4 : 1.0;

        for (let b = 0; b < 10; b++) {
            const bucket = buckets[b];
            if (bucket.length === 0) continue;

            const avgDepth = b / 9;
            const avgBrightness = 0.2 + avgDepth * 0.75;
            const size = baseSize * (0.55 + avgDepth * 0.8);

            ctx.fillStyle = hovered
                ? `rgba(242, 222, 160, ${avgBrightness * 0.95})`
                : `rgba(240, 240, 245, ${avgBrightness * 0.75})`;

            ctx.beginPath();
            for (let j = 0; j < bucket.length; j++) {
                const pt = bucket[j];
                ctx.moveTo(pt.sx + size, pt.sy);
                ctx.arc(pt.sx, pt.sy, size, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        requestAnimationFrame(renderLoop);
    };

    // Hover listeners to adjust target values (Direct DOM style modification for 0 re-renders)
    const handleMouseEnter = () => {
        isHovered.current = true;
        targetRadius.current = 190;
        
        if (containerRef.current) {
            containerRef.current.classList.add("hovered");
            containerRef.current.style.transform = "translateY(-50%) scale(1.05)";
        }
    };

    const handleMouseLeave = () => {
        isHovered.current = false;
        targetRadius.current = 175;
        targetTiltX.current = 0;
        targetTiltY.current = 0;

        if (containerRef.current) {
            containerRef.current.classList.remove("hovered");
            containerRef.current.style.transform = "translateY(-50%) scale(1)";
        }
    };

    // Calculate mouse direction to apply 3D tilt (Throttled via ignore tiny movement threshold)
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const normX = x / (rect.width / 2);
        const normY = y / (rect.height / 2);

        const nextTiltX = normX * 0.65;
        const nextTiltY = normY * 0.65;

        // Skip minor updates to throttle input processing
        if (Math.abs(targetTiltX.current - nextTiltX) > 0.015 || Math.abs(targetTiltY.current - nextTiltY) > 0.015) {
            targetTiltX.current = nextTiltX;
            targetTiltY.current = nextTiltY;
        }
    };

    // Click handler to trigger dispersion physics
    const handleClick = (e) => {
        e.preventDefault();
        dispersion.current = 2.6;

        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("toggle-chatbot"));
        }, 80);
    };

    return (
        <div
            ref={containerRef}
            className="particle-sphere-container"
            style={{
                opacity: chatOpenRef.current ? 0 : 1,
                pointerEvents: chatOpenRef.current ? "none" : "auto",
                transform: "translateY(-50%) scale(1)",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label="Interactive AI Agent"
        >
            {/* Ambient golden radial background glow */}
            <div className="sphere-glow"></div>

            <canvas
                ref={canvasRef}
                className="particle-canvas"
                width={750}
                height={750}
            />
        </div>
    );
});

export default FloatingWheel;