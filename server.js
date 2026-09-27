/**
 * EcoCollect - Smart Waste Collection & Recycling Platform
 * Backend Server & REST API (FIT-FEST 2026 Hackathon)
 * Built with Node.js standard library (Zero external dependencies needed)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- Waste Categories Master Data ---
const WASTE_CATEGORIES = [
  {
    id: 'plastic',
    name: 'Plastic Waste',
    icon: '🧴',
    description: 'Bottles, containers, polybags, PET, HDPE, and clean packaging wrap.',
    pointsPerKg: 15,
    co2PerKg: 1.8,
    disposalGuide: 'Rinse cleanly, dry thoroughly, and compress to save pickup volume.',
    recyclingBin: 'Yellow Bin',
    badgeClass: 'badge-plastic'
  },
  {
    id: 'organic',
    name: 'Organic & Food Waste',
    icon: '🍏',
    description: 'Vegetable peels, food leftovers, garden trimmings, coffee grounds.',
    pointsPerKg: 5,
    co2PerKg: 0.9,
    disposalGuide: 'Separate from plastic wrappings. Keep in biodegradable or ventilated bins.',
    recyclingBin: 'Green Bin',
    badgeClass: 'badge-organic'
  },
  {
    id: 'ewaste',
    name: 'E-Waste & Electronics',
    icon: '💻',
    description: 'Old phones, chargers, laptops, circuit boards, batteries, wires.',
    pointsPerKg: 35,
    co2PerKg: 3.5,
    disposalGuide: 'Do not dismantle batteries or break screens. Hand over intact for component recovery.',
    recyclingBin: 'Blue Bin',
    badgeClass: 'badge-ewaste'
  },
  {
    id: 'paper',
    name: 'Paper & Cardboard',
    icon: '📦',
    description: 'Carton boxes, newspapers, magazines, office paper, clean cartons.',
    pointsPerKg: 10,
    co2PerKg: 1.2,
    disposalGuide: 'Flatten boxes to reduce volume. Keep away from oil or food grease.',
    recyclingBin: 'Blue Bin',
    badgeClass: 'badge-paper'
  },
  {
    id: 'metal_glass',
    name: 'Metal & Glass',
    icon: '🥫',
    description: 'Soda cans, scrap metal rods, beverage glass bottles, condiment jars.',
    pointsPerKg: 20,
    co2PerKg: 2.4,
    disposalGuide: 'Rinse residue. Wrap broken glass separately in labeled paper for safety.',
    recyclingBin: 'Gray Bin',
    badgeClass: 'badge-metal'
  },
  {
    id: 'hazardous',
    name: 'Hazardous / Chemical',
    icon: '⚠️',
    description: 'Paints, aerosol cans, CFL tubes, expired pharmaceuticals, chemical jugs.',
    pointsPerKg: 25,
    co2PerKg: 4.0,
    disposalGuide: 'Keep in original sealed containers with labels visible. Special handling team deployed.',
    recyclingBin: 'Red Bin',
    badgeClass: 'badge-hazardous'
  }
];

// --- Initial Demo Requests Database (In-Memory) ---
let requestsDatabase = [
  {
    id: 'ECO-9281',
    userName: 'Aarav Mehta',
    userPhone: '+91 98765 43210',
    category: 'ewaste',
    categoryName: 'E-Waste & Electronics',
    estimatedWeightKg: 8.5,
    pickupAddress: 'B-402, Green Meadows Residency, Sector 62',
    city: 'Noida',
    pincode: '201309',
    landmark: 'Opposite City Center Metro',
    scheduledDate: '2026-09-28',
    timeSlot: 'Morning (09:00 AM - 12:00 PM)',
    notes: '2 old laptop motherboards, lithium battery and chargers.',
    status: 'In Route', // Pending | Assigned | In Route | Collected | Recycled
    assignedDriver: 'Ramesh Kumar (Truck #UP-16-EK-402)',
    driverPhone: '+91 98111 22334',
    ecoPoints: 297,
    co2SavedKg: 29.7,
    createdAt: '2026-09-27T08:30:00Z',
    statusHistory: [
      { status: 'Pending', time: '2026-09-27T08:30:00Z', note: 'Request submitted by citizen' },
      { status: 'Assigned', time: '2026-09-27T09:15:00Z', note: 'Assigned to Driver Ramesh Kumar' },
      { status: 'In Route', time: '2026-09-27T10:00:00Z', note: 'Collection vehicle dispatched' }
    ]
  },
  {
    id: 'ECO-9282',
    userName: 'Priya Sharma',
    userPhone: '+91 91234 56780',
    category: 'plastic',
    categoryName: 'Plastic Waste',
    estimatedWeightKg: 14.0,
    pickupAddress: 'Villa 12, Palm Groves Society, Outer Ring Road',
    city: 'Bengaluru',
    pincode: '560103',
    landmark: 'Near Bellandur Flyover',
    scheduledDate: '2026-09-28',
    timeSlot: 'Afternoon (01:00 PM - 04:00 PM)',
    notes: 'Bundled clean plastic containers, PET bottles and packaging.',
    status: 'Collected',
    assignedDriver: 'Suresh Patil (EV Van #KA-03-GR-112)',
    driverPhone: '+91 99000 88776',
    ecoPoints: 210,
    co2SavedKg: 25.2,
    createdAt: '2026-09-26T14:10:00Z',
    statusHistory: [
      { status: 'Pending', time: '2026-09-26T14:10:00Z', note: 'Request submitted' },
      { status: 'Assigned', time: '2026-09-26T15:00:00Z', note: 'Assigned to driver' },
      { status: 'In Route', time: '2026-09-27T09:00:00Z', note: 'Driver en route' },
      { status: 'Collected', time: '2026-09-27T11:45:00Z', note: 'Pickup completed at doorstep' }
    ]
  },
  {
    id: 'ECO-9283',
    userName: 'Rohan Verma',
    userPhone: '+91 97890 12345',
    category: 'paper',
    categoryName: 'Paper & Cardboard',
    estimatedWeightKg: 22.0,
    pickupAddress: 'Shop 7, Main Market Road',
    city: 'Delhi',
    pincode: '110001',
    landmark: 'Beside Central Bank',
    scheduledDate: '2026-09-29',
    timeSlot: 'Morning (09:00 AM - 12:00 PM)',
    notes: 'Commercial shipping cartons, flattened and tied with rope.',
    status: 'Pending',
    assignedDriver: 'Unassigned',
    driverPhone: '',
    ecoPoints: 220,
    co2SavedKg: 26.4,
    createdAt: '2026-09-27T11:20:00Z',
    statusHistory: [
      { status: 'Pending', time: '2026-09-27T11:20:00Z', note: 'Awaiting dispatcher assignment' }
    ]
  },
  {
    id: 'ECO-9284',
    userName: 'Ananya Deshmukh',
    userPhone: '+91 96543 21987',
    category: 'hazardous',
    categoryName: 'Hazardous / Chemical',
    estimatedWeightKg: 4.5,
    pickupAddress: 'Flat 101, Sunflower Apts, Senapati Bapat Marg',
    city: 'Mumbai',
    pincode: '400013',
    landmark: 'Near Railway Workshop',
    scheduledDate: '2026-09-29',
    timeSlot: 'Evening (05:00 PM - 07:30 PM)',
    notes: 'Leftover enamel paints, solvent bottles and 2 aerosol cans.',
    status: 'Assigned',
    assignedDriver: 'Vikram Joshi (Hazmat Unit #MH-01-HZ-99)',
    driverPhone: '+91 98200 44556',
    ecoPoints: 112,
    co2SavedKg: 18.0,
    createdAt: '2026-09-27T12:05:00Z',
    statusHistory: [
      { status: 'Pending', time: '2026-09-27T12:05:00Z', note: 'Special hazardous material request logged' },
      { status: 'Assigned', time: '2026-09-27T12:45:00Z', note: 'Assigned to certified Hazmat unit' }
    ]
  }
];

// Helper: parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Helper: Send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: Calculate statistics
function calculateStats() {
  const total = requestsDatabase.length;
  const pending = requestsDatabase.filter(r => r.status === 'Pending').length;
  const assigned = requestsDatabase.filter(r => r.status === 'Assigned').length;
  const inRoute = requestsDatabase.filter(r => r.status === 'In Route').length;
  const collected = requestsDatabase.filter(r => r.status === 'Collected' || r.status === 'Recycled').length;

  const totalWeightKg = requestsDatabase.reduce((sum, r) => sum + (Number(r.estimatedWeightKg) || 0), 0);
  const totalEcoPoints = requestsDatabase.reduce((sum, r) => sum + (Number(r.ecoPoints) || 0), 0);
  const totalCo2SavedKg = requestsDatabase.reduce((sum, r) => sum + (Number(r.co2SavedKg) || 0), 0);

  // Category breakdown
  const categoryStats = {};
  WASTE_CATEGORIES.forEach(c => {
    categoryStats[c.id] = {
      name: c.name,
      icon: c.icon,
      count: 0,
      totalKg: 0
    };
  });

  requestsDatabase.forEach(r => {
    if (categoryStats[r.category]) {
      categoryStats[r.category].count += 1;
      categoryStats[r.category].totalKg += Number(r.estimatedWeightKg) || 0;
    }
  });

  return {
    totalRequests: total,
    pendingRequests: pending,
    activeDispatches: assigned + inRoute,
    completedPickups: collected,
    totalWeightKg: Math.round(totalWeightKg * 10) / 10,
    totalEcoPoints: Math.round(totalEcoPoints),
    totalCo2SavedKg: Math.round(totalCo2SavedKg * 10) / 10,
    treesEquivalent: Math.round((totalCo2SavedKg / 21) * 10) / 10, // ~21kg CO2 absorbed per tree per year
    categoryBreakdown: categoryStats
  };
}

// Static MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API Routes ---

  // Health check for Cloud Run
  if (pathname === '/health' || pathname === '/api/health') {
    sendJSON(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
    return;
  }

  // GET /api/categories
  if (pathname === '/api/categories' && req.method === 'GET') {
    sendJSON(res, 200, { success: true, categories: WASTE_CATEGORIES });
    return;
  }

  // GET /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    sendJSON(res, 200, { success: true, stats: calculateStats() });
    return;
  }

  // GET /api/requests
  if (pathname === '/api/requests' && req.method === 'GET') {
    let filtered = [...requestsDatabase];
    const { status, category, search } = parsedUrl.query;

    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.pickupAddress.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q)
      );
    }

    sendJSON(res, 200, { success: true, count: filtered.length, requests: filtered });
    return;
  }

  // GET /api/requests/:id
  if (pathname.startsWith('/api/requests/') && req.method === 'GET') {
    const id = pathname.split('/')[3];
    const item = requestsDatabase.find(r => r.id.toLowerCase() === (id || '').toLowerCase());
    if (item) {
      sendJSON(res, 200, { success: true, request: item });
    } else {
      sendJSON(res, 404, { success: false, error: 'Pickup request not found' });
    }
    return;
  }

  // POST /api/requests
  if (pathname === '/api/requests' && req.method === 'POST') {
    try {
      const payload = await parseBody(req);

      if (!payload.userName || !payload.userPhone || !payload.category || !payload.pickupAddress) {
        sendJSON(res, 400, {
          success: false,
          error: 'Missing required fields: userName, userPhone, category, and pickupAddress are required.'
        });
        return;
      }

      const categoryObj = WASTE_CATEGORIES.find(c => c.id === payload.category) || {
        id: payload.category,
        name: payload.category,
        pointsPerKg: 10,
        co2PerKg: 1.5
      };

      const weight = Math.max(0.5, parseFloat(payload.estimatedWeightKg) || 2);
      const points = Math.round(weight * categoryObj.pointsPerKg);
      const co2 = Math.round(weight * categoryObj.co2PerKg * 10) / 10;
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const newId = `ECO-${randomCode}`;

      const newRequest = {
        id: newId,
        userName: payload.userName.trim(),
        userPhone: payload.userPhone.trim(),
        category: categoryObj.id,
        categoryName: categoryObj.name,
        estimatedWeightKg: weight,
        pickupAddress: payload.pickupAddress.trim(),
        city: (payload.city || 'Noida').trim(),
        pincode: (payload.pincode || '201301').trim(),
        landmark: (payload.landmark || '').trim(),
        scheduledDate: payload.scheduledDate || new Date().toISOString().split('T')[0],
        timeSlot: payload.timeSlot || 'Morning (09:00 AM - 12:00 PM)',
        notes: (payload.notes || '').trim(),
        status: 'Pending',
        assignedDriver: 'Unassigned',
        driverPhone: '',
        ecoPoints: points,
        co2SavedKg: co2,
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'Pending',
            time: new Date().toISOString(),
            note: 'Pickup request scheduled successfully'
          }
        ]
      };

      requestsDatabase.unshift(newRequest);
      sendJSON(res, 201, { success: true, message: 'Pickup request created', request: newRequest });
    } catch (err) {
      sendJSON(res, 400, { success: false, error: 'Invalid JSON request payload: ' + err.message });
    }
    return;
  }

  // PATCH /api/requests/:id/status
  if (pathname.startsWith('/api/requests/') && pathname.endsWith('/status') && req.method === 'PATCH') {
    try {
      const parts = pathname.split('/');
      const id = parts[3];
      const payload = await parseBody(req);
      const item = requestsDatabase.find(r => r.id.toLowerCase() === (id || '').toLowerCase());

      if (!item) {
        sendJSON(res, 404, { success: false, error: 'Request not found' });
        return;
      }

      if (payload.status) {
        item.status = payload.status;
      }
      if (payload.assignedDriver) {
        item.assignedDriver = payload.assignedDriver;
      }
      if (payload.driverPhone) {
        item.driverPhone = payload.driverPhone;
      }

      const historyEntry = {
        status: item.status,
        time: new Date().toISOString(),
        note: payload.note || `Status updated to ${item.status}`
      };
      item.statusHistory.push(historyEntry);

      sendJSON(res, 200, { success: true, message: 'Status updated successfully', request: item });
    } catch (err) {
      sendJSON(res, 400, { success: false, error: 'Update failed: ' + err.message });
    }
    return;
  }

  // POST /api/seed (Reset / Demo Data)
  if (pathname === '/api/seed' && req.method === 'POST') {
    sendJSON(res, 200, { success: true, message: 'Data reset to demo state' });
    return;
  }

  // --- Static File Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA feel
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFallback, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found - EcoCollect Web App');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(data);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🌱 EcoCollect Smart Waste Management Platform Running`);
  console.log(` 🚀 Local URL: http://localhost:${PORT}`);
  console.log(` 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
