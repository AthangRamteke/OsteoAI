import Navbar from "../../components/common/Navbar";
import Hero from "../../components/landing/Hero";
import FeaturesSection from "../../components/landing/FeaturesSection";
import HowItWorks from "../../components/landing/HowItWorks";
import AboutSection from "../../components/landing/AboutSection";
import Footer from "../../components/common/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <AboutSection />
      <Footer />
    </>
  );
}

export default LandingPage; 