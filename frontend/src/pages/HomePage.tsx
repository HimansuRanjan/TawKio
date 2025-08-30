import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Alex Johnson",
    text: "TawKio made it so easy to connect with my friends. I love the clean interface!",
  },
  {
    name: "Priya Sharma",
    text: "Feels like Instagram + Facebook combined but smoother. Great experience!",
  },
  {
    name: "Michael Chen",
    text: "The chat feature is fast and reliable. Excited for video calls!",
  },
  {
    name: "Sara Williams",
    text: "Finally, a platform that focuses on community and real connections.",
  },
  {
    name: "Himansu Ranjan",
    text: "Building TawKio has been an amazing journey — and it’s just the beginning 🚀",
  },
];

const HomePage = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-20 md:px-32 py-5 bg-transparent z-50">
        <h1 className="text-2xl font-bold text-[#B3C9BC]">TawKio</h1>
        <div className="flex gap-2">
          <Link to="/login">
            <Button
              variant="outline"
              className="text-white rounded-full hover:bg-white hover:text-violet-700"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              variant="outline"
              className="text-white rounded-full hover:bg-white hover:text-violet-700"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="h-screen flex flex-col items-center justify-center text-center px-6 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/banner.png')" }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/70 via-blue-800/60 to-violet-900/70"></div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Connect, Share & Grow with{" "}
            <span className="text-yellow-300">TawKio</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            TawKio is your new-age social media platform where connections feel
            real and engaging. Share your moments, chat instantly, and build a
            community you love.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="h-screen flex flex-col items-center justify-center bg-violet-800/40 px-10 text-center">
        <h3 className="text-4xl font-semibold mb-6">About TawKio</h3>
        <p className="max-w-4xl mx-auto text-gray-200 text-lg">
          TawKio is designed to bring people closer in a simple, beautiful, and
          interactive way. Whether it’s sharing posts, chatting, or connecting
          over calls — TawKio is here to redefine social interaction.
        </p>
      </section>

      {/* Testimonials */}
      <section className="w-full py-20 flex flex-col items-center px-6 relative">
        <h3 className="text-4xl font-semibold text-center mb-12">
          What People Are Saying
        </h3>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 justify-center items-center">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="w-full md:w-72"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <Card className="bg-white/10 border-white/20 text-white shadow-lg backdrop-blur-xl">
                <CardContent className="p-6">
                  <p className="italic">“{t.text}”</p>
                  <h4 className="mt-4 font-bold text-yellow-300">{t.name}</h4>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-violet-950/70 py-10 px-6 text-center text-sm">
        <p className="mb-4">
          © {new Date().getFullYear()} TawKio — Built with ❤️ by Himansu
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mt-4">
          <a
            href="mailto:patrahimansuranjan@gmail.com"
            className="flex items-center gap-2 hover:text-yellow-300"
          >
            <Mail size={18} /> patrahimansuranjan@gmail.com
          </a>
          <a
            href="https://github.com/HimansuRanjan/TawKio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-yellow-300"
          >
            <Github size={18} /> Contribute on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
