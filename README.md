# Professional Portfolio Website

A modern, responsive portfolio website built with React, TypeScript, and Node.js. Features a beautiful dark theme, smooth animations, and a professional contact system.

## 🌟 Features

### Frontend
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Modern UI**: Dark theme with professional aesthetics
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Portfolio Sections**: Hero, About, Projects, Skills, Contact
- **Contact Form**: Real-time form validation and submission
- **Professional Navigation**: Smooth scrolling between sections

### Backend
- **Contact Form Processing**: Secure message handling
- **Admin Dashboard**: Protected endpoint for viewing submissions
- **Rate Limiting**: Protection against spam and abuse
- **Data Storage**: JSON file-based storage system
- **Security**: Helmet.js, CORS, input validation

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Build Tool**: Vite
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Security**: Helmet.js, CORS, Rate Limiting

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SITE_NAME=Your Portfolio
VITE_CONTACT_EMAIL=your@email.com
```

4. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `backend/.env`:
```env
PORT=5000
ADMIN_TOKEN=your_secure_admin_token_here
CONTACT_EMAIL=your@email.com
NODE_ENV=development
```

5. Start backend server:
```bash
npm run dev
```

### Run Both Servers Concurrently

From the root directory:
```bash
npm run dev
```

This will start both frontend (port 5173) and backend (port 5000) servers simultaneously.

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000      # Backend API URL
VITE_SITE_NAME=Your Portfolio           # Site name
VITE_CONTACT_EMAIL=your@email.com       # Your contact email
```

### Backend (backend/.env)
```env
PORT=5000                               # Backend server port
ADMIN_TOKEN=your_secure_admin_token     # Admin authentication token
CONTACT_EMAIL=your@email.com            # Contact form recipient
NODE_ENV=development                    # Environment (development/production)
```

## 📡 API Endpoints

### Contact Form
```http
POST /api/contact
```
Submit contact form with name, email, subject, and message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "Hello, I'd like to discuss a project..."
}
```

### Admin Dashboard
```http
GET /api/admin/contacts
Authorization: Bearer YOUR_ADMIN_TOKEN
```
Retrieve all contact form submissions (admin only).

### Health Check
```http
GET /api/health
```
Server health status endpoint.

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes, 5 contact submissions per hour
- **Input Validation**: Email format validation and required field checks
- **CORS Protection**: Configured for specific origins
- **Admin Authentication**: Bearer token protection for admin endpoints
- **Security Headers**: Helmet.js for various security headers
- **Data Sanitization**: Basic input sanitization

## 🎨 Customization

### Colors & Theme
The color scheme can be customized in `tailwind.config.js` and throughout the components:
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Accent: Orange (#F97316)
- Background: Gray shades

### Content
Update the following files to customize content:
- `src/components/Hero.tsx`: Personal information and intro
- `src/components/About.tsx`: About section content
- `src/components/Projects.tsx`: Project portfolio
- `src/components/Skills.tsx`: Skills and expertise
- `src/components/Contact.tsx`: Contact information

### Portfolio Projects
Edit the `projects` array in `src/components/Projects.tsx` to showcase your work:
```typescript
const projects = [
  {
    title: "Your Project",
    description: "Project description...",
    image: "https://your-image-url.com",
    tech: ["React", "Node.js"],
    github: "https://github.com/username/repo",
    live: "https://your-live-demo.com",
    featured: true // For highlighted projects
  }
];
```

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Update environment variables for production

### Backend (Railway/Heroku/DigitalOcean)
1. Deploy the `backend` folder
2. Set production environment variables
3. Update CORS origins for your domain

## 📄 File Structure

```
portfolio/
├── backend/
│   ├── data/                 # Data storage directory
│   ├── .env.example         # Backend environment template
│   ├── package.json         # Backend dependencies
│   └── server.js           # Express server
├── src/
│   ├── components/         # React components
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navigation.tsx
│   │   ├── Projects.tsx
│   │   └── Skills.tsx
│   ├── App.tsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.tsx           # React entry point
├── .env.example           # Frontend environment template
├── package.json           # Frontend dependencies
├── tailwind.config.js     # Tailwind configuration
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues & Support

If you encounter any issues or need support:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Pexels](https://www.pexels.com/) - Stock photography

---

Made with ❤️ using React, TypeScript, and modern web technologies.