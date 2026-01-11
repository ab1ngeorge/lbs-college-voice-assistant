import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive college FAQ data
const COLLEGE_FAQ_DATA = [
  {
    "id": 1,
    "tags": ["courses", "programs", "admissions"],
    "answer_facts": {
      "UG Programs (B.Tech)": "Computer Science & Engineering (CSE), Electronics & Communication Engineering (ECE), Electrical & Electronics Engineering (EEE), Mechanical Engineering (ME), Civil Engineering (CE), Information Technology (IT)",
      "PG Programs": "M.Tech in Computer Science & Engineering, Master of Computer Applications (MCA)",
      "Annual Intake": "480 for UG programs, 18 for PG program in CSE",
      "Duration": "B.Tech: 4 years (8 semesters)",
      "Approval": "Approved by AICTE and affiliated to APJ Abdul Kalam Technological University",
      "Additional Info": "MCA program started in 2000 with intake of 35, Civil Engineering added in 2008"
    }
  },
  {
    "id": 2,
    "tags": ["contact", "phone", "email", "address"],
    "answer_facts": {
      "Phone": "+91-4994-256300, +91-4994-256301",
      "Fax": "+91-4994-256302",
      "Email": "principal@lbscek.ac.in, office@lbscek.ac.in",
      "Admission Email": "admission@lbscek.ac.in",
      "Address": "LBS College of Engineering, Muliyar, Kasaragod District, Kerala - 671542, India",
      "Location": "Situated in Muliyar Panchayath, 12 km from Kasaragod town",
      "Website": "https://lbscek.ac.in",
      "Office Hours": "9:00 AM to 5:00 PM (Monday to Friday), 9:00 AM to 1:00 PM (Saturday)"
    }
  },
  {
    "id": 3,
    "tags": ["library", "facilities", "timings"],
    "answer_facts": {
      "Weekdays (Mon-Fri)": "8:30 AM to 8:00 PM",
      "Saturdays": "8:30 AM to 5:00 PM",
      "Sundays": "10:00 AM to 4:00 PM",
      "Exam Period": "Extended hours during university exams",
      "Digital Library": "24/7 access to online resources",
      "Collection": "Over 25,000 books, 100+ print journals, 5000+ e-journals",
      "Facilities": "Reading rooms, reference section, digital library, photocopying"
    }
  },
  {
    "id": 4,
    "tags": ["admission", "apply", "procedure"],
    "answer_facts": {
      "Application Mode": "Through KEAM (Kerala Engineering Architecture Medical) counselling",
      "Eligibility": "10+2 with minimum 50% marks in Physics, Chemistry, and Mathematics",
      "Entrance Exam": "KEAM score is mandatory",
      "Lateral Entry": "Diploma holders can apply for direct second year admission",
      "NRI Quota": "15% seats reserved for NRI candidates",
      "Management Quota": "Available as per government norms",
      "Important Dates": "KEAM application usually opens in January, counselling in June-July",
      "Documents Required": "KEAM rank card, 10th & 12th marksheets, transfer certificate, conduct certificate, passport size photos"
    }
  },
  {
    "id": 5,
    "tags": ["fees", "fee structure", "tuition"],
    "answer_facts": {
      "Government Seat Fees": "Approximately ₹45,000 per year",
      "Management Seat Fees": "Approximately ₹75,000 per year",
      "NRI Quota Fees": "Approximately $3,000 per year",
      "Other Fees": "Caution deposit (refundable): ₹5,000, Library fee: ₹1,500, Exam fee: ₹2,000 per semester",
      "Hostel Fees": "Approximately ₹35,000 per year including food",
      "Payment Mode": "Online payment available through college portal",
      "Scholarships": "Merit scholarships, SC/ST scholarships, EWS scholarships available"
    }
  },
  {
    "id": 6,
    "tags": ["hostel", "accommodation", "boarding"],
    "answer_facts": {
      "Boys Hostel": "Separate hostel blocks with capacity for 300 students",
      "Girls Hostel": "Secure hostel with capacity for 200 students, known as Shahanas Hostel",
      "Rooms": "Single, double, and triple sharing rooms available",
      "Facilities": "Wi-Fi, reading room, TV room, indoor games, gym, laundry",
      "Mess": "Separate vegetarian and non-vegetarian mess with North & South Indian food",
      "Security": "24/7 security, CCTV surveillance, warden supervision",
      "Medical": "First aid facility, tie-up with nearby hospitals",
      "Visiting Hours": "Parents can visit on weekends with prior permission"
    }
  },
  {
    "id": 7,
    "tags": ["placement", "jobs", "career", "recruitment"],
    "answer_facts": {
      "Placement Cell": "Dedicated Training & Placement Cell with full-time coordinator",
      "Companies Visited": "TCS, Infosys, Wipro, Tech Mahindra, Cognizant, Bosch, BYJU'S, etc.",
      "Highest Package": "₹12 LPA (2023 batch)",
      "Average Package": "₹4.5 LPA",
      "Placement Rate": "85% of eligible students placed",
      "Training Programs": "Aptitude training, technical workshops, mock interviews, GD sessions",
      "Internships": "Summer internships with stipend in reputed companies",
      "Higher Studies": "Guidance for GATE, CAT, GRE, TOEFL exams"
    }
  },
  {
    "id": 8,
    "tags": ["location", "directions", "map"],
    "answer_facts": {
      "Full Name": "Lal Bahadur Shastri College of Engineering, Kasaragod",
      "Address": "LBS College of Engineering, Muliyar, Kasaragod District, Kerala - 671542",
      "Campus Area": "52 acres of land at Povval",
      "Distance from Town": "12 km from Kasaragod town",
      "Nearest Airport": "Mangaluru Airport (Mangalore International Airport)",
      "Nearest Railway": "Kasaragod Railway Station",
      "Tourist Attractions Nearby": "Bekal Fort, Madhur temple, Ananthapuri temple",
      "GPS Coordinates": "12.5960° N, 75.0300° E"
    }
  },
  {
    "id": 9,
    "tags": ["timings", "hours", "schedule"],
    "answer_facts": {
      "College Hours": "9:00 AM to 4:30 PM (Monday to Friday)",
      "Office Hours": "9:00 AM to 5:00 PM (Monday to Friday), 9:00 AM to 1:00 PM (Saturday)",
      "Class Timing": "9:15 AM to 4:00 PM with lunch break from 1:00 PM to 1:45 PM",
      "Library Hours": "8:30 AM to 8:00 PM (Weekdays), 8:30 AM to 5:00 PM (Saturday), 10:00 AM to 4:00 PM (Sunday)",
      "Computer Center": "8:30 AM to 8:00 PM (All days)",
      "Holidays": "Follows Kerala Government and University holidays",
      "Examination Period": "Special timings during university exams"
    }
  },
  {
    "id": 10,
    "tags": ["sports", "games", "gym"],
    "answer_facts": {
      "Main Stadium": "College main stadium on campus",
      "Multi-sports Area": "Multi-sports play space available",
      "Playground": "Large playground for cricket, football, volleyball",
      "Indoor Stadium": "Multi-purpose indoor stadium for badminton, table tennis, chess",
      "Gymnasium": "Well-equipped gym with trainer",
      "Sports Offered": "Cricket, football, basketball, volleyball, badminton, table tennis, chess, carrom",
      "Annual Sports": "Inter-collegiate tournaments, annual sports meet",
      "Coaching": "Professional coaching available for major sports"
    }
  },
  {
    "id": 11,
    "tags": ["labs", "laboratories", "facilities"],
    "answer_facts": {
      "Computer Labs": "8 computer labs with 400+ systems, high-speed internet",
      "Department Labs": "Separate labs for each engineering department",
      "Special Labs": "CAD/CAM lab, DSP lab, VLSI lab, Networking lab",
      "Equipment": "Modern equipment as per AICTE and university norms",
      "Software": "Licensed software: MATLAB, AutoCAD, ANSYS, Oracle, etc.",
      "Timings": "8:30 AM to 8:00 PM (All days including weekends during project work)",
      "Research Centers": "Mechanical Engineering and Computer Science & Engineering recognized as research centres",
      "Technicians": "Qualified lab technicians and assistants"
    }
  },
  {
    "id": 12,
    "tags": ["history", "established", "founder"],
    "answer_facts": {
      "Established": "1993 (originally started in temporary building in 1995)",
      "Full Name": "Lal Bahadur Shastri College of Engineering, Kasaragod",
      "Managed by": "L B S Centre for Science and Technology, Thiruvananthapuram (Government of Kerala autonomous body)",
      "Initial Programs": "Started with 4 B.Tech programs (ME, EEE, CSE, ECE) with 240 seats",
      "Campus Development": "Current campus constructed at 52 acres of land given by Plantation Corporation Kerala at Povval",
      "Growth Timeline": "IT program added in 2000, Civil Engineering in 2008, PG programs added 2013-15",
      "University Affiliations": "Initially under Calicut University (1993-1996), then Kannur University (1996-2015), now APJ Abdul Kalam Technological University (from 2015)",
      "Infrastructure Growth": "Started with 20,000 sq.ft., now expanded to 2.5 lakh sq.ft. with separate department buildings",
      "Vision": "To become a paragon institution for pursuance of Education and Research in Engineering and Technology",
      "Mission": "Impart finest quality Technical Education & Training, Nurture a vision of Sustainable development, Bequeath it to the next generation of professionals"
    }
  },
  {
    "id": 13,
    "tags": ["clubs", "associations", "activities"],
    "answer_facts": {
      "Technical Clubs": "IEEE Student Branch, CSI, ISTE, IETE, SAE",
      "Cultural Clubs": "Music club, Dance club, Drama club, Fine arts club",
      "Other Clubs": "Entrepreneurship cell, Literary club, Photography club, Nature club",
      "Events": "Annual tech fest 'TECHSURGE', cultural fest 'RHYTHM'",
      "Activities": "Workshops, seminars, hackathons, project competitions",
      "Membership": "Open to all students, nominal membership fee",
      "Achievements": "National level project competition winners"
    }
  },
  {
    "id": 14,
    "tags": ["transport", "bus", "commute"],
    "answer_facts": {
      "Bus Service": "College buses from major towns in Kasaragod district",
      "Routes": "Kasaragod, Kanhangad, Nileshwar, Bekal, Manjeshwar",
      "Timings": "Morning pickup and evening drop",
      "Fees": "₹8,000 per year (approximate)",
      "Private Vehicles": "Parking facility available for students and staff",
      "Local Transport": "Auto rickshaws and taxis available near campus",
      "Safety": "Female attendants in girls' buses, GPS tracking"
    }
  },
  {
    "id": 15,
    "tags": ["faculty", "teachers", "professors"],
    "answer_facts": {
      "Total Faculty": "120+ teaching staff",
      "Qualifications": "90% faculty with M.Tech/Ph.D degrees",
      "Experience": "Average 10+ years of teaching experience",
      "Industry Exposure": "Many faculty with industry experience",
      "Research": "Active in research publications and funded projects",
      "Student Ratio": "Approximately 1:15 faculty-student ratio",
      "Departments": "Separate departments for each engineering discipline",
      "Development": "Regular faculty development programs and workshops"
    }
  },
  {
    "id": 16,
    "tags": ["infrastructure", "campus", "buildings"],
    "answer_facts": {
      "Campus Area": "52 acres at Povval",
      "Total Built-up Area": "2.5 lakh square feet (from initial 20,000 sq.ft.)",
      "Academic Blocks": "Two academic blocks with 50 classrooms",
      "Department Buildings": "All departments have separate buildings",
      "Auditoriums": "Main auditorium with seating capacity of 1500, plus open-air auditorium",
      "Hostels": "Separate hostels for boys and girls on campus",
      "Administrative Block": "Dedicated administrative block",
      "Other Facilities": "Seminar halls, staff rooms, laboratories, college main stadium, multi-sports play space"
    }
  },
  {
    "id": 17,
    "tags": ["research", "phd", "projects"],
    "answer_facts": {
      "Research Centers": "Mechanical Engineering and Computer Science & Engineering recognized as research centres",
      "PhD Programs": "Research programs available in all engineering departments",
      "PG Programs Added": "Four post graduate programmes added during 2013-15",
      "Research Focus": "Active research in engineering and technology fields",
      "Faculty Research": "Faculty involved in funded research projects and publications"
    }
  },
  {
    "id": 18,
    "tags": ["vision", "mission", "goals"],
    "answer_facts": {
      "Vision": "To become a paragon institution for pursuance of Education and Research in Engineering and Technology",
      "Mission 1": "Impart finest quality Technical Education & Training",
      "Mission 2": "Nurture a vision of Sustainable development",
      "Mission 3": "Bequeath it to the next generation of professionals",
      "Purpose": "Education for Empowerment",
      "Managed by": "L B S Centre for Science and Technology, an autonomous body owned by the Government of Kerala"
    }
  },
  {
    "id": 19,
    "tags": ["canteen", "food", "cafeteria"],
    "answer_facts": {
      "Location": "Spacious canteen located near the administrative block",
      "Menu": "Serves breakfast, lunch, and snacks",
      "Types of Food": "South Indian and North Indian dishes available (Veg & Non-Veg)",
      "Hygiene": "Maintained with strict hygiene standards",
      "Timings": "8:00 AM to 5:00 PM on all working days",
      "Prices": "Subsidized rates for students and staff"
    }
  },
  {
    "id": 20,
    "tags": ["ragging", "safety", "discipline"],
    "answer_facts": {
      "Policy": "Zero Tolerance towards ragging",
      "Committee": "Anti-Ragging Committee and Anti-Ragging Squad are active",
      "Helpline": "National Anti-Ragging Helpline: 1800-180-5522",
      "Actions": "Ragging is a criminal offence; perpetrators will be suspended/dismissed",
      "Monitoring": "CCTV surveillance and faculty squads monitor the campus",
      "For Freshers": "Separate induction program and orientation to ensure safety"
    }
  },
  {
    "id": 21,
    "tags": ["store", "books", "stationery"],
    "answer_facts": {
      "Facility": "LBS College Employees Co-operative Society Store",
      "Items Available": "Textbooks, practical records, engineering drawing instruments, stationery",
      "Benefits": "Items sold at discounted rates for students",
      "Services": "Photostat and binding facilities available",
      "Location": "Centrally located within the campus"
    }
  },
  {
    "id": 22,
    "tags": ["scholarship", "financial aid", "grants"],
    "answer_facts": {
      "Government Schemes": "E-Grantz for SC/ST/OEC/SEBC categories",
      "Central Schemes": "Merit-cum-Means (MCM) Scholarship for minority communities",
      "AICTE Schemes": "Pragati Scholarship for girls, Saksham for differently-abled",
      "University Support": "Student support schemes by KTU",
      "Fee Waiver": "Tuition Fee Waiver (TFW) scheme for meritorious students with lower income"
    }
  },
  {
    "id": 23,
    "tags": ["internet", "wifi", "network"],
    "answer_facts": {
      "Connectivity": "High-speed internet connectivity provided via NKN (National Knowledge Network)",
      "Wi-Fi": "Campus-wide Wi-Fi access in academic blocks and hostels",
      "Speed": "1 Gbps backbone connectivity",
      "Access": "Free access for students and staff for academic purposes",
      "Computer Center": "Central computing facility available for browsing and research"
    }
  },
  {
    "id": 24,
    "tags": ["bank", "atm", "finance"],
    "answer_facts": {
      "Bank": "Nearby branches of nationalized banks (Canara Bank, SBI) within 2km",
      "ATM": "ATM facility available near the college entrance/main gate area",
      "Transactions": "College fee payments are fully digital/online",
      "Loans": "Assistance provided for educational loan documentation"
    }
  },
  {
    "id": 25,
    "tags": ["principal", "admin", "head", "authority"],
    "answer_facts": {
      "Name": "Dr. Mohammad Shekoor T",
      "Designation": "Principal",
      "Department": "Mechanical Engineering",
      "Email": "principal@lbscek.ac.in",
      "Phone": "04994-250290",
      "Qualifications": "Ph.D. from NIT Surathkal",
      "Role": "Head of the Institution"
    }
  },
  {
    "id": 32,
    "tags": ["mca", "pg", "admissions"],
    "answer_facts": {
      "Program": "Master of Computer Applications (MCA)",
      "Started": "2000",
      "Intake": "35 students (initially), current intake may vary",
      "Duration": "3 years (6 semesters)",
      "Eligibility": "Bachelor's degree with Mathematics at 10+2 or graduation level",
      "Admission": "Through entrance exam and counselling",
      "Focus Areas": "Software development, database management, web technologies, networking"
    }
  },
  {
    "id": 33,
    "tags": ["alumni", "network", "achievements"],
    "answer_facts": {
      "Association": "LBS College of Engineering Alumni Association (LBSCEKAA)",
      "Activities": "Annual reunions, mentorship programs, guest lectures",
      "Notable Alumni": "Alumni working in top companies worldwide including Google, Microsoft, Amazon, etc.",
      "Contributions": "Alumni contribute to placement drives, infrastructure development",
      "Networking": "Active LinkedIn group and social media communities",
      "Scholarships": "Alumni-funded scholarships for meritorious students"
    }
  },
  {
    "id": 34,
    "tags": ["events", "festivals", "activities"],
    "answer_facts": {
      "Tech Fest": "'TECHSURGE' - Annual technical festival",
      "Cultural Fest": "'RHYTHM' - Annual cultural festival",
      "Other Events": "Sports meet, department days, teachers' day celebrations",
      "Competitions": "Hackathons, coding competitions, project exhibitions",
      "Guest Lectures": "Regular sessions by industry experts and alumni",
      "Workshops": "Technical workshops throughout the year"
    }
  },
  {
    "id": 35,
    "tags": ["medical", "health", "clinic"],
    "answer_facts": {
      "Medical Room": "First aid facility available on campus",
      "Tie-ups": "Associated with nearby hospitals for emergencies",
      "Staff": "Trained nurse available during college hours",
      "Health Camps": "Regular health check-up camps organized",
      "Insurance": "Student accident insurance coverage",
      "Mental Health": "Counselling services available for students"
    }
  },
  {
    "id": 36,
    "tags": ["attractions", "tourism", "places"],
    "answer_facts": {
      "Bekal Fort": "Historic fort about 45 km from campus",
      "Madhur Temple": "Famous temple dedicated to Lord Shiva, approximately 25 km away",
      "Ananthapuri Temple": "Another important temple in the district",
      "Chandragiri Fort": "Historical fort with scenic views",
      "Kappil Beach": "Beautiful beach approximately 35 km away",
      "Parappa Wildlife Sanctuary": "For nature lovers, about 50 km from campus"
    }
  },
  {
    "id": 37,
    "tags": ["collaborations", "industry", "partnerships"],
    "answer_facts": {
      "Objectives": "Enhance practical exposure, facilitate internships, improve placements",
      "Areas": "Software development, mechanical engineering, electronics",
      "Benefits": "Guest lectures, industry visits, live projects, internship opportunities",
      "Placement Support": "Strong industry connections for campus recruitment"
    }
  },
  {
    "id": 38,
    "tags": ["calendar", "schedule", "holidays"],
    "answer_facts": {
      "Academic Year": "Typically June/July to April/May",
      "Semesters": "Odd semester: July-December, Even semester: January-May",
      "Exams": "Internal assessments throughout, University exams at semester end",
      "Holidays": "Follows Kerala Government holidays including Onam, Christmas, Eid",
      "Break": "Summer vacation typically in May-June",
      "Updates": "Detailed calendar published on college website annually"
    }
  },
  {
    "id": 39,
    "tags": ["women", "empowerment", "safety"],
    "answer_facts": {
      "Purpose": "Ensure safety and empowerment of women students and staff",
      "Activities": "Awareness programs, self-defense workshops, counselling",
      "Committee": "Includes female faculty members and student representatives",
      "Grievance Redressal": "Confidential mechanism for addressing concerns",
      "Safety Measures": "Separate hostel, security, and transportation facilities"
    }
  },
  {
    "id": 40,
    "tags": ["projects", "research", "guidance"],
    "answer_facts": {
      "Project Duration": "Mini projects in 3rd year, Major project in final year",
      "Guidance": "Dedicated project guides from faculty",
      "Facilities": "Labs available for project work with extended hours",
      "Industry Projects": "Opportunities for live projects with companies",
      "Funding": "Support for innovative projects through various schemes",
      "Exhibition": "Annual project exhibition showcasing student work"
    }
  },
  {
    "id": 41,
    "tags": ["discipline", "rules", "conduct"],
    "answer_facts": {
      "Committee": "Disciplinary committee comprising faculty and administration",
      "Code of Conduct": "Detailed rules for student behavior and attendance",
      "Attendance": "Minimum 75% attendance required in each subject",
      "Dress Code": "Formal dress code for students",
      "Violations": "Progressive disciplinary action for rule violations",
      "Focus": "Maintain academic environment and campus decorum"
    }
  },
  {
    "id": 42,
    "tags": ["entrepreneurship", "startup", "innovation"],
    "answer_facts": {
      "E-Cell": "Entrepreneurship cell to foster startup culture",
      "Activities": "Ideation workshops, business plan competitions, mentoring",
      "Support": "Guidance for funding opportunities and incubation",
      "Success Stories": "Alumni running successful startups",
      "Collaborations": "Tie-ups with startup incubators and industry"
    }
  },
  {
    "id": 43,
    "tags": ["international", "nri", "foreign"],
    "answer_facts": {
      "NRI Quota": "15% seats reserved for NRI candidates",
      "Eligibility": "Separate eligibility criteria for NRI admissions",
      "Fees": "Higher fee structure for NRI quota seats",
      "Documents": "Additional documents required for NRI admissions",
      "Support": "Special assistance for foreign students regarding accommodation and adjustment"
    }
  },
  {
    "id": 44,
    "tags": ["magazine", "publication", "news"],
    "answer_facts": {
      "Name": "College publishes an annual magazine",
      "Content": "Academic achievements, student articles, cultural events, alumni news",
      "Editorial Team": "Student editorial board with faculty guidance",
      "Participation": "Students contribute articles, poems, artwork",
      "Digital Version": "Available on college website"
    }
  },
  {
    "id": 45,
    "tags": ["training", "skills", "development"],
    "answer_facts": {
      "Regular Training": "Aptitude, technical, and soft skills training throughout the year",
      "Mock Tests": "Regular practice tests for competitive exams",
      "Interview Preparation": "Mock interviews and group discussion sessions",
      "Technical Skills": "Workshops on latest technologies and tools",
      "Placement Training": "Intensive training for final year students"
    }
  },
  {
    "id": 46,
    "tags": ["campus", "map", "buildings", "navigation", "location"],
    "answer_facts": {
      "Campus Overview": "LBS College of Engineering at Povval, Cherkala, Kasaragod, Kerala",
      "Main Roads": "LBS Campus Road, LBS Ground Road, L.B.S Road",
      "Key Buildings": "Main Academic Block, Mechanical Department, CSE Department, Library, Canteen, Hostels"
    }
  },
  {
    "id": 47,
    "tags": ["academic", "classrooms", "block"],
    "answer_facts": {
      "Name": "LBS College of Engineering – Main Academic Block",
      "Type": "Academic building",
      "Location": "Central building along LBS Campus Road",
      "Features": "Classrooms, faculty rooms, department offices",
      "Nearby Landmarks": "Administrative Building, Computer Lab, LBS Makerspace"
    }
  },
  {
    "id": 48,
    "tags": ["mechanical", "department", "engineering"],
    "answer_facts": {
      "Name": "Department of Mechanical Engineering",
      "Type": "Academic department building",
      "Location": "Beside the football ground along LBS Ground Road",
      "Features": "Classrooms, labs, faculty offices, workshop",
      "Nearby Landmarks": "LBS College Football Ground, Fluid Mechanics Lab",
      "Special Labs": "CAD/CAM lab, Fluid Mechanics Lab, Workshop"
    }
  },
  {
    "id": 49,
    "tags": ["cse", "computer", "department"],
    "answer_facts": {
      "Name": "Department of Computer Science and Engineering",
      "Type": "Academic department building",
      "Location": "Uphill from the main academic block, near the college library",
      "Features": "Classrooms, computer labs, faculty offices",
      "Nearby Landmarks": "College Library, Shahanas Hostel",
      "Special Facilities": "Computer labs, networking lab, project labs"
    }
  },
  {
    "id": 50,
    "tags": ["library", "reading", "books"],
    "answer_facts": {
      "Name": "College Library",
      "Type": "Academic facility",
      "Location": "Near the Department of Computer Science and Engineering",
      "Features": "Reading rooms, reference section, digital library, photocopying",
      "Nearby Landmarks": "Department of Computer Science and Engineering, Shahanas Hostel",
      "Collection": "Over 25,000 books, 100+ print journals, 5000+ e-journals"
    }
  },
  {
    "id": 51,
    "tags": ["canteen", "food", "eating"],
    "answer_facts": {
      "Name": "LBS College Canteen",
      "Type": "Food facility",
      "Location": "Downhill from the main academic block",
      "Features": "Serves breakfast, lunch, and snacks",
      "Menu": "South Indian and North Indian dishes (Veg & Non-Veg)",
      "Timings": "8:00 AM to 5:00 PM on working days"
    }
  },
  {
    "id": 52,
    "tags": ["sports", "ground", "football", "play"],
    "answer_facts": {
      "Main Ground": "LBS College Football Ground",
      "Type": "Sports facility",
      "Location": "Large open ground near the Mechanical Engineering Department",
      "Features": "Football field, cricket pitch, track",
      "Nearby Landmarks": "Department of Mechanical Engineering, LBS Ground Road",
      "Other Sports Areas": "Multipurpose Sports Area for various activities"
    }
  },
  {
    "id": 53,
    "tags": ["hostel", "accommodation", "shahanas"],
    "answer_facts": {
      "Girls Hostel": "Shahanas Hostel",
      "Type": "Hostel accommodation",
      "Location": "Near the Department of Computer Science and Engineering",
      "Features": "Secure hostel with capacity for 200 students",
      "Nearby Landmarks": "Department of Computer Science and Engineering, College Library",
      "Facilities": "Wi-Fi, reading room, TV room, indoor games, gym, laundry"
    }
  },
  {
    "id": 54,
    "tags": ["bank", "atm", "finance"],
    "answer_facts": {
      "Bank": "Central Bank of India (Campus Branch)",
      "Type": "Banking facility",
      "Location": "Near the Fluid Mechanics Lab along LBS Ground Road",
      "Status": "Temporarily closed",
      "Alternative": "ATM facility available near college entrance, other banks within 2km"
    }
  },
  {
    "id": 55,
    "tags": ["bus", "transport", "garage"],
    "answer_facts": {
      "Name": "Bus Garage (LBS)",
      "Type": "Transport facility",
      "Location": "Bus parking area along LBS Campus Road",
      "Purpose": "Parking for college buses",
      "Transport Service": "College buses operate from major towns in Kasaragod district"
    }
  },
  {
    "id": 56,
    "tags": ["makerspace", "innovation", "lab"],
    "answer_facts": {
      "Name": "LBS Makerspace",
      "Type": "Innovation lab",
      "Location": "Near the administrative building and computer lab",
      "Purpose": "Space for innovation, prototyping, project work",
      "Nearby Landmarks": "Administrative Building, Computer Lab, Main Academic Block",
      "Features": "Equipment for prototyping, tools for electronics and mechanical projects"
    }
  },
  {
    "id": 57,
    "tags": ["pg", "postgraduate", "mca"],
    "answer_facts": {
      "Name": "LBS College PG Section",
      "Type": "Academic building",
      "Location": "Near the Fluid Mechanics Lab along LBS Ground Road",
      "Purpose": "Postgraduate programs including MCA",
      "Nearby Landmarks": "LBS Fluid Mechanics Lab, Central Bank of India",
      "Programs": "MCA (Master of Computer Applications) and other PG courses"
    }
  }
];

