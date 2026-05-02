**🩸 Software Requirements Specification (SRS): BloodNode**

**Project:** BloodNode (Smart Blood Network) **Architecture:** RESTful Micro-Monolith (MERN Stack) **Core Technologies:** React.js, Node.js, Express.js, MongoDB (Geospatial), Gemini AI (Pro & Vision), Twilio, Socket.io.

**1\. System Architecture Flow**

BloodNode ek event-driven architecture par kaam karta hai.

- **Client Layer:** React.js frontend (Mobile-first responsive design).
- **API Gateway/Routing:** Express.js handles HTTP requests and WebSocket connections.
- **Logic Layer:** Node.js executes matching algorithms, AI API calls, and triggers notifications.
- **Data Layer:** MongoDB Atlas stores user data, inventory, and geospatial indexes.

**2\. Granular Module & Feature Breakdown**

**Module 1: Authentication & Role-Based Access Control (RBAC)**

- **User Login/Signup:** JWT (JSON Web Token) based authentication. Phone number verification via OTP.
- **Hospital Onboarding:** Hospitals submit forms with licenseNumber and a document image. System assigns role: "hospital" and isVerified: false.
- **Admin Verification:** SuperAdmin reviews the uploaded document in the admin dashboard and toggles isVerified: true. Bina iske hospital SOS create nahi kar sakta.
- **Multi-Language Support:** UI toggle switch for Hindi, English, and Hinglish via i18next library.

**Module 2: AI Vision Inventory Digitization**

- **Workflow:** Hospital clicks "Update Stock" -> Opens device camera -> Captures whiteboard/register.
- **Algorithm:** 1. Frontend uploads image to backend as base64 or via Multer. 2. Backend sends image to **Gemini Vision API** with prompt: _"Extract blood groups and quantities. Return strictly as JSON object."_ 3. API returns: {"A_pos": 10, "O_neg": 2}. 4. Backend automatically runs an findByIdAndUpdate query on the hospital's inventory document.

**Module 3: The Expanding Geolocation SOS Engine (Core Algorithm)**

Ye project ka sabse complex logic hai.

- **Trigger:** Hospital submits SOS form (e.g., Needs 2 Units O-).
- **Step 1 (Radius 1):** MongoDB \$geoNear queries users where bloodGroup == "O-" AND status == "Available" AND distance <= 5000 meters.
- **Action:** Emit notification to these users via Twilio (WhatsApp) and Nodemailer.
- **Step 2 (The Fallback Loop):** Backend sets a setTimeout for 5 minutes. If acceptedCount < requiredUnits, query runs again with distance <= 10000 meters.
- **Step 3 (City-Wide):** If still unfulfilled after 15 minutes, post to the public "City Emergency Feed".

**Module 4: Real-Time Donor Response System**

- **Accept/Reject Flow:**
  - User clicks **\[Accept\]** -> API updates SOS request document responders array with UserID.
  - WebSockets (Socket.io) emits event to Hospital Dashboard: _"Abhishek (O-) is on the way."_
  - User clicks **\[Reject\]** -> AI flags user as temporarily unavailable and triggers the next closest donor.
- **Route Optimization:** On Accept, frontend opens Google Maps API showing the fastest route avoiding traffic, specifically pointing to the hospital's emergency gate coordinates.
- **OTP Verification Loop:** Donor arrives -> Hospital generates 4-digit OTP on their dashboard -> Donor tells OTP -> Backend verifies -> Marks SOS as "Fulfilled" -> Awards points to Donor.

**Module 5: Rakt-Sarthi (AI Chatbot & Predictive Engine)**

- **Eligibility Bot:** React component embedded in the app corner. User types/speaks queries. Backend passes chat history and WHO guidelines as system instructions to **Gemini Pro API** to ensure medical accuracy.
- **AI Demand Forecasting (Cron Job):** A Node-Cron job runs every Sunday night, analyzing the past 6 months of SOS requests. If it detects a pattern (e.g., high dengue cases last August), it sends a proactive dashboard alert to hospitals: _"Forecast: Stock up on Platelets for upcoming weeks."_

**Module 6: Community Camps & Gamification**

