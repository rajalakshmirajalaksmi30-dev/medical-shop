import React from 'react';
import { Award, ShieldCheck, Users, Calendar, CheckCircle, Heart } from 'lucide-react';
import '../styles/about.css';

const About = () => {
  return (
    <div className="page" id="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1 className="about-title">Trusted Healthcare Partners for over <span className="highlight">25 Years</span></h1>
          <p className="about-subtitle">Serving our community with integrity, quality, and care since our inception.</p>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="about-legacy container">
        <div className="legacy-grid">
          <div className="legacy-text">
            <h2>Our Journey & Legacy</h2>
            <p>
              Founded two decades ago, Shantha Krish Medicals began with a simple mission: to provide accessible, high-quality healthcare essentials to every household. What started as a small local pharmacy 20 years ago has today evolved into a trusted brand synonymous with reliability.
            </p>
            <p>
              With <strong>25 years of collective experience</strong> in the pharmaceutical field, our leadership has guided the pharmacy through decades of medical advancements, always keeping the patient's health as our north star.
            </p>
            <div className="legacy-stats">
              <div className="stat-item">
                <Calendar className="stat-icon" />
                <div>
                  <div className="stat-value">20+</div>
                  <div className="stat-label">Years Since Founding</div>
                </div>
              </div>
              <div className="stat-item">
                <Award className="stat-icon" />
                <div>
                  <div className="stat-value">25</div>
                  <div className="stat-label">Years Expertise</div>
                </div>
              </div>
            </div>
          </div>
          <div className="legacy-features">
            <div className="feature-card">
              <ShieldCheck className="feature-icon" />
              <h3>Certified & Regulated</h3>
              <p>We are a fully certified pharmacy, adhering to all state and national health regulations to ensure your safety.</p>
            </div>
            <div className="feature-card">
              <CheckCircle className="feature-icon" />
              <h3>Quality Guaranteed</h3>
              <p>Every tablet and product on our shelves is sourced from reputable manufacturers and undergoes strict quality checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="about-safety">
        <div className="container">
          <div className="safety-content">
            <div className="safety-text">
              <h2>Your Safety is Our Standard</h2>
              <p>
                At Shantha Krish Medicals, we don't just sell medicines; we deliver peace of mind. Our team meticulously checks every single product for <strong>expiry dates and packaging integrity</strong>. We ensure that every medicine you receive is safe, effective, and stored in optimal conditions.
              </p>
              <ul className="safety-list">
                <li><Heart size={18} className="list-icon" /> 100% Genuine Medicines</li>
                <li><Heart size={18} className="list-icon" /> Rigorous Expiry Date Checks</li>
                <li><Heart size={18} className="list-icon" /> Temperature-Controlled Storage</li>
                <li><Heart size={18} className="list-icon" /> Expert Pharmacist Consultations</li>
              </ul>
            </div>
            <div className="safety-image">
               <div className="safety-badge">
                 <Users size={40} />
                 <span>150+ Trusted Daily Customers</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="about-commitment container">
        <div className="commitment-card">
          <h2>Our Commitment to You</h2>
          <p>
            We believe that trust is built over time but can be tested in a moment. While we serve over 150+ trusted customers every day, we understand that every individual's experience matters. Even in the face of occasional negative feedback, our resolve to improve and satisfy every customer only grows stronger. 
          </p>
          <p>
            Your satisfaction is not just a goal—it is our primary metric of success. We listen, we care, and we act to ensure Shantha Krish Medicals remains your most reliable health partner.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