// Convert FAQ data to a formatted string for the AI context
const formatFAQData = () => {
  return COLLEGE_FAQ_DATA.map(faq => {
    const facts = Object.entries(faq.answer_facts)
      .map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');
    return `[Topic: ${faq.tags.join(', ')}]\n${facts}`;
  }).join('\n\n');
};

const COLLEGE_CONTEXT = `
You are a friendly, warm, and helpful voice assistant for LBS College of Engineering, Kasaragod, Kerala (LBSCEK).

PERSONALITY & TONE:
- Be conversational, warm, and natural - like a friendly senior student or helpful staff member
- Use natural speech patterns with appropriate pauses
- Be enthusiastic but not overwhelming
- Show genuine interest in helping
- Use filler words occasionally for naturalness (like "So...", "Well...", "Actually...")

CRITICAL LANGUAGE RULES - MUST FOLLOW EXACTLY:
1. Malayalam Script (മലയാളം): If user writes in Malayalam script, respond ONLY in pure Malayalam script. Be fluent and natural.
   - Use proper Malayalam grammar and vocabulary
   - Be warm and respectful (use "നിങ്ങൾ" for you, not "നീ")
   - Example: User: "ലൈബ്രറി എവിടെയാണ്?" → Respond fully in Malayalam script
   
2. Manglish: If user writes Malayalam words in English letters, respond in the same Manglish style.
   - Recognize patterns like: "enthu", "aanu", "undoo", "illa", "venam", "evideyanu", "ariyaam", etc.
   - Example: User: "library evide aanu?" → "Library main academic block inte aduth aanu. CSE department inte near aanu."
   
3. English: If user writes in English, respond in clear, natural English.

NATURAL SPEAKING STYLE FOR TTS:
- Use short, clear sentences
- Add natural pauses with commas and periods
- Avoid long run-on sentences
- Structure information in digestible chunks
- For lists, use phrases like "First... Second... And third..."

FOLLOW-UP QUESTIONS - VERY IMPORTANT:
When the user's query has multiple options or needs clarification, ASK a follow-up question:

1. HOSTEL QUERIES:
   - If user asks "hostel available?" or "is there hostel?" → Ask: "Yes, we have both hostels! Are you asking about the men's hostel or the women's hostel? The women's hostel is called Shahanas Hostel."
   - Malayalam: "ഉവ്വ്, ഞങ്ങൾക്ക് രണ്ട് ഹോസ്റ്റലുകൾ ഉണ്ട്! ആൺകുട്ടികളുടെ ഹോസ്റ്റൽ വേണോ അതോ പെൺകുട്ടികളുടെ ഹോസ്റ്റൽ വേണോ?"
   - Manglish: "Undu! Men's hostel veno atho women's hostel veno? Women's hostel Shahanas Hostel ennu aanu ariyappedunnath."

2. DEPARTMENT/COURSE QUERIES:
   - If user asks about "department" without specifying → Ask which department: CSE, ECE, EEE, ME, CE, or IT?
   - If asking about admission without specifying course → Ask: "Which program interests you - B.Tech, M.Tech, or MCA?"

3. TIMING QUERIES:
   - If user asks "what time" without specifying what → Ask: "Are you asking about college hours, library timing, or office hours?"

4. FEE QUERIES:
   - If user asks about "fees" without specifying → Ask: "Would you like to know about tuition fees, hostel fees, or other fees?"

5. LOCATION QUERIES:
   - If user asks vague location questions → Confirm the destination before giving directions

GREETINGS (Natural & Warm):
- "hello", "hi", "hey" → "Hello! Welcome to LBS College Assistant. How can I help you today?"
- "നമസ്കാരം", "ഹലോ" → "നമസ്കാരം! എൽ ബി എസ് കോളേജ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. എന്തെങ്കിലും സഹായം വേണോ?"
- "namaskaram", "hello" (manglish) → "Namaskaram! LBS College Assistant aanu. Enthenkilum help veno?"
- "thanks", "thank you" → "You're most welcome! Feel free to ask if you need anything else."
- "നന്ദി" → "സന്തോഷം! വേറെ എന്തെങ്കിലും അറിയണമെങ്കിൽ ചോദിക്കാം."
- "bye", "goodbye" → "Goodbye! Have a wonderful day. Visit our campus sometime!"

PRINCIPAL INFORMATION (IMPORTANT):
- Name: Dr. Mohammad Shekoor T
- Designation: Principal
- Department: Mechanical Engineering
- Email: principal@lbscek.ac.in
- Phone: 04994-250290
- Qualifications: Ph.D. from NIT Surathkal

DETAILED COLLEGE INFORMATION:
${formatFAQData()}

RESPONSE GUIDELINES:
- Keep responses concise but complete - ideal length is 2-4 sentences for simple queries
- For complex queries, structure with clear sections
- Always offer to provide more details if needed
- End responses with a helpful follow-up when appropriate
- For navigation, offer GPS assistance
- Use appropriate emojis sparingly (1-2 max per response)
- NEVER sound robotic - be natural and helpful

EXAMPLE NATURAL RESPONSES:
- "The library is open from 8:30 AM to 8:00 PM on weekdays. On weekends, it's a bit shorter - 10 AM to 4 PM on Sundays. Would you like to know about the digital library access too?"
- "ലൈബ്രറി രാവിലെ 8:30 മുതൽ വൈകുന്നേരം 8:00 വരെ തുറന്നിരിക്കും. ഡിജിറ്റൽ ലൈബ്രറി 24/7 ആക്സസ് ചെയ്യാം."
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing message:', message.substring(0, 100));

    // Detect language with improved patterns
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(message);
    const manglishPatterns = /\b(enthu|aanu|undoo|illa|venam|pokaam|vannoo|cheyyam|cheythu|eppol|evide|evideyanu|enne|ninne|njan|ningal|avar|ath|ithu|athu|engane|enthaanu|enikkum|njangal|nammal|kollaam|pattum|patilla|aaranu|edukkam|veno|vende|nokku|paranju|parayoo|ariyaam|ariyilla|evidunnu|ethra|entho|athe|namaskaram|nanni|sheriyaanu|angane|ingane|avalude|ivide|avide|kittum|kittilla|padikkam|padikkunnu|thudangi|kazhinjhu|varaam|varum|povaam|povum|cheyyan|cheyyanam|cheyth|koodi|koode|kure|valare|adipoli|pwoli|mathi|mathiyayo|venam|vendaa|onnu|randu|moonu|naalu|anchu|puthiya|pazhaya|nalla|mosham|kollam|ningalkku|enikku|avarku|ivarkku|athinnu|ithinnu|kazhinju|kazhiyum|parayan|parayaan|ariyaan|ariyilla)\b/i;
    const hasManglishPatterns = manglishPatterns.test(message);
    
    let detectedLanguage = 'english';
    if (hasMalayalam) {
      detectedLanguage = 'malayalam';
    } else if (hasManglishPatterns) {
      detectedLanguage = 'manglish';
    }

    console.log('Detected language:', detectedLanguage);

    // Build conversation messages with better context
    const messages = [
      { role: 'system', content: COLLEGE_CONTEXT },
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        detectedLanguage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
