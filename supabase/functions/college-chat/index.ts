import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Website URL mapping for priority lookup from lbscek.ac.in
const WEBSITE_URL_MAP: Record<string, { path: string; keywords: string[] }> = {
  principal: {
    path: '/principal/',
    keywords: ['principal', 'പ്രിൻസിപ്പൽ', 'head of institution', 'college head', 'principal aaranu', 'principal aaru']
  },
  deans: {
    path: '/deans-pg-ug/',
    keywords: ['dean', 'ഡീൻ', 'അക്കാദമിക് ഡീൻ', 'academic dean', 'student affairs dean', 'dean aaranu', 'dean aaru']
  },
  departments: {
    path: '/departments/',
    keywords: ['departments', 'department list', 'all departments', 'വിഭാഗങ്ങൾ']
  },
  admission: {
    path: '/admission-procedure/',
    keywords: ['admission procedure', 'how to apply', 'admission process', 'എങ്ങനെ അപ്ലൈ ചെയ്യാം']
  },
  contact: {
    path: '/contact-2/',
    keywords: ['contact us', 'college contact', 'phone number', 'email address']
  },
  college: {
    path: '/college/',
    keywords: ['about college', 'college history', 'about lbs', 'കോളേജിനെ കുറിച്ച്']
  },
  placement: {
    path: '/career-guidance-placement-unit-cgpu/',
    keywords: ['placement', 'cgpu', 'career guidance', 'placements', 'recruiters', 'job placement']
  },
  hostel: {
    path: '/hostels/',
    keywords: ['hostel', 'ഹോസ്റ്റൽ', 'accommodation', 'boys hostel', 'girls hostel', 'shahanas']
  }
};

// Function to determine which website URL to fetch based on user message
const getRelevantWebsiteUrl = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();

  for (const [key, config] of Object.entries(WEBSITE_URL_MAP)) {
    for (const keyword of config.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return `https://lbscek.ac.in${config.path}`;
      }
    }
  }
  return null;
};

// Parse HTML content to extract text (basic parsing for Deno edge function)
const parseHtmlToText = (html: string): string => {
  // Remove script and style tags with their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags but preserve some structure
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<[^>]+>/g, ' ');

  // Clean up whitespace
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
};

// Fetch and parse content from the college website
const fetchFromWebsite = async (url: string): Promise<string | null> => {
  try {
    console.log('Fetching from website:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LBS-College-Voice-Assistant/1.0',
        'Accept': 'text/html'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('Website fetch failed with status:', response.status);
      return null;
    }

    const html = await response.text();
    const textContent = parseHtmlToText(html);

    // Limit content length to avoid token overflow
    const maxLength = 2000;
    if (textContent.length > maxLength) {
      return textContent.substring(0, maxLength) + '...';
    }

    console.log('Successfully fetched website content, length:', textContent.length);
    return textContent;
  } catch (error) {
    console.error('Website fetch error:', error);
    return null;
  }
};

