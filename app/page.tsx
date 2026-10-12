import Navbar from "../components/store/Navbar";
import Hero from "../components/store/Hero";
import PhoneList from "../components/store/PhoneList";

import About from "../components/store/About";
import Contact from "../components/store/Contact";
import Footer from "../components/store/Footer";
import AdminSignupModal from "../components/admin/AdminSignupModal";

export default function Home() {
  return (
    <main className="min-h-screen">

      <Navbar />

      <Hero />

      <PhoneList />

      <About />

      <Contact />

      <Footer />

      <AdminSignupModal />

    </main>
  );
}