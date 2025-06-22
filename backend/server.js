import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// MongoDB connection setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let contactsCollection;
let trackingCollection;

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('portfolio_db');
    contactsCollection = db.collection('contacts');
    trackingCollection = db.collection('tracking');
    console.log('Connected to MongoDB successfully');
    
    // Create indexes for better query performance
    await contactsCollection.createIndex({ timestamp: -1 });
    await trackingCollection.createIndex({ timestamp: -1 });
    await trackingCollection.createIndex({ ip: 1 });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectToMongoDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'https://personal-phi-ochre.vercel.app']
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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

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

    // Create contact document
    const contactDoc = {
      name,
      email,
      subject,
      message,
      timestamp: new Date(),
      ip: req.ip
    };

    // Insert into MongoDB
    const result = await contactsCollection.insertOne(contactDoc);
    
    res.json({ 
      success: true, 
      message: 'Thank you for your message! I\'ll get back to you soon.',
      id: result.insertedId
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
app.post('/api/track', async (req, res) => {
  try {
    const { latitude, longitude, userAgent, screen, language, image } = req.body;

    // Check if this IP already has a record today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingTrack = await trackingCollection.findOne({
      ip: req.ip,
      timestamp: { $gte: today }
    });

    // If record exists, update it
    if (existingTrack) {
      const updateData = {
        $set: {
          latitude,
          longitude,
          userAgent,
          screen,
          language,
          lastUpdated: new Date()
        }
      };

      // Only update image if provided
      if (image && image.startsWith('data:image/')) {
        const { imagePath } = await saveImage(image);
        updateData.$set.imagePath = imagePath;
      }

      await trackingCollection.updateOne(
        { _id: existingTrack._id },
        updateData
      );

      return res.json({ 
        success: true, 
        message: 'Tracking data updated.',
        action: 'updated'
      });
    }

    // Otherwise create new record
    const trackDoc = {
      latitude,
      longitude,
      userAgent,
      screen,
      language,
      imagePath: '',
      timestamp: new Date(),
      ip: req.ip,
      lastUpdated: new Date()
    };

    // Save image if provided
    if (image && image.startsWith('data:image/')) {
      const { imagePath } = await saveImage(image);
      trackDoc.imagePath = imagePath;
    }

    // Insert into MongoDB
    await trackingCollection.insertOne(trackDoc);

    res.json({ 
      success: true, 
      message: 'Tracking data received.',
      action: 'created'
    });
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Helper function to save image
async function saveImage(imageData) {
  try {
    const match = imageData.match(/^data:image\/(\w+);base64,/);
    const extension = match ? match[1] : 'png';
    const filename = `snapshot_${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    await fs.writeFile(filePath, base64Data, 'base64');
    
    // Verify the file was written
    const stats = await fs.stat(filePath);
    console.log(`Image saved: ${filename}, Size: ${stats.size} bytes`);
    
    return { imagePath: `/uploads/${filename}` };
  } catch (err) {
    console.error('Error saving image:', err);
    return { imagePath: '' };
  }
}

// Admin route to view contact submissions
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
  try {
    const contacts = await contactsCollection.find()
      .sort({ timestamp: -1 }) // Most recent first
      .toArray();
    
    res.json({ 
      success: true, 
      contacts
    });
  } catch (error) {
    console.error('Admin contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to view tracking data
app.get('/api/admin/tracking', authenticateAdmin, async (req, res) => {
  try {
    const tracking = await trackingCollection.find()
      .sort({ timestamp: -1 }) // Most recent first
      .toArray();

    res.json({
      success: true,
      tracking
    });
  } catch (error) {
    console.error('Admin tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test MongoDB connection
    await db.command({ ping: 1 });
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on ${BASE_URL}`);
  console.log(`\n📊 Admin Endpoints:`);
  console.log(`   ↳ Contacts: ${BASE_URL}/api/admin/contacts`);
  console.log(`   ↳ Tracking: ${BASE_URL}/api/admin/tracking`);
  console.log(`\n💬 Public Endpoint:`);
  console.log(`   ↳ Contact: ${BASE_URL}/api/contact\n`);
});