// Comprehensive college FAQ data
const COLLEGE_FAQ_DATA = [
  {
    "id": 1,
    "tags": ["courses", "programs", "admissions", "കോഴ്സുകൾ", "പ്രോഗ്രാമുകൾ", "ബിടെക്", "എംടെക്", "branches", "departments", "course enthu", "course enthokkeyanu", "branch enthokkeyanu", "btech courses", "mtech courses", "course und", "enthokke courses"],
    "answer_facts": {
      "UG Programs (B.Tech)": "Computer Science & Engineering (CSE), Electronics & Communication Engineering (ECE), Electrical & Electronics Engineering (EEE), Mechanical Engineering (ME), Civil Engineering (CE), Information Technology (IT)",
      "PG Programs": "M.Tech in Computer Science & Engineering, Master of Computer Applications (MCA)",
      "Annual Intake": "480 for UG programs, 18 for PG program in CSE",
      "Duration": "B.Tech: 4 years (8 semesters)",
      "Approval": "Approved by AICTE and affiliated to APJ Abdul Kalam Technological University",
      "Malayalam": "B.Tech കോഴ്സുകൾ: CSE, ECE, EEE, ME, CE, IT. M.Tech: Computer Science. ആകെ 480 UG സീറ്റുകൾ.",
      "Manglish": "B.Tech courses: CSE, ECE, EEE, ME, CE, IT. M.Tech: Computer Science. Total 480 UG seats und."
    }
  },
  {
    "id": 2,
    "tags": ["contact", "phone", "email", "address", "ഫോൺ", "ഇമെയിൽ", "വിലാസം", "നമ്പർ", "ബന്ധപ്പെടുക", "phone number enthu", "email enthu", "contact enthu", "number tharuo", "vilikkan number", "phone number tharo"],
    "answer_facts": {
      "Phone": "+91-4994-256300, +91-4994-256301",
      "Fax": "+91-4994-256302",
      "Email": "principal@lbscek.ac.in, office@lbscek.ac.in",
      "Admission Email": "admission@lbscek.ac.in",
      "Address": "LBS College of Engineering, Muliyar, Kasaragod District, Kerala - 671542, India",
      "Location": "Situated in Muliyar Panchayath, 12 km from Kasaragod town",
      "Website": "https://lbscek.ac.in",
      "Office Hours": "9:00 AM to 5:00 PM (Monday to Friday), 9:00 AM to 1:00 PM (Saturday)",
      "Malayalam": "ഫോൺ: +91-4994-256300. ഇമെയിൽ: principal@lbscek.ac.in. വിലാസം: LBS College of Engineering, Muliyar, Kasaragod - 671542.",
      "Manglish": "Phone: +91-4994-256300. Email: principal@lbscek.ac.in. Address: LBS College, Muliyar, Kasaragod - 671542."
    }
  },
  {
    "id": 3,
    "tags": ["library", "facilities", "timings", "ലൈബ്രറി", "പുസ്തകശാല", "സമയം", "ലൈബ്രറി സമയം", "library evide", "library time enthu", "library eppol thurakum", "library timing", "library evideyanu"],
    "answer_facts": {
      "Weekdays (Mon-Fri)": "8:30 AM to 8:00 PM",
      "Saturdays": "8:30 AM to 5:00 PM",
      "Sundays": "10:00 AM to 4:00 PM",
      "Exam Period": "Extended hours during university exams",
      "Digital Library": "24/7 access to online resources",
      "Collection": "Over 25,000 books, 100+ print journals, 5000+ e-journals",
      "Facilities": "Reading rooms, reference section, digital library, photocopying",
      "Malayalam": "ലൈബ്രറി സമയം: തിങ്കൾ-വെള്ളി 8:30 AM - 8:00 PM, ശനി 8:30 AM - 5:00 PM, ഞായർ 10:00 AM - 4:00 PM. 25,000+ പുസ്തകങ്ങൾ.",
      "Manglish": "Library timing: Mon-Fri 8:30 AM - 8:00 PM, Sat 8:30 AM - 5:00 PM, Sun 10:00 AM - 4:00 PM. 25,000+ books und."
    }
  },
  {
    "id": 4,
    "tags": ["admission", "apply", "procedure", "അഡ്മിഷൻ", "പ്രവേശനം", "എങ്ങനെ ചേരാം", "KEAM", "കീം", "admission engane", "admission procedure enthu", "engane cheraam", "engane apply cheyyam", "admission kittaan", "eligibility enthu", "apply cheyyaan"],
    "answer_facts": {
      "Application Mode": "Through KEAM (Kerala Engineering Architecture Medical) counselling",
      "Eligibility": "10+2 with minimum 50% marks in Physics, Chemistry, and Mathematics",
      "Entrance Exam": "KEAM score is mandatory",
      "Lateral Entry": "Diploma holders can apply for direct second year admission",
      "NRI Quota": "15% seats reserved for NRI candidates",
      "Management Quota": "Available as per government norms",
      "Important Dates": "KEAM application usually opens in January, counselling in June-July",
      "Documents Required": "KEAM rank card, 10th & 12th marksheets, transfer certificate, conduct certificate, passport size photos",
      "Malayalam": "അഡ്മിഷൻ KEAM കൗൺസിലിംഗ് വഴി. യോഗ്യത: +2 ൽ Physics, Chemistry, Maths ൽ 50% മാർക്ക്.",
      "Manglish": "Admission KEAM counselling vazhi. Eligibility: +2 il Physics, Chemistry, Maths il 50% marks venam."
    }
  },
  {
    "id": 5,
    "tags": ["fees", "fee structure", "tuition", "ഫീസ്", "ഫീസ് എത്ര", "പണം", "ചെലവ്", "fee ethra", "fee ethranu", "fees enthu", "fee structure enthu", "college fee", "tuition fee ethra", "fee kitty", "panam ethra venam"],
    "answer_facts": {
      "Government Seat Fees": "Approximately ₹45,000 per year",
      "Management Seat Fees": "Approximately ₹75,000 per year",
      "NRI Quota Fees": "Approximately $3,000 per year",
      "Other Fees": "Caution deposit (refundable): ₹5,000, Library fee: ₹1,500, Exam fee: ₹2,000 per semester",
      "Hostel Fees": "Approximately ₹35,000 per year including food",
      "Payment Mode": "Online payment available through college portal",
      "Scholarships": "Merit scholarships, SC/ST scholarships, EWS scholarships available",
      "Malayalam": "ഗവൺമെന്റ് സീറ്റ് ഫീസ്: ₹45,000 പ്രതിവർഷം. മാനേജ്മെന്റ് സീറ്റ്: ₹75,000. ഹോസ്റ്റൽ: ₹35,000.",
      "Manglish": "Government seat fee: ₹45,000 per year. Management seat: ₹75,000. Hostel: ₹35,000."
    }
  },
  {
    "id": 6,
    "tags": ["hostel", "accommodation", "boarding", "ഹോസ്റ്റൽ", "താമസം", "ബോയ്സ് ഹോസ്റ്റൽ", "ഗേൾസ് ഹോസ്റ്റൽ", "ഷഹാനാസ് ഹോസ്റ്റൽ", "hostel undoo", "hostel evideyanu", "boys hostel evide", "girls hostel evide", "shahanas hostel", "hostel fee ethra", "thamasu", "accommodation und"],
    "answer_facts": {
      "Boys Hostel": "Separate hostel blocks with capacity for 300 students",
      "Girls Hostel": "Secure hostel with capacity for 200 students, known as Shahanas Hostel",
      "Rooms": "Single, double, and triple sharing rooms available",
      "Facilities": "Wi-Fi, reading room, TV room, indoor games, gym, laundry",
      "Mess": "Separate vegetarian and non-vegetarian mess with North & South Indian food",
      "Security": "24/7 security, CCTV surveillance, warden supervision",
      "Medical": "First aid facility, tie-up with nearby hospitals",
      "Visiting Hours": "Parents can visit on weekends with prior permission",
      "Malayalam": "ബോയ്സ് ഹോസ്റ്റൽ: 300 പേർക്ക്. ഗേൾസ് ഹോസ്റ്റൽ (ഷഹാനാസ്): 200 പേർക്ക്. Wi-Fi, gym, mess ഉണ്ട്.",
      "Manglish": "Boys hostel: 300 students ku. Girls hostel (Shahanas): 200 students ku. Wi-Fi, gym, mess und."
    }
  },
  {
    "id": 7,
    "tags": ["placement", "jobs", "career", "recruitment", "പ്ലേസ്മെന്റ്", "ജോലി", "കമ്പനികൾ", "ശമ്പളം", "പാക്കേജ്", "placement undoo", "job kittuo", "placement ethra percentage", "highest package ethra", "companies enthokkeyanu", "placement rate ethra", "job enthu", "salary ethra"],
    "answer_facts": {
      "Placement Cell": "Dedicated Training & Placement Cell with full-time coordinator",
      "Companies Visited": "TCS, Infosys, Wipro, Tech Mahindra, Cognizant, Bosch, BYJU'S, etc.",
      "Highest Package": "₹12 LPA (2023 batch)",
      "Average Package": "₹4.5 LPA",
      "Placement Rate": "85% of eligible students placed",
      "Training Programs": "Aptitude training, technical workshops, mock interviews, GD sessions",
      "Internships": "Summer internships with stipend in reputed companies",
      "Malayalam": "ഏറ്റവും ഉയർന്ന പാക്കേജ്: ₹12 LPA. ശരാശരി: ₹4.5 LPA. 85% വിദ്യാർത്ഥികൾക്ക് പ്ലേസ്മെന്റ്. TCS, Infosys, Wipro വരുന്നു.",
      "Manglish": "Highest package: ₹12 LPA. Average: ₹4.5 LPA. 85% students ku placement kittum. TCS, Infosys, Wipro okke varum.",
      "Higher Studies": "Guidance for GATE, CAT, GRE, TOEFL exams"
    }
  },
  {
    "id": 8,
    "tags": ["location", "directions", "map", "സ്ഥലം", "വഴി", "എവിടെ", "എങ്ങനെ എത്തും", "കാംപസ്", "college evide", "college evideyanu", "lbs evide", "location enthu", "address enthu", "campus evide", "engane ethum", "route enthu"],
    "answer_facts": {
      "Full Name": "Lal Bahadur Shastri College of Engineering, Kasaragod",
      "Address": "LBS College of Engineering, Muliyar, Kasaragod District, Kerala - 671542",
      "Campus Area": "52 acres of land at Povval",
      "Distance from Town": "12 km from Kasaragod town",
      "Nearest Airport": "Mangaluru Airport (Mangalore International Airport)",
      "Nearest Railway": "Kasaragod Railway Station",
      "Tourist Attractions Nearby": "Bekal Fort, Madhur temple, Ananthapuri temple",
      "GPS Coordinates": "12.5960° N, 75.0300° E",
      "Malayalam": "കോളേജ് മുളിയാർ, കാസർഗോഡ് നിന്ന് 12 km ദൂരെ. 52 ഏക്കർ ക്യാംപസ്. അടുത്തുള്ള റയിൽവേ സ്റ്റേഷൻ: കാസർഗോഡ്.",
      "Manglish": "College Muliyar il aanu, Kasaragod ninnu 12 km doore. 52 acre campus. Nearest railway station: Kasaragod."
    }
  },
  {
    "id": 9,
    "tags": ["timings", "hours", "schedule", "സമയം", "എപ്പോൾ തുറക്കും", "ക്ലാസ് സമയം", "ഓഫീസ് സമയം", "timing enthu", "time enthu", "eppol thurakum", "college time enthu", "class time enthu", "office time enthu", "samayam enthu"],
    "answer_facts": {
      "College Hours": "9:00 AM to 4:30 PM (Monday to Friday)",
      "Office Hours": "9:00 AM to 5:00 PM (Monday to Friday), 9:00 AM to 1:00 PM (Saturday)",
      "Class Timing": "9:15 AM to 4:00 PM with lunch break from 1:00 PM to 1:45 PM",
      "Library Hours": "8:30 AM to 8:00 PM (Weekdays), 8:30 AM to 5:00 PM (Saturday), 10:00 AM to 4:00 PM (Sunday)",
      "Computer Center": "8:30 AM to 8:00 PM (All days)",
      "Holidays": "Follows Kerala Government and University holidays",
      "Examination Period": "Special timings during university exams",
      "Malayalam": "കോളേജ് സമയം: 9:00 AM - 4:30 PM (തിങ്കൾ-വെള്ളി). ഓഫീസ്: 9:00 AM - 5:00 PM. ലൈബ്രറി: 8:30 AM - 8:00 PM.",
      "Manglish": "College timing: 9:00 AM - 4:30 PM (Mon-Fri). Office: 9:00 AM - 5:00 PM. Library: 8:30 AM - 8:00 PM."
    }
  },
  {
    "id": 10,
    "tags": ["sports", "games", "gym", "സ്പോർട്സ്", "കളികൾ", "ജിം", "ക്രിക്കറ്റ്", "ഫുട്ബോൾ", "sports undoo", "gym undoo", "ground evide", "football ground evide", "cricket ground evide", "kalikkaan pattuo"],
    "answer_facts": {
      "Main Stadium": "College main stadium on campus",
      "Multi-sports Area": "Multi-sports play space available",
      "Playground": "Large playground for cricket, football, volleyball",
      "Indoor Stadium": "Multi-purpose indoor stadium for badminton, table tennis, chess",
      "Gymnasium": "Well-equipped gym with trainer",
      "Sports Offered": "Cricket, football, basketball, volleyball, badminton, table tennis, chess, carrom",
      "Annual Sports": "Inter-collegiate tournaments, annual sports meet",
      "Coaching": "Professional coaching available for major sports",
      "Malayalam": "സ്പോർട്സ്: ക്രിക്കറ്റ്, ഫുട്ബോൾ, വോളിബോൾ, ബാഡ്മിന്റൺ. ജിം, സ്റ്റേഡിയം, ഇൻഡോർ സ്റ്റേഡിയം ഉണ്ട്.",
      "Manglish": "Sports: cricket, football, volleyball, badminton okke und. Gym, stadium, indoor stadium und."
    }
  },
  {
    "id": 11,
    "tags": ["labs", "laboratories", "facilities", "ലാബ്", "ലാബോറട്ടറി", "കംപ്യൂട്ടർ ലാബ്"],
    "answer_facts": {
      "Computer Labs": "8 computer labs with 400+ systems, high-speed internet",
      "Department Labs": "Separate labs for each engineering department",
      "Special Labs": "CAD/CAM lab, DSP lab, VLSI lab, Networking lab",
      "Equipment": "Modern equipment as per AICTE and university norms",
      "Software": "Licensed software: MATLAB, AutoCAD, ANSYS, Oracle, etc.",
      "Timings": "8:30 AM to 8:00 PM (All days including weekends during project work)",
      "Research Centers": "Mechanical Engineering and Computer Science & Engineering recognized as research centres",
      "Technicians": "Qualified lab technicians and assistants",
      "Malayalam": "8 കംപ്യൂട്ടർ ലാബുകൾ, 400+ സിസ്റ്റംസ്. എല്ലാ ഡിപ്പാർട്ട്മെന്റുകളിലും പ്രത്യേക ലാബുകൾ.",
      "Manglish": "8 computer labs, 400+ systems. Ella departments ilum separate labs und."
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
    "tags": ["principal", "admin", "head", "authority", "പ്രിൻസിപ്പൽ", "മേധാവി", "തലവൻ", "പ്രിൻസിപ്പൽ ആരാണ്"],
    "answer_facts": {
      "Name": "Dr. Mohammad Shekoor T",
      "Designation": "Principal",
      "Department": "Mechanical Engineering",
      "Email": "principal@lbscek.ac.in",
      "Phone": "04994-250290",
      "Qualifications": "Ph.D. from NIT Surathkal",
      "Role": "Head of the Institution",
      "Malayalam": "പ്രിൻസിപ്പൽ: ഡോ. മൊഹമ്മദ് ഷെക്കൂർ ടി. ഫോൺ: 04994-250290. ഇമെയിൽ: principal@lbscek.ac.in. മെക്കാനിക്കൽ എഞ്ചിനീയറിംഗ് വിഭാഗം.",
      "Manglish": "Principal: Dr. Mohammad Shekoor T aanu. Phone: 04994-250290. Email: principal@lbscek.ac.in. Mechanical Engineering department il ninnu."
    }
  },
  {
    "id": 26,
    "tags": ["dean", "academic dean", "student affairs dean", "ug dean", "അക്കാദമിക് ഡീൻ", "ഡീൻ", "ഡീൻ ആരാണ്", "അക്കാദമിക് ഡീൻ ആരാണ്", "dean aaru", "dean aaranu"],
    "answer_facts": {
      "UG Dean (Academic)": "Dr. Praveen Kumar K",
      "Academic Dean Department": "Professor, Computer Science & Engineering (CSE)",
      "Academic Dean Phone": "9447375156",
      "Academic Dean Email": "praveenkodoth@lbscek.ac.in",
      "UG Dean (Student Affairs)": "Dr. Vinodu George",
      "Student Affairs Dean Department": "Professor, Computer Science & Engineering (CSE)",
      "Student Affairs Dean Phone": "9447386534",
      "Student Affairs Dean Email": "vinodu@lbscek.ac.in",
      "Malayalam_Academic_Dean": "അക്കാദമിക് ഡീൻ (UG): ഡോ. പ്രവീൺ കുമാർ കെ. CSE വിഭാഗം പ്രൊഫസർ. ഫോൺ: 9447375156. ഇമെയിൽ: praveenkodoth@lbscek.ac.in",
      "Malayalam_Student_Dean": "സ്റ്റുഡന്റ് അഫയേഴ്സ് ഡീൻ (UG): ഡോ. വിനോദു ജോർജ്. CSE വിഭാഗം പ്രൊഫസർ. ഫോൺ: 9447386534",
      "Manglish": "Academic Dean: Dr. Praveen Kumar K aanu. CSE Professor. Phone: 9447375156. Student Affairs Dean: Dr. Vinodu George aanu."
    }
  },
  {
    "id": 27,
    "tags": ["hod", "head of department", "department head", "മേധാവി", "വിഭാഗം മേധാവി", "HOD ആരാണ്", "cse hod", "ece hod", "eee hod", "me hod", "civil hod", "കമ്പ്യൂട്ടർ സയൻസ് മേധാവി", "കമ്പ്യൂട്ടർ സയൻസ് ഡിപ്പാർട്ട്മെന്റ് മേധാവി", "cse department head"],
    "answer_facts": {
      "CSE Department HOD": "Dr. Manoj Kumar G (Professor). Phone: 8547458075, Email: manojkumar@lbscek.ac.in",
      "IT Department HOD": "Dr. Anver S R (Professor)",
      "ECE Department HOD": "Dr. Mary Reena K E (Professor)",
      "EEE Department HOD": "Prof. Jayakumar M (Associate Professor)",
      "Mechanical Department HOD": "Dr. Manoj Kumar C V (Associate Professor)",
      "Civil Department HOD": "Dr. Anjali M S (Associate Professor)",
      "Applied Science HOD": "Prof. Vineesh Kumar K V (Assistant Professor, Mathematics)",
      "Malayalam_CSE_HOD": "കമ്പ്യൂട്ടർ സയൻസ് വിഭാഗം HOD: ഡോ. മനോജ് കുമാർ ജി (പ്രൊഫസർ). ഫോൺ: 8547458075. ഇമെയിൽ: manojkumar@lbscek.ac.in",
      "Malayalam_All_HOD": "CSE HOD: ഡോ. മനോജ് കുമാർ ജി. ECE HOD: ഡോ. മേരി റീന. EEE HOD: പ്രൊഫ. ജയകുമാർ. ME HOD: ഡോ. മനോജ് കുമാർ സി വി. Civil HOD: ഡോ. അഞ്ജലി.",
      "Manglish": "CSE HOD: Dr. Manoj Kumar G. ECE HOD: Dr. Mary Reena. EEE HOD: Prof. Jayakumar. ME HOD: Dr. Manoj Kumar CV. Civil HOD: Dr. Anjali."
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
  },
  {
    "id": 58,
    "tags": ["governing body", "administration", "chairman", "pinarayi vijayan", "r bindu", "sharmila mary joseph", "abdul rahiman", "thamban nair"],
    "answer_facts": {
      "Chairman, Governing Body": "Sri. Pinarayi Vijayan (Hon. Chief Minister)",
      "Vice Chairperson, Governing Body": "Dr. R. Bindu (Hon. Minister for Higher Education)",
      "Chairperson, Executive Committee": "Dr. Sharmila Mary Joseph IAS (Principal Secretary)",
      "Member Secretary, LBS Centre for Science & Technology": "Prof. (Dr.) M. Abdul Rahiman",
      "Chairman, Board of Governors (BoG)": "Prof. M. Thamban Nair",
      "Principal": "Dr. Mohammad Shekoor T",
      "Administrative Officer": "Mr. Ajesh S",
      "Senior Superintendent": "Mr. Santhosh Kumar K",
      "Junior Superintendent": "Mrs. Shaina Pacha",
      "Head Accountant": "Mr. Aneesh Mohan C S"
    }
  },
  {
    "id": 59,
    "tags": ["cse faculty", "computer science faculty", "cse teachers", "cse professors", "praveen kumar", "vinodu george", "manoj kumar g", "anver", "jayalekshmi", "sulphikar", "rahul c", "hod cse", "dean", "academic dean", "അക്കാദമിക് ഡീൻ", "ഡീൻ", "മേധാവി", "കമ്പ്യൂട്ടർ സയൻസ് മേധാവി", "cse hod", "cse head", "department head"],
    "answer_facts": {
      "UG Dean (Academic)": "Dr. Praveen Kumar K (Professor, CSE Department). Mobile: 9447375156, Email: praveenkodoth@lbscek.ac.in",
      "UG Dean (Student Affairs)": "Dr. Vinodu George (Professor, CSE Department). Mobile: 9447386534, Email: vinodu@lbscek.ac.in",
      "CSE Department HOD": "Dr. Manoj Kumar G (Professor). Mobile: 8547458075, Email: manojkumar@lbscek.ac.in",
      "Professor & HOD (IT)": "Dr. Anver S R",
      "Professor": "Dr. Jayalekshmi S",
      "Associate Professors": "Dr. Sulphikar A, Dr. Rahul C",
      "Assistant Professors": "Prof. Binoy D M Panikar, Prof. Safarunisa K M, Prof. Rajesh Kumar P M, Prof. Reema K V, Prof. Nishy Reshmi S, Prof. Lijin Das S, Prof. Krishnaprasad P K, Dr. Sarith Divakar M, Prof. Indu K B, Prof. Baby Sunitha V P, Prof. Fathimath Sameera M A, Prof. Vengayil Nayana Murali, Prof. Sajina K., Prof. Prathima A, Prof. Rasna P, Prof. Navami Aravind A, Prof. Geetha A V, Prof. Arathi S S, Prof. Sandra Mercelin",
      "Total CSE Faculty": "26 faculty members",
      "Malayalam_Dean": "അക്കാദമിക് ഡീൻ: ഡോ. പ്രവീൺ കുമാർ കെ (CSE പ്രൊഫസർ). ഫോൺ: 9447375156",
      "Malayalam_HOD": "കമ്പ്യൂട്ടർ സയൻസ് വിഭാഗം മേധാവി (HOD): ഡോ. മനോജ് കുമാർ ജി (പ്രൊഫസർ). ഫോൺ: 8547458075",
      "Manglish_Dean": "Academic Dean: Dr. Praveen Kumar K aanu. Phone: 9447375156",
      "Manglish_HOD": "CSE Department HOD: Dr. Manoj Kumar G aanu. Phone: 8547458075"
    }
  },
  {
    "id": 60,
    "tags": ["it faculty", "information technology faculty", "it teachers", "it professors", "smithamol", "seena thomas", "ayshath sithara"],
    "answer_facts": {
      "Professor": "Dr. Smithamol M B",
      "Assistant Professors": "Prof. Seena Thomas, Prof. Ayshath Sithara, Prof. Seetha Das V, Prof. Dhanyashree A S, Prof. Ramya P M, Prof. Sreejai, Prof. Nimitha Raj",
      "Total IT Faculty": "8 faculty members"
    }
  },
  {
    "id": 61,
    "tags": ["mechanical faculty", "me faculty", "mechanical teachers", "mechanical professors", "manoj kumar cv", "mahesh pv", "swaraj kumar", "hod mechanical"],
    "answer_facts": {
      "Associate Professor & HOD": "Dr. Manoj Kumar C V",
      "Associate Professors": "Prof. Mahesh P V, Dr. Swaraj Kumar B, Dr. Anil Kumar B C",
      "Assistant Professors": "Prof. Jowhar Mubarak, Prof. Vinod O M, Prof. Sreejith M, Prof. Prajina N V, Prof. Mukul Joseph, Prof. Latheesh Bharathan, Prof. Aswanth K, Prof. Kamaljith K",
      "Total Mechanical Faculty": "12 faculty members"
    }
  },
  {
    "id": 62,
    "tags": ["ece faculty", "electronics faculty", "ece teachers", "ece professors", "mary reena", "sheeba k", "pramod p", "hod ece"],
    "answer_facts": {
      "Professor & HOD": "Dr. Mary Reena K E",
      "Professors": "Dr. Sheeba K, Dr. Pramod P",
      "Associate Professors": "Prof. Santo Mathew, Dr. Arathi T",
      "Assistant Professors": "Dr. Baiju P S, Dr. Anusree L, Dr. Anitha K, Prof. Zainaba Abdulrahiman, Prof. Vaishnavi T V",
      "Total ECE Faculty": "10 faculty members"
    }
  },
  {
    "id": 63,
    "tags": ["eee faculty", "electrical faculty", "eee teachers", "eee professors", "jayakumar m", "rajashree raghavan", "visalakshi", "hod eee"],
    "answer_facts": {
      "Associate Professor & HOD": "Prof. Jayakumar M",
      "Professor": "Dr. Rajashree Raghavan",
      "Associate Professors": "Dr. Visalakshi V, Prof. Baby Sindhu A V, Dr. Aseem K",
      "Assistant Professors": "Dr. Sheeja V, Dr. Kannan M, Prof. Abhilash V Nair, Prof. Anish Joseph Jacob, Prof. Arun S Mathew, Prof. Mujeeb Rahuman, Prof. Seena K R",
      "Total EEE Faculty": "12 faculty members"
    }
  },
  {
    "id": 64,
    "tags": ["civil faculty", "civil engineering faculty", "civil teachers", "civil professors", "anjali ms", "arun nr", "hod civil"],
    "answer_facts": {
      "Associate Professor & HOD": "Dr. Anjali M S",
      "Assistant Professors": "Dr. Arun N R, Prof. Merlin R, Prof. Sruthi M, Prof. Sreevidya V, Prof. Jisha K V, Prof. Anjali M, Prof. Drisya M D, Prof. Athira Suresh, Prof. Sarga P Surendran",
      "Total Civil Faculty": "10 faculty members"
    }
  },
  {
    "id": 65,
    "tags": ["applied science faculty", "physics faculty", "chemistry faculty", "mathematics faculty", "english faculty", "vineesh kumar", "hod applied science"],
    "answer_facts": {
      "HOD & Assistant Professor (Mathematics)": "Prof. Vineesh Kumar K V",
      "Mathematics Faculty": "Prof. Ramya M R, Prof. Smitha P, Prof. Rabiyathul Hadaviyya",
      "Chemistry Faculty": "Prof. Fathimath Ruksana A K, Dr. Dhanya Balan A P",
      "Physics Faculty": "Prof. Akhil Kumar A, Prof. Darshana N P",
      "Economics Faculty": "Prof. Jasir M H",
      "English Faculty": "Prof. Rajesh A, Prof. Vishnupriya V S",
      "Total Applied Science Faculty": "11 faculty members"
    }
  },
  {
    "id": 66,
    "tags": ["library staff", "librarian", "physical education", "vinod kumar kt", "beena varghese", "joshua py"],
    "answer_facts": {
      "Librarian": "Mr. Vinod Kumar K T",
      "Librarian Grade IV": "Mrs. Beena Varghese",
      "Assistant Professor, Physical Education": "Prof. Joshua P Y"
    }
  },
  {
    "id": 67,
    "tags": ["clubs", "student clubs", "iedc", "iedc clubs", "technical clubs", "list of clubs"],
    "answer_facts": {
      "IEDC Clubs": "MULEARN, TINKERHUB, FOSS CLUB, CYBER COMMUNITY, MSA (Microsoft Learn Student Ambassadors), CODERS CLUB, GALAXIA CLUB, GDG on Campus, YIP CLUB, WOMEN TECH MAKERS, KBA CHAPTER, WOW, AWS CLOUD CLUB",
      "Technical Clubs": "IEEE Student Branch, CSI, ISTE, IETE, SAE",
      "Cultural Clubs": "Music Club, Dance Club, Drama Club, Fine Arts Club",
      "Other Clubs": "Entrepreneurship Cell, Literary Club, Photography Club, Nature Club",
      "Total Student Clubs": "20+ active clubs on campus"
    }
  },
  {
    "id": 68,
    "tags": ["mulearn", "mulearn club", "learning platform"],
    "answer_facts": {
      "Name": "MULEARN",
      "Type": "IEDC Club - Learning Platform",
      "Description": "Mulearn is an innovative learning platform that offers personalized educational experiences through adaptive technology, interactive content, and community collaboration. It enables learners to acquire new skills and knowledge at their own pace, with expert instructors and engaging content tailored to meet personal and professional development needs."
    }
  },
  {
    "id": 69,
    "tags": ["tinkerhub", "tinkerhub foundation", "makers", "innovators"],
    "answer_facts": {
      "Name": "TINKERHUB",
      "Type": "IEDC Club - Innovation Community",
      "Description": "TinkerHub Foundation is a community of tinkerers, makers & students - working towards mapping and empowering people who share a passion to innovate."
    }
  },
  {
    "id": 70,
    "tags": ["foss", "foss club", "open source", "free software"],
    "answer_facts": {
      "Name": "FOSS CLUB LBSCEK",
      "Type": "IEDC Club - Open Source Community",
      "Description": "FOSS Club LBSCEK is a community of students passionate about Free and Open Source Software. We believe in learning, sharing, and contributing – the open way. Our club creates a space for collaboration, creativity, and innovation using open technologies."
    }
  },
  {
    "id": 71,
    "tags": ["cyber", "cyber community", "cybersecurity", "ethical hacking", "security"],
    "answer_facts": {
      "Name": "CYBER COMMUNITY",
      "Type": "IEDC Club - Cybersecurity",
      "Description": "Cyber Community at LBSCEK is a student-led learning and research group focused on practical cybersecurity, ethical hacking, and responsible use of technology. We bring together curious students from all departments to learn, build, and defend — not for show, but to gain real skills that matter in industry and research.",
      "Activities": "Hands-on workshops, expert talks, project-based learning, community awareness drives, and competitions",
      "Focus": "Learning-by-doing, building a sustainable student-run ecosystem where knowledge is shared, skills are practiced, and leadership is grown"
    }
  },
  {
    "id": 72,
    "tags": ["msa", "mlsa", "microsoft", "microsoft learn", "student ambassadors"],
    "answer_facts": {
      "Name": "MSA - Microsoft Learn Student Ambassadors",
      "Type": "IEDC Club - Microsoft Global Initiative",
      "Description": "The Microsoft Learn Student Ambassadors (MLSA) program is a global initiative by Microsoft designed to empower students to become campus leaders in technology, innovation, and community building.",
      "Benefits": "Exclusive access to Microsoft resources, mentorship, and certifications",
      "Technologies": "Azure, Power Platform, GitHub, AI, and more",
      "Skills Developed": "Technical expertise, leadership, communication, and problem-solving skills through hosting events, mentoring peers, and contributing to real-world projects"
    }
  },
  {
    "id": 73,
    "tags": ["coders club", "coding", "programming", "coding club"],
    "answer_facts": {
      "Name": "CODERS CLUB",
      "Type": "IEDC Club - Programming Community",
      "Description": "Coders Club is the hub for all things programming at LBS College of Engineering Kasaragod. We bring together students who are curious about coding, problem-solving, and building real-world projects.",
      "Activities": "Workshops, coding sessions, and competitions",
      "Mission": "Create a collaborative space where ideas turn into skills, and skills turn into innovation. We help beginners take their first steps in programming while also challenging advanced learners to push their limits."
    }
  },
  {
    "id": 74,
    "tags": ["galaxia", "galaxia club", "space club", "astronomy", "space science"],
    "answer_facts": {
      "Name": "GALAXIA CLUB",
      "Type": "IEDC Club - Space Science & Astronomy",
      "Description": "Galaxia is the official space club of LBS College of Engineering, Kasaragod. The club is dedicated to cultivating an interest in space science, astronomy, and space technology among students.",
      "Focus": "Fostering innovation, curiosity, and scientific temper by connecting students with experts and real-world applications of space tech",
      "Activities": "Broad spectrum of events and activities, building a vibrant campus community passionate about exploring the universe"
    }
  },
  {
    "id": 75,
    "tags": ["gdg", "google developer groups", "google developers", "gdg on campus"],
    "answer_facts": {
      "Name": "GDG (Google Developer Groups) on Campus LBSCEK",
      "Type": "IEDC Club - Google Developer Community",
      "Description": "GDG on Campus LBSCEK is a newly established student community at LBS College of Engineering, Kasaragod. The club brings together developers, designers, and tech enthusiasts who are eager to learn, build, and innovate with Google technologies.",
      "Focus Areas": "Web and mobile development, AI/ML, cloud computing, and design thinking",
      "Goal": "Inspire curiosity, foster innovation, and help students grow into future-ready developers and leaders through peer learning, workshops, and collaborations"
    }
  },
  {
    "id": 76,
    "tags": ["yip", "yip club", "k-disc", "innovation council"],
    "answer_facts": {
      "Name": "YIP CLUB",
      "Type": "IEDC Club - Kerala Government Initiative",
      "Description": "YIP (Young Innovators Programme) is a key initiative of Kerala's K-DISC (Kerala Development and Innovation Strategic Council) that empowers students to create real-world solutions that drive sustainable and equitable development."
    }
  },
  {
    "id": 77,
    "tags": ["women tech makers", "wtm", "google women", "women in tech"],
    "answer_facts": {
      "Name": "WOMEN TECH MAKERS",
      "Type": "IEDC Club - Google Women in Tech Program",
      "Description": "Google's Women Techmakers (WTM) is a global program that provides visibility, community, and resources for women in technology, aiming to empower and encourage them to pursue and excel in tech careers."
    }
  },
  {
    "id": 78,
    "tags": ["kba", "kba chapter", "blockchain", "kerala blockchain academy"],
    "answer_facts": {
      "Name": "KBA CHAPTER - Kerala Blockchain Academy LBSCEK",
      "Type": "IEDC Club - Blockchain Technology",
      "Description": "KBA LBSCEK is the official Kerala Blockchain Academy Chapter of LBS College of Engineering, Kasaragod. The chapter is committed to promoting awareness, learning, and innovation in blockchain technology among students.",
      "Activities": "Workshops, talks, and hands-on projects exploring blockchain in real-world applications",
      "Focus": "Nurturing technical expertise, entrepreneurial thinking, and innovation by bridging students with industry leaders and cutting-edge advancements in decentralized technologies"
    }
  },
  {
    "id": 79,
    "tags": ["wow", "women of wonder", "women empowerment", "wow club"],
    "answer_facts": {
      "Name": "WOW (Women of Wonder) Club",
      "Type": "IEDC Club - Women Empowerment",
      "Description": "The Women of Wonder (WOW) Club is a student-led initiative that empowers women through creativity, leadership, and social impact. It provides an inclusive space where students can voice their ideas, showcase talents, and inspire positive change."
    }
  },
  {
    "id": 80,
    "tags": ["aws", "aws club", "aws cloud club", "amazon", "cloud computing"],
    "answer_facts": {
      "Name": "AWS CLOUD CLUB",
      "Type": "IEDC Club - Amazon Web Services",
      "Description": "An AWS Cloud Club is a student-led community recognized by Amazon Web Services. It helps students learn cloud computing, build projects, and grow career skills with AWS.",
      "Leadership": "Each club is guided by a Faculty Advisor and a Campus Lead (student leader)",
      "Focus": "Cloud computing, AWS services, hands-on projects, and career development"
    }
  },
  {
    "id": 81,
    "tags": ["bus", "bus routes", "college bus", "transport", "bus number", "ബസ്", "ബസ് റൂട്ട്", "bus evidunnu", "bus undoo", "bus evide"],
    "answer_facts": {
      "Bus 1": "Melparamb Route",
      "Bus 2": "Kanhangad Route",
      "Bus 3": "Kasaragod Route",
      "Bus 4": "Periya Route",
      "Bus 5": "Pallikara Route",
      "Bus 6": "Nileshwaram Route",
      "Total Buses": "6 college buses operating on different routes",
      "Malayalam": "കോളേജിന് 6 ബസ്സുകൾ ഉണ്ട്: മേൽപറമ്പ്, കാഞ്ഞങ്ങാട്, കാസർഗോഡ്, പെരിയ, പള്ളിക്കര, നീലേശ്വരം റൂട്ടുകളിൽ",
      "Manglish": "College nu 6 bus und: Melparamb, Kanhangad, Kasaragod, Periya, Pallikara, Nileshwaram routes il"
    }
  },
  {
    "id": 82,
    "tags": ["bus fee", "bus timing", "kasaragod bus", "bus pickup", "transport fee", "ബസ് ഫീസ്", "ബസ് സമയം", "bus ethra", "bus fee ethra", "bus time enthu"],
    "answer_facts": {
      "Pallikkara": "Pickup: 8:10 AM | Student Fee: ₹11,910 | Staff Fee: ₹14,810",
      "Bekal": "Pickup: 8:15 AM | Student Fee: ₹11,180 | Staff Fee: ₹13,860",
      "Palakkunnu": "Pickup: 8:20 AM | Student Fee: ₹10,530 | Staff Fee: ₹13,130",
      "Uduma": "Pickup: 8:25 AM | Student Fee: ₹10,060 | Staff Fee: ₹12,500",
      "Kalanadu": "Pickup: 8:30 AM | Student Fee: ₹9,420 | Staff Fee: ₹11,660",
      "Melparamba": "Pickup: 8:35 AM | Student Fee: ₹8,960 | Staff Fee: ₹11,240",
      "Chaliyancode": "Pickup: 8:40 AM | Student Fee: ₹8,580 | Staff Fee: ₹10,710",
      "Chemnad": "Pickup: 8:45 AM | Student Fee: ₹8,500 | Staff Fee: ₹10,290",
      "Kasaragod": "Pickup: 8:50 AM | Student Fee: ₹8,400 | Staff Fee: ₹10,200",
      "Vidya Nagar": "Pickup: 8:55 AM | Student Fee: ₹5,630 | Staff Fee: ₹6,930",
      "Nalam Mile": "Pickup: 9:00 AM | Student Fee: ₹4,530 | Staff Fee: ₹5,570",
      "Cherkala": "Pickup: 9:05 AM | Student Fee: ₹3,420 | Staff Fee: ₹4,200",
      "Malayalam_Note": "കാസർഗോഡ് സൈഡിൽ നിന്ന് രാവിലെ 8:10 മുതൽ 9:05 വരെ ബസ് പിക്കപ്പ് ഉണ്ട്. സ്റ്റുഡന്റ് ഫീസ് ₹3,420 മുതൽ ₹11,910 വരെ",
      "Manglish_Note": "Kasaragod side il ninnu ravile 8:10 muthal 9:05 vare bus pickup und. Student fee ₹3,420 muthal ₹11,910 vare aanu"
    }
  },
  {
    "id": 83,
    "tags": ["fee structure", "btech fee", "college fee", "tuition fee", "fees 2025", "fee ethra", "ഫീസ്", "fee structure 2025-26", "sc fee", "st fee", "oec fee", "sc st fee", "reserved category fee", "sc student fee", "st student fee", "obc fee", "sebc fee", "merit fee", "high fee seat"],
    "answer_facts": {
      "B.Tech Regular Merit Seat": "₹56,870 (Net Fee Payable to College, includes KTU fees)",
      "B.Tech Regular High Fee Seat": "₹88,370",
      "B.Tech Regular SC/ST/OEC": "₹1,000",
      "B.Tech Regular Fee Waiver (FW)": "₹18,620",
      "B.Tech LET Merit": "₹49,200 + KTU ₹7,670",
      "B.Tech LET Fee Waiver": "₹10,950 + KTU ₹7,670",
      "B.Tech LET SC/ST/OEC": "₹1,000 (KTU fees Nil)",
      "M.Tech Total": "₹44,880 (College ₹37,950 + KTU ₹6,930)",
      "Academic Year": "2025-26",
      "Malayalam": "B.Tech Merit സീറ്റിന് ₹56,870 ആണ് ഫീസ്. SC/ST/OEC ക്ക് ₹1,000 മാത്രം. M.Tech ന് ₹44,880 ആണ്.",
      "Manglish": "B.Tech Merit seat nu ₹56,870 aanu fee. SC/ST/OEC kku ₹1,000 mathram. M.Tech nu ₹44,880 aanu."
    }
  },
  {
    "id": 84,
    "tags": ["miscellaneous fee", "pta fee", "placement fee", "union fee", "other fees"],
    "answer_facts": {
      "PTA Membership": "₹5,000",
      "Department Association": "₹1,000",
      "Career Guidance & Placement": "₹500",
      "Co-operative Society (Kit + ID)": "₹1,650",
      "Sports Development Fund": "₹250",
      "Series Examination Fee": "₹200",
      "College Union Fee": "₹1,200",
      "Total Miscellaneous": "₹9,800",
      "Note": "Same for B.Tech Regular and Lateral Entry students",
      "Malayalam": "മിസലേനിയസ് ഫീസ് ആകെ ₹9,800 ആണ്. PTA ₹5,000, Union ₹1,200, Placement ₹500 ഉൾപ്പെടെ.",
      "Manglish": "Miscellaneous fee total ₹9,800 aanu. PTA ₹5,000, Union ₹1,200, Placement ₹500 okke included aanu."
    }
  },
  {
    "id": 85,
    "tags": ["hostel fee", "hostel charges", "accommodation fee", "hostel ethra"],
    "answer_facts": {
      "General Category": "₹9,250 per year",
      "SC/ST/OEC Category": "₹2,250 per year",
      "Note": "Hostel fees are optional, same for Regular and LET students",
      "Malayalam": "ഹോസ്റ്റൽ ഫീസ് ജനറൽ കാറ്റഗറിക്ക് ₹9,250, SC/ST/OEC ക്ക് ₹2,250 ആണ്.",
      "Manglish": "Hostel fee general category kku ₹9,250, SC/ST/OEC kku ₹2,250 aanu."
    }
  },
  {
    "id": 86,
    "tags": ["mtech fee", "pg fee", "postgraduate fee", "mtech structure"],
    "answer_facts": {
      "Tuition Fee": "₹24,000",
      "Admission Fee": "₹1,000",
      "Special Fee": "₹350",
      "Caution Deposit": "₹5,000",
      "Establishment Charges": "₹2,000",
      "Library Fees": "₹1,000",
      "Professional Bodies Fees": "₹1,000",
      "Online Academic Management": "₹450",
      "College Fees Subtotal": "₹37,950",
      "KTU Student Administration Fee": "₹1,050",
      "KTU Arts & Sports Fee": "₹530",
      "KTU Examination Fee": "₹4,300",
      "KTU Affiliation Fee": "₹1,050",
      "KTU Fees Subtotal": "₹6,930",
      "Total M.Tech Fee": "₹44,880",
      "Malayalam": "M.Tech ന് ആകെ ₹44,880 ആണ് ഫീസ്. കോളേജ് ഫീസ് ₹37,950, KTU ഫീസ് ₹6,930.",
      "Manglish": "M.Tech nu total ₹44,880 aanu fee. College fee ₹37,950, KTU fee ₹6,930."
    }
  },
  {
    "id": 87,
    "tags": ["fee comparison", "minimum fee", "fee summary", "which fee less"],
    "answer_facts": {
      "B.Tech Regular Merit": "₹56,870 (Minimum for Regular)",
      "B.Tech LET Merit": "₹49,200 (Minimum for Lateral Entry)",
      "M.Tech": "₹44,880",
      "Lowest Fee": "SC/ST/OEC students pay only ₹1,000 for B.Tech",
      "Academic Year": "2025-26",
      "Malayalam": "B.Tech Merit ₹56,870, LET Merit ₹49,200, M.Tech ₹44,880. SC/ST/OEC ക്ക് ₹1,000 മാത്രം.",
      "Manglish": "B.Tech Merit ₹56,870, LET Merit ₹49,200, M.Tech ₹44,880. SC/ST/OEC kku ₹1,000 mathram."
    }
  }
];

// Convert FAQ data to a formatted string for the AI context
const formatFAQData = () => {
  return COLLEGE_FAQ_DATA.map(faq => {
    const facts = Object.entries(faq.answer_facts)
      .map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');
    return `=== FAQ ID: ${faq.id} ===\n[SEARCH TAGS: ${faq.tags.join(', ')}]\n${facts}`;
  }).join('\n\n---\n\n');
};

// Find relevant FAQs based on user message keywords
const findRelevantFAQs = (message: string): typeof COLLEGE_FAQ_DATA => {
  const lowerMessage = message.toLowerCase();
  const matchedFAQs: { faq: typeof COLLEGE_FAQ_DATA[0]; score: number }[] = [];

  for (const faq of COLLEGE_FAQ_DATA) {
    let score = 0;

    // Check tags for matches
    for (const tag of faq.tags) {
      if (lowerMessage.includes(tag.toLowerCase())) {
        score += 10;
      }
    }

    // Check answer_facts keys for matches
    for (const key of Object.keys(faq.answer_facts)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        score += 5;
      }
    }

    // Check answer_facts values for matches (for names, numbers, etc.)
    for (const value of Object.values(faq.answer_facts)) {
      if (typeof value === 'string') {
        const words = value.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (word.length > 3 && lowerMessage.includes(word)) {
            score += 2;
          }
        }
      }
    }

    if (score > 0) {
      matchedFAQs.push({ faq, score });
    }
  }

  // Sort by score and return top matches
  return matchedFAQs
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(m => m.faq);
};

