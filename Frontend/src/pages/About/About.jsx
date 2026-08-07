import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./About.css";

function About() {
    return (
        <div className="about-page">
            <Navbar />
            
            {/* Banner */}
            <div className="about-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>About Apex</h1>
                    <p>Crafting bespoke luxury automotive legacies since 2003</p>
                </div>
            </div>

            {/* Introduction */}
            <section className="about-intro-section">
                <div className="about-container">
                    <div className="intro-grid">
                        <div className="intro-text">
                            <h2>The Pinnacle of Luxury</h2>
                            <p className="lead-text">
                                Apex Luxury Automobiles represents more than a dealership; we represent a gateway to the world’s most refined driving experiences.
                            </p>
                            <p>
                                Founded in 2003 in Dubai, we have established a reputation as a trusted purveyor of high-performance supercars, premium SUVs, and hand-crafted grand tourers. Our commitment to absolute quality guides everything we do, from vehicle selection to post-sale customization.
                            </p>
                            <p>
                                Each vehicle in our showroom undergoes a meticulous multi-point inspection by certified mechanics, ensuring that only pristine models reach our distinguished clientele.
                            </p>
                        </div>
                        <div className="intro-image">
                            <img 
                                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80" 
                                alt="Showroom Display" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="values-section">
                <div className="about-container">
                    <h2 className="section-header">Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-num">01</div>
                            <h3>Excellence</h3>
                            <p>We demand excellence in our inventory, our services, and our guest hospitality, delivering a world-class environment.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-num">02</div>
                            <h3>Integrity</h3>
                            <p>Transparent dealings, absolute authenticity, and honest certifications form the foundations of customer trust.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-num">03</div>
                            <h3>Bespoke Care</h3>
                            <p>Every customer is unique. We provide customized buying plans, international logistics, and tailored customizations.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default About;