- **Live Camp Radar:** Mapbox/Leaflet UI plotting Camps collection coordinates as markers.
- **Gamification Logic:**
  - totalDonations counter in User Schema.
  - Badges assigned dynamically: if (donations == 1) return 'Bronze'; if (donations >= 5) return 'Gold';
  - **Leaderboards:** Aggregation pipeline groups users by organization/college to show top contributing communities.

**3\. Database Schema Blueprint (MongoDB/Mongoose)**

Developer ko exactly ye models banane honge:

**A. User Schema**

JavaScript

const userSchema = new mongoose.Schema({

name: { type: String, required: true },

phone: { type: String, unique: true },

bloodGroup: { type: String, enum: \['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'\] },

location: {

type: { type: String, default: 'Point' },

coordinates: { type: \[Number\], required: true } // \[longitude, latitude\]

},

role: { type: String, enum: \['donor', 'hospital', 'admin'\], default: 'donor' },

status: { type: String, enum: \['available', 'cooldown', 'busy'\], default: 'available' },

lastDonated: { type: Date },

donationsCount: { type: Number, default: 0 }

});

userSchema.index({ location: '2dsphere' }); // Crucial for distance calculation

**B. Hospital/Inventory Schema**

JavaScript

const hospitalSchema = new mongoose.Schema({

userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

hospitalName: { type: String },

licenseNumber: { type: String },

isVerified: { type: Boolean, default: false },

inventory: {

'A+': { type: Number, default: 0 },

'O-': { type: Number, default: 0 },

// ...other blood groups

lastUpdatedByAI: { type: Date }

}

});

**C. SOS Request Schema**

JavaScript

const sosSchema = new mongoose.Schema({

hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },

bloodGroup: { type: String, required: true },

unitsNeeded: { type: Number, required: true },

unitsFulfilled: { type: Number, default: 0 },

currentRadius: { type: Number, default: 5000 }, // Expands over time

status: { type: String, enum: \['active', 'fulfilled', 'cancelled'\], default: 'active' },

acceptedDonors: \[{

donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

otp: { type: String },

hasReached: { type: Boolean, default: false }

}\]

});

**4\. API Endpoint Structure (REST)**

**Auth & Profile**

- POST /api/auth/register - Create new donor/hospital.
- POST /api/auth/login - Generate JWT.
- PUT /api/users/location - Update donor's live coordinates.

**AI & Inventory**

- POST /api/hospital/inventory/ai-scan - Accepts base64 image, returns parsed Gemini AI stock data.
- PUT /api/hospital/inventory - Manually update specific blood units.

**SOS & Matchmaking**

- POST /api/sos/create - Trigger new emergency. Initiates \$geoNear and WhatsApp scripts.
- POST /api/sos/:sosId/accept - Donor accepts request.
- POST /api/sos/:sosId/verify-otp - Hospital verifies donor arrival.

**Camps & Community**

- GET /api/camps/nearby?lat=X&lng=Y - Fetch active camps within range.
- POST /api/bot/chat - Send user prompt to Gemini text bot, returns medical advice.

**5\. UI/UX Screen Flow (What the user sees)**

**Donor App Flow:**

- **Home/Map View:** User sees their live location and nearby verified hospitals/camps as pins.
- **SOS Alert Overlay:** A highly visible red modal pops up when an SOS is matched. Big "ACCEPT" and "DECLINE" buttons.
- **Active Mission Screen:** If accepted, shows Map directions, Hospital Contact, and OTP to show at the desk.
- **Profile & Badges:** Shows donation history, next eligible date (calculated automatically), and gamified badges.

**Hospital Dashboard Flow:**

- **Overview Panel:** Circular progress charts of current blood stock.
- **AI Sync Button:** Large button to open the camera scanner for whiteboard reading.
- **Create SOS Modal:** Form asking for Blood Group, Units, and Urgency Level.
- **Live Response Tracker:** Shows a list of donors who clicked "Accept" and their ETA (Estimated Time of Arrival).

**6\. Edge Cases Handled**

- **GPS Off/Denied:** Fallback to the city/pin code entered during manual signup.
- **Fake Acceptances:** If a donor clicks "Accept" but doesn't show up within 2 hours, their status is reset, their trust score drops, and the SOS radius expands again automatically.
- **Language Barriers:** All WhatsApp alerts and AI Chatbot responses are forced into the user's selected language (Hindi/English) at the API level before dispatching.