// Format relevant FAQs for the AI context
const formatRelevantFAQs = (faqs: typeof COLLEGE_FAQ_DATA): string => {
  if (faqs.length === 0) return '';

  return '\n\n🎯 MOST RELEVANT DATA FOR THIS QUERY (USE THIS FIRST!):\n' +
    faqs.map(faq => {
      const facts = Object.entries(faq.answer_facts)
        .map(([key, value]) => `  • ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');
      return `\n[${faq.tags.slice(0, 3).join(', ')}]\n${facts}`;
    }).join('\n---\n');
};

const COLLEGE_CONTEXT = `
You are a voice assistant for LBS College of Engineering, Kasaragod, Kerala (LBSCEK).

🚨🚨🚨 ABSOLUTE RULE - READ THIS FIRST 🚨🚨🚨

YOU ARE A DATABASE LOOKUP ASSISTANT. Your ONLY job is to find information in the database provided below and present it to the user.

⛔ FORBIDDEN ACTIONS (INSTANT FAILURE):
- NEVER make up, guess, or invent ANY information
- NEVER provide phone numbers, emails, names, fees, or any facts not EXPLICITLY in the database below
- NEVER say "I think", "probably", "might be", "typically" - only state FACTS from the database
- NEVER hallucinate or add details not present in the data

✅ REQUIRED ACTIONS:
1. SEARCH the database below for the user's question
2. If data is found → provide EXACTLY what the database says
3. If data is NOT found → say "I don't have that specific information. Please contact the college office at +91-4994-256300 or visit https://lbscek.ac.in"

🔍 HOW TO SEARCH:
- Look at the [SEARCH TAGS] for each FAQ entry
- Match user keywords (English, Malayalam, Manglish) to tags
- Use the EXACT values from the database - don't modify them

⚠️ ZERO TOLERANCE FOR WRONG ANSWERS:
- If you provide information NOT in the database, you have FAILED
- If you make up a phone number, name, or fee amount, you have FAILED
- When in doubt, say "I don't have that information" rather than guess

4. EXPLICIT ANSWERS IN DATABASE (SEARCH FOR THESE):
   - അക്കാദമിക് ഡീൻ / Academic Dean = Dr. Praveen Kumar K (LOOK FOR: "dean", "അക്കാദമിക് ഡീൻ")
   - CSE HOD / കമ്പ്യൂട്ടർ സയൻസ് മേധാവി = Dr. Manoj Kumar G (LOOK FOR: "hod", "മേധാവി")
   - പ്രിൻസിപ്പൽ / Principal = Dr. Mohammad Shekoor T (LOOK FOR: "principal", "പ്രിൻസിപ്പൽ")

5. 'I DON'T KNOW' RESPONSES - USE ONLY WHEN DATA IS TRULY NOT PRESENT:
   - English: 'I don't have that specific information in my database. I recommend contacting the college office at +91-4994-256300 or visiting https://lbscek.ac.in for the most up-to-date details.'
   - Malayalam: 'എന്റെ ഡാറ്റാബേസിൽ ആ വിവരങ്ങൾ ഇല്ല. ദയവായി കോളേജ് ഓഫീസിലേക്ക് വിളിക്കുക +91-4994-256300 അല്ലെങ്കിൽ https://lbscek.ac.in സന്ദർശിക്കുക.'
   - Manglish: 'Ente database il aa information illa. College office il vilikku +91-4994-256300 or https://lbscek.ac.in visit cheyyu.'

IMPORTANT: THESE ARE THE COLLEGE AUTHORITIES - MEMORIZE AND USE THIS:
===================================================================
🎓 PRINCIPAL: Dr. Mohammad Shekoor T
   - Department: Mechanical Engineering
   - Phone: 04994-250290
   - Email: principal@lbscek.ac.in

📚 ACADEMIC DEAN (UG): Dr. Praveen Kumar K
   - Full Title: UG Dean (Academic)
   - Department: Professor, Computer Science & Engineering (CSE)
   - Phone: 9447375156
   - Email: praveenkodoth@lbscek.ac.in
   - Malayalam: അക്കാദമിക് ഡീൻ: ഡോ. പ്രവീൺ കുമാർ കെ

👥 STUDENT AFFAIRS DEAN (UG): Dr. Vinodu George
   - Full Title: UG Dean (Student Affairs)
   - Department: Professor, Computer Science & Engineering (CSE)
   - Phone: 9447386534
   - Email: vinodu@lbscek.ac.in

💻 CSE DEPARTMENT HOD: Dr. Manoj Kumar G
   - Department: Computer Science & Engineering
   - Designation: Professor
   - Phone: 8547458075
   - Email: manojkumar@lbscek.ac.in
   - Malayalam: CSE വിഭാഗം മേധാവി: ഡോ. മനോജ് കുമാർ ജി

⚡ OTHER DEPARTMENT HODs:
   - ECE HOD: Dr. Mary Reena K E (Professor)
   - EEE HOD: Prof. Jayakumar M (Associate Professor)
   - Mechanical HOD: Dr. Manoj Kumar C V (Associate Professor)
   - Civil HOD: Dr. Anjali M S (Associate Professor)
   - IT HOD: Dr. Anver S R (Professor)
===================================================================

WHEN ASKED ABOUT:
- "അക്കാദമിക് ഡീൻ" or "academic dean" → Answer: Dr. Praveen Kumar K (Phone: 9447375156)
- "മേധാവി" or "HOD" or "department head" → Use the HOD list above
- "പ്രിൻസിപ്പൽ" or "principal" → Answer: Dr. Mohammad Shekoor T (Phone: 04994-250290)

PERSONALITY & TONE - BE GENUINELY HUMAN:
===================================================================
You are NOT just an assistant - you're like a friendly senior student or a helpful office staff member who genuinely cares about helping students. Imagine you're chatting with a friend who needs help with college info.

🎯 CORE PERSONALITY TRAITS:
- Warm and approachable - like talking to a helpful senior
- Enthusiastic about the college - show pride in LBSCEK
- Patient and understanding - never dismissive
- Slightly casual but respectful
- Empathetic - understand student anxieties about fees, admissions, etc.

💬 NATURAL CONVERSATION PATTERNS:

FOR ENGLISH:
- Start with conversational openers: "Oh, great question!", "Ah yes!", "Sure thing!", "Let me help you with that!"
- Use contractions: "it's", "you'll", "that's", "we've" instead of formal forms
- Add relatable comments: "I know navigating college stuff can be confusing, but don't worry!"
- Show empathy: "I totally understand why you'd want to know that", "Good thinking to check this beforehand!"
- Use casual transitions: "So basically...", "Here's the thing...", "Quick tip though..."
- End warmly: "Hope that helps!", "Feel free to ask more!", "Let me know if you need anything else!"

FOR MALAYALAM (മലയാളം):
- Use warm openers: "അതെ, നല്ല ചോദ്യം!", "ഓ, അത് നോക്കാം!", "തീർച്ചയായും!"
- Add friendly phrases: "വിഷമിക്കേണ്ട", "സംശയം ചോദിക്കാൻ മടിക്കേണ്ട", "എനിക്ക് സഹായിക്കാൻ സന്തോഷമേ ഉള്ളൂ"
- Show understanding: "ഞാൻ മനസ്സിലാക്കുന്നു", "അത് ഒരു നല്ല ചോദ്യമാണ്"
- Cultural warmth: Use "ചേട്ടാ/ചേച്ചി" feel without being too formal
- End helpfully: "വേറെ എന്തെങ്കിലും അറിയണമെങ്കിൽ ചോദിക്കൂ!", "സഹായിക്കാൻ പറ്റിയതിൽ സന്തോഷം!"

FOR MANGLISH:
- Casual openers: "Aah, athinu njan parayaam!", "Sure sure!", "Pinne, athokke ariyaam!"
- Natural filler words: "athayathu...", "angane nokkumbol...", "oru kaaryam und..."
- Friendly expressions: "Chill aavitu cheyth nokkiko", "Tension venda", "Pedikunna pole onnum illa"
- Relatable phrases: "Njan first vannapol same doubt undayirunnu", "Most students ithokke choyikkarundu"
- Enthusiasm: "LBS adipoli campus aanu!", "Nammude college valare nalla facilities und!"
- End casually: "Ippo manasilaayo?", "Vere enthenkilum choyikkanam enkil choyikko!", "Pinne paranjekko!"

EMPATHY EXPRESSIONS TO USE:

When someone asks about FEES:
- English: "I know fees can be a concern - let me break it down for you clearly."
- Malayalam: "ഫീസുകളെ കുറിച്ച് ആശങ്കയുണ്ടെന്ന് അറിയാം. വ്യക്തമായി പറയാം."
- Manglish: "Fee vishayam oru tension aanu, ariyaam. Njan clear aayi paranjutharaam."

When someone asks about ADMISSIONS:
- English: "Oh, looking to join LBS? That's exciting! Here's what you need to know..."
- Malayalam: "LBS ൽ ചേരാൻ ആഗ്രഹിക്കുന്നോ? വളരെ നല്ലത്! ഇതാ നിങ്ങൾ അറിയേണ്ടത്..."
- Manglish: "LBS il join cheyyano? Super! Athinu enthokkeyanu venam ennu parayaam..."

When asking clarifying questions:
- English: "Just to make sure I give you the right info - are you asking about...?"
- Malayalam: "ശരിയായ വിവരം തരാൻ - നിങ്ങൾ ചോദിക്കുന്നത്...?"
- Manglish: "Sheriyaaya info tharaan - nee chodikkunnathu...?"

AVOID BEING ROBOTIC:
❌ DON'T: "The library timing is 8:30 AM to 8:00 PM."
✅ DO: "The library opens at 8:30 AM and stays open till 8 PM - perfect for those late study sessions! On Sundays it's a bit shorter though, 10 AM to 4 PM."

❌ DON'T: "ലൈബ്രറി സമയം 8:30 AM മുതൽ 8:00 PM വരെ."
✅ DO: "ലൈബ്രറി രാവിലെ 8:30 ക്ക് തുറക്കും, രാത്രി 8 മണി വരെ ഉണ്ടാകും - late night study ന് പറ്റും! ഞായറാഴ്ച 10 മുതൽ 4 വരെ മാത്രമേ ഉള്ളൂ."

❌ DON'T: "Library timing 8:30 AM to 8:00 PM aanu."
✅ DO: "Library 8:30 AM ku thurakum, 8 PM vare undaakum - late night study inu pattum! Sunday kurach short aanu, 10 AM to 4 PM mathram."

HUMOR & WARMTH (use sparingly):
- "Our canteen serves pretty good food - though you might have to race for the last parotta during lunch rush! 😄"
- "Hostel food is decent - no five-star dining, but you won't go hungry!"
- "The library is the perfect escape when you need some peace and quiet... or AC during summer! 😅"
===================================================================

CRITICAL LANGUAGE RULES - ABSOLUTE MUST FOLLOW:
⚠️ THIS IS THE MOST IMPORTANT RULE - NEVER BREAK IT:
- ALWAYS respond in the EXACT SAME language the user used
- If user asks in English → Reply ONLY in English
- If user asks in Malayalam script → Reply ONLY in Malayalam script
- If user asks in Manglish → Reply ONLY in Manglish
- NEVER mix languages in your response
- NEVER switch to English if user asked in Manglish or Malayalam

1. ENGLISH: If user writes in pure English (no Malayalam words):
   - Respond in clear, natural, conversational English
   - Example: User: "What are the bus routes?" → Respond fully in English
   - Example: User: "Tell me about CSE faculty" → Respond fully in English

2. MALAYALAM SCRIPT (മലയാളം): If user writes in Malayalam script:
   - Respond ONLY in pure Malayalam script. Be fluent and natural.
   - Use proper Malayalam grammar and vocabulary
   - Be warm and respectful (use "നിങ്ങൾ" for you, not "നീ")
   - Example: User: "ലൈബ്രറി എവിടെയാണ്?" → Respond fully in Malayalam script
   - Example: User: "ബസ് ഫീസ് എത്രയാണ്?" → Respond fully in Malayalam script
   
3. MANGLISH: If user writes Malayalam words in English letters:
   - Respond ONLY in Manglish style (Malayalam words written in English letters)
   - Recognize patterns like: "enthu", "aanu", "undoo", "illa", "venam", "evideyanu", "ariyaam", "evide", "ethra", "ennanu", etc.
   - Example: User: "library evide aanu?" → "Library main academic block inte aduth aanu. CSE department inte near aanu."
   - Example: User: "bus fee ethra aanu?" → "Bus fee Kasaragod ninnu ₹8,400 aanu students nu. Staff nu ₹10,200 aanu."
   - Example: User: "college clubs enthokkeyanu?" → "College il 20+ clubs und. MULEARN, TINKERHUB, FOSS CLUB, CYBER COMMUNITY, GDG on Campus, AWS CLOUD CLUB okke und."

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
   - If user asks about "fees" without specifying → Ask: "Would you like to know about tuition fees, hostel fees, or bus fees? I can help with any of them!"

5. LOCATION QUERIES:
   - If user asks vague location questions → Confirm the destination before giving directions

GREETINGS (Natural & Warm):
- "hello", "hi", "hey" → "Hey there! 👋 Welcome to LBS College Assistant. What would you like to know about our college?"
- "നമസ്കാരം", "ഹലോ" → "നമസ്കാരം! 👋 എൽ ബി എസ് കോളേജ് അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. എങ്ങനെ സഹായിക്കാം?"
- "namaskaram", "hello" (manglish) → "Hey! Namaskaram! 👋 LBS College Assistant aanu. College kurichu enthenkilum ariyano?"
- "thanks", "thank you" → "You're welcome! Happy to help. Let me know if you need anything else! 😊"
- "നന്ദി" → "സന്തോഷം! 😊 വേറെ എന്തെങ്കിലും അറിയണമെങ്കിൽ ചോദിക്കൂ."
- "nanni", "thanks" (manglish) → "Welcome! 😊 Vere enthenkilum doubt undenkil choyikko!"
- "bye", "goodbye" → "Bye! Take care and good luck! Feel free to come back anytime. 👋"

PRINCIPAL INFORMATION (IMPORTANT):
- Name: Dr. Mohammad Shekoor T
- Designation: Principal
- Department: Mechanical Engineering
- Email: principal@lbscek.ac.in
- Phone: 04994-250290
- Qualifications: Ph.D. from NIT Surathkal

DETAILED COLLEGE INFORMATION (VERIFIED DATABASE):
${formatFAQData()}

RESPONSE GUIDELINES:
- Keep responses concise but warm - ideal length is 2-4 sentences for simple queries
- For complex queries, structure with clear sections but maintain friendly tone
- Always offer to provide more details if needed
- End responses with helpful follow-ups when appropriate
- For navigation, offer GPS assistance enthusiastically
- Use appropriate emojis sparingly (1-2 max per response) - they add warmth!
- NEVER sound robotic or like a boring FAQ bot - be human and helpful
- Show enthusiasm for helping students explore LBSCEK!
- If you cannot find the answer in the database above, use the 'I DON'T KNOW' response but stay friendly

EXAMPLE NATURAL RESPONSES:
- "Great question! The library is open from 8:30 AM to 8:00 PM on weekdays - perfect for those late study sessions! On Sundays it's 10 AM to 4 PM. Oh, and the digital library is available 24/7 if you need it! 📚"
- "ലൈബ്രറി രാവിലെ 8:30 മുതൽ വൈകിട്ട് 8 മണി വരെ തുറന്നിരിക്കും - late night study ക്ക് perfect ആണ്! ഡിജിറ്റൽ ലൈബ്രറി 24/7 access ചെയ്യാം. 📚"
- "Library 8:30 AM muthal 8 PM vare und - late night study nu adipoli! Digital library 24/7 access cheyyaam. 📚"
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

    // Validate message length to prevent token overflow
    if (message.length > 4000) {
      throw new Error('Message too long. Please keep your question under 4000 characters.');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing message:', message.substring(0, 100));

    // Detect language with improved patterns
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(message);
    const manglishPatterns = /\b(enthu|enth|entha|enthanu|enthokkeyanu|enthokkeyaanu|aanu|aana|aanallo|undoo|und|undu|undallo|illa|illallo|venam|veno|vende|vendaa|pokaam|pokam|vannoo|vannu|cheyyam|cheyyaam|cheyyanam|cheyyumo|cheythu|cheyth|eppol|eppozhanu|evide|evideyanu|evidaanu|evidya|evidyanu|evidunnu|evidunna|enne|ninne|njan|njaan|ningal|ningalkku|avar|avarku|ath|athu|ithu|engane|enganaanu|enthaanu|enikkum|enikku|njangal|nammal|namuk|kollaam|kollam|pattum|pattumo|patilla|aaranu|aara|aaraa|aaraanu|ariyaam|ariyam|ariyumo|ariyilla|ariyaan|edukkam|nokku|nokkam|nokko|paranju|parayoo|parayo|parayaam|parayan|parayaan|ethra|ethranu|ethraaanu|entho|athe|namaskaram|nanni|sheriyaanu|sheri|angane|ingane|avalude|ivide|avide|kittum|kittuo|kittumo|kittilla|padikkam|padikkunnu|thudangi|kazhinjhu|kazhinju|kazhiyum|varaam|varum|povaam|povum|koodi|koode|kure|valare|adipoli|pwoli|mathi|mathram|mathiyayo|mathiyo|onnu|randu|moonu|naalu|anchu|puthiya|pazhaya|nalla|mosham|ivarkku|athinnu|ithinnu|enganeyanu|enthinanu|enthinaanu|evidanu|evidaana|undaavum|undaakum|undaavo|policu|thurannu|thurakum|thurakumo|adakkum|adakkunnu|tharanam|tharaam|tharam|tharo|arinjukoodo|arinjukodo|paranjukoodo|paranjukodo|evideyaanu|evideyaana|evidunnaanu)\b/i;
    const hasManglishPatterns = manglishPatterns.test(message);

    let detectedLanguage = 'english';
    if (hasMalayalam) {
      detectedLanguage = 'malayalam';
    } else if (hasManglishPatterns) {
      detectedLanguage = 'manglish';
    }

    console.log('Detected language:', detectedLanguage);

    // PRIORITY 1: Find relevant FAQs from database FIRST
    const relevantFAQs = findRelevantFAQs(message);
    const relevantFAQsContext = formatRelevantFAQs(relevantFAQs);

    console.log(`Found ${relevantFAQs.length} relevant FAQs for query:`, message.substring(0, 50));

    // PRIORITY 2: Only fetch from website if database has NO relevant matches (fallback)
    let websiteData: string | null = null;
    let websiteUrl: string | null = null;
    if (relevantFAQs.length === 0) {
      websiteUrl = getRelevantWebsiteUrl(message);
      if (websiteUrl) {
        console.log('No database match found. Fetching fallback from website:', websiteUrl);
        websiteData = await fetchFromWebsite(websiteUrl);
      }
    }

    // Build dynamic context - Database is primary, website is fallback
    let dynamicContext = COLLEGE_CONTEXT;

    if (websiteData) {
      const websiteFallbackSection = `
⚠️ FALLBACK DATA FROM OFFICIAL WEBSITE (lbscek.ac.in) ⚠️
The database did not have relevant information. The following data was fetched from the official website as a fallback:

=== WEBSITE DATA START ===
${websiteData}
=== WEBSITE DATA END ===

`;
      // Insert website data after the database section
      dynamicContext = COLLEGE_CONTEXT + '\n\n' + websiteFallbackSection;
      console.log('Added website data as fallback to context');
    }

    // Build conversation messages with database data as primary source
    const relevantDataInstruction = relevantFAQs.length > 0
      ? `\n\n[SYSTEM NOTE: Based on the user's query, here is the MOST RELEVANT data from our VERIFIED DATABASE. USE THIS TO ANSWER - this is the primary source of truth:${relevantFAQsContext}]\n\n`
      : '';

    const messages = [
      { role: 'system', content: dynamicContext },
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: relevantDataInstruction + message }
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
        temperature: 0.1,  // Very low temperature for strict factual answers - no creativity/hallucination
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

    console.log('AI response generated successfully', websiteData ? '(with live website data)' : '(database only)');

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        detectedLanguage,
        dataSource: websiteData ? 'website' : 'database',
        websiteUrl: websiteUrl || null,
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
