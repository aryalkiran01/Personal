import React from 'react';
import { motion } from 'framer-motion';
import { Code, Rocket, Users, Coffee } from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const highlights = [
    {
      icon: Code,
      title: "3+ Years Experience",
      description: "Building scalable web applications"
    },
    {
      icon: Rocket,
      title: "50+ Projects",
      description: "Successfully delivered to clients"
    },
    {
      icon: Users,
      title: "Team Leadership",
      description: "Led development teams of 5-10 developers"
    },
    {
      icon: Coffee,
      title: "Chiya Khao",
      description: "Chiya is Love"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            About Me
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            I'm a passionate full-stack developer with a love for creating exceptional digital experiences. 
            With expertise in modern web technologies, I transform ideas into scalable, user-friendly applications.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white mb-4">My Journey</h3>
            <p className="text-gray-300 leading-relaxed">
              Started as a curious computer science student, I've evolved into a seasoned developer 
              who thrives on solving complex problems. My journey spans from crafting pixel-perfect 
              frontend interfaces to architecting robust backend systems.
            </p>
            <p className="text-gray-300 leading-relaxed">
              I believe in continuous learning and staying up-to-date with the latest technologies. 
              When I'm not coding, you'll find me contributing to open-source projects, mentoring 
              junior developers, or exploring new frameworks.
            </p>
            <div className="flex flex-wrap gap-3">
              {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-600/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-gray-700">
              <div className="grid grid-cols-2 gap-6">
                {highlights.map(({ icon: Icon, title, description }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center group"
                  >
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-3 group-hover:bg-blue-600/20 transition-colors">
                      <Icon className="h-8 w-8 text-blue-400 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                    <p className="text-gray-400 text-xs">{description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;