import { Link } from "react-router-dom";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaLock
} from "react-icons/fa";

import "./Footer.css";
import logo from "../../assets/images/logo/logo.png";
import sideCar from "../../assets/images/cars/sidecar.png";

function Footer() {
    return (
        <footer className="showroom-footer">

            <div className="footer-top">
                <div className="footer-container">

                    {/* Brand Info */}
                    <div className="footer-col brand-info">
                        <img src={logo} alt="Apex Luxury Automobiles" className="footer-logo" />

                        <p className="footer-desc">
                            Discover an exclusive collection of luxury, sports, and exotic automobiles.
                            We define excellence and bespoke automotive experiences.
                        </p>

                        <div className="social-links">
                            <a href="#"><FaFacebookF /></a>
                            <a href="#"><FaInstagram /></a>
                            <a href="#"><FaTwitter /></a>
                            <a href="#"><FaYoutube /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col links-col">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link to="/cars">Our Inventory</Link></li>
                            <li><Link to="/sell-your-car">Sell Your Car</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Support</Link></li>
                            <li><Link to="/faq">FAQs / Chatbot</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col contact-col">
                        <h3>Showroom Info</h3>

                        <ul>
                            <li>
                                <FaMapMarkerAlt className="footer-icon" />
                                <span>Sheikh Zayed Road, Al Quoz 3, Dubai, UAE</span>
                            </li>

                            <li>
                                <FaPhoneAlt className="footer-icon" />
                                <span>+971 4 000 0000</span>
                            </li>

                            <li>
                                <FaEnvelope className="footer-icon" />
                                <span>info@apexluxury.ae</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-col newsletter-col">
                        <h3>Newsletter</h3>

                        <p>
                            Subscribe to receive updates on our latest luxury arrivals.
                        </p>

                        <form
                            className="subscribe-form"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                required
                            />

                            <button
                                type="submit"
                                className="subscribe-btn"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>
            </div>



        {/* CAR YAHAN HOGI */}
    <div className="footer-car">
        <img src={sideCar} alt="Luxury Sports Car" />
    </div>

    

            <div className="footer-bottom">
                <div className="footer-container">

                    <p>
                        &copy; {new Date().getFullYear()} Apex Luxury Showroom. All Rights Reserved.
                    </p>

                    <div className="footer-bottom-links">
                        <Link
                            to="/admin/login"
                            className="admin-portal-link"
                        >
                            <FaLock style={{ fontSize: "11px" }} />
                            {" "}Secure Admin Portal
                        </Link>
                    </div>

                </div>
            </div>



           




        </footer>
    );
}

export default Footer;