
import { motion } from 'framer-motion';
import { Code2, Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/aryalkiran01', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/kiran-aryal-6662ab342', label: 'LinkedIn' },
    { icon: Mail, href: '#contact', label: 'Contact' },
  ];

  const quickLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Code2 className="h-8 w-8 text-blue-500" />
              <span className="font-bold text-xl text-white">Portfolio</span>
            </motion.div>
            <p className="text-gray-400 leading-relaxed">
              Crafting exceptional digital experiences with modern technologies. 
              Let's build something amazing together.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.button
                  key={label}
                  onClick={() => scrollToSection(href)}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 text-gray-400 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ name, href }) => (
                <li key={name}>
                  <motion.button
                    onClick={() => scrollToSection(href)}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    {name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Get in Touch</h3>
            <div className="space-y-2 text-gray-400">
              <p>Butwal, Nepal</p>
              <p>aryalkiran21@gmail.com</p>
              <p>+977 98 275 142 82</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm flex items-center">
            © {currentYear} Portfolio. Made with{' '}
            <Heart className="h-4 w-4 text-red-500 mx-1" />{' '}
            using React & TypeScript
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Designed & Built by KIRA Developer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;