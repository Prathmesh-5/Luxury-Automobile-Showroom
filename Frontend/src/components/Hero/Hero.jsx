import "./Hero.css";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import heroImage from "../../assets/images/hero/hero.jpg";
import HeroStats from "./HeroStats";
import HeroBadge from "./HeroBadge";
import FloatingWheel from "../FloatingWheel/FloatingWheel";

function Hero() {
    const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);

const smoothX = useSpring(mouseX, {
    stiffness: 40,
    damping: 18
});

const smoothY = useSpring(mouseY, {
    stiffness: 40,
    damping: 18
});

const handleMouseMove = (e) => {

    const { innerWidth, innerHeight } = window;

    const x = (e.clientX - innerWidth / 2) / 35;
    const y = (e.clientY - innerHeight / 2) / 35;

    mouseX.set(x);
    mouseY.set(y);

};
    return (
        <section
            className="hero"
            onMouseMove={handleMouseMove}
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="hero-overlay"></div>
            <motion.div
    className="car-reflection"
    style={{
        x: smoothX,
        y: smoothY
    }}
></motion.div>

            <div className="headlight-glow left"></div>
            <div className="headlight-glow right"></div>
            <div className="light-rays"></div>
            <div className="lens-flare"></div>
            <div className="hero-smoke"></div>

            <motion.div
    className="hero-content"
    style={{
        x: smoothX,
        y: smoothY
    }}
>

    <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hero-subtitle"
    >
        PREMIUM LUXURY AUTOMOBILES
    </motion.p>

    <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
    >
        Drive Beyond <span>Luxury</span>
    </motion.h1>

    <motion.p
        className="hero-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: .3 }}
    >
        Discover an exclusive collection of luxury,
        sports and exotic cars crafted for those
        who demand excellence.
    </motion.p>

    <motion.div
        className="hero-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .5 }}
    >
        <Link to="/cars" className="gold-btn">
            Explore Collection
            <FaArrowRight />
        </Link>

        <Link to="/test-drive" className="outline-btn">
            Book Test Drive
        </Link>

    </motion.div>

</motion.div>

            <HeroBadge />
            <HeroStats />
            <FloatingWheel />

            <div className="scroll-indicator">
                Scroll
            </div>

            <div className="gold-particles">

    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>

</div>

            <div className="smoke smoke1"></div>
            <div className="smoke smoke2"></div>
            <div className="smoke smoke3"></div>
            <div className="smoke smoke4"></div>
            <div className="smoke smoke5"></div>
            <div className="smoke smoke6"></div>
            <div className="smoke smoke7"></div>
            <div className="smoke smoke8"></div>

        </section>
    );
}

export default Hero;