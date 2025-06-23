import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Palette, 
  Smartphone, 
  Edit3, 
  Link2, 
  Brain,
  Hexagon,
  Mouse,
  Upload,
  Eye,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const advantages = [
    {
      icon: Sparkles,
      title: "Plug-and-Play Simplicity",
      description: "No need to build a portfolio from scratch — just enter your details and you're live in minutes."
    },
    {
      icon: Palette,
      title: "Designer-Quality Visuals",
      description: "Built with a clean, modern UI and smooth animations that make your portfolio stand out."
    },
    {
      icon: Zap,
      title: "Fast & Responsive",
      description: "Optimized for speed across all devices — mobile, tablet, and desktop."
    },
    {
      icon: Edit3,
      title: "Editable Anytime",
      description: "Update your experience, projects, and skills at any time — no coding required."
    },
    {
      icon: Link2,
      title: "Social-Ready",
      description: "Easily link to your GitHub, LinkedIn, resume, and more."
    },
    {
      icon: Brain,
      title: "Smart & Structured",
      description: "Each section follows a proven format used by top professionals."
    }
  ];

  const features = [
    {
      icon: Edit3,
      title: "Live Editable Portfolio",
      description: "For registered users"
    },
    {
      icon: Upload,
      title: "Upload Support",
      description: "Certificates, Project Files, and Profile Images"
    },
    {
      icon: Sparkles,
      title: "Dynamic Sections",
      description: "Project, Experience, and Skills"
    },
    {
      icon: Palette,
      title: "Dark Theme Ready",
      description: "Optional toggle"
    },
    {
      icon: Zap,
      title: "Animated Transitions",
      description: "Powered by Framer Motion"
    },
    {
      icon: Eye,
      title: "Save & Preview",
      description: "Before publishing"
    },
    {
      icon: Globe,
      title: "Custom URLs",
      description: "yourname.myportfolio.com"
    }
  ];

  const themeHighlights = [
    {
      icon: Sparkles,
      title: "Layered Name Animation",
      description: "Your name appears in large, animated letters — giving it a professional signature feel."
    },
    {
      icon: Mouse,
      title: "Interactive Cursor",
      description: "A dynamic cursor with smooth trailing effects that responds to user interaction."
    },
    {
      icon: Hexagon,
      title: "Hexagon Profile Picture Frame",
      description: "Your image is showcased in a clean hexagonal frame, with an optional glow or animated border."
    },
    {
      icon: Zap,
      title: "Editable Tech Pill",
      description: "Display your current stack or personal tagline in an animated, editable tech pill below your name."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden relative">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="cross cross1"></div>
        <div className="cross cross2"></div>
        <div className="cross cross3"></div>
        <div className="dot"></div>
        <div className="bouncing-ball"></div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Digital Identity
              </motion.h1>
              <motion.h2 
                className="text-4xl md:text-6xl font-bold text-gray-800 mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Canvas
              </motion.h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">Professional Portfolio Builder</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Create a stunning portfolio that showcases your professional identity with elegant design, 
              smooth animations, and powerful customization features.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full">
                View Demo
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                🌟 Why Choose This Portfolio?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with modern technologies and designer-quality aesthetics to make your professional presence unforgettable.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                          <advantage.icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {advantage.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {advantage.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Highlights Section */}
        <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                🎨 Digital Identity Canvas Theme
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A visually striking, Swiss-inspired layout that gives your profile a bold, elegant presence.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {themeHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start mb-4">
                        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                          <highlight.icon className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            {highlight.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-lg">
                            {highlight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                🔧 Key Features
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to create a professional portfolio that stands out.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-purple-300 hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 mx-auto w-fit p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur-sm rounded-3xl p-12 border border-purple-200">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Ready to Build Your Digital Identity?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have elevated their careers with our stunning portfolio builder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
                  Start Building Now
                </Button>
                <Button variant="outline" size="lg" className="border-purple-300 text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg font-semibold rounded-full">
                  View Templates
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4 border-t border-gray-200">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600">
              © 2024 Digital Identity Canvas. Built with love and cutting-edge technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;