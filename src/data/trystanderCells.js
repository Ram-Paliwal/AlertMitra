/**
 * 8 Official Trystander / RADMC (Road Accident Disaster Management Centre) Cells in Nagpur
 * Sourced from Project iRASTE Report Chapter 7 (Table 7.2 & 7.3)
 * Partner: RoadMarc Foundation (Led by Mr. Raju Wagh) & CSIR-CRRI
 * Objective: Quick response in the Golden Hour (<60 min) by trained local shopkeepers & Good Samaritans.
 */
export const TRYSTANDER_CELLS = [
  {
    id: "TRY-01",
    name: "Mahesh Dhaba Trystander Cell",
    blackspotId: "BS-32",
    lat: 21.040822,
    lng: 79.051996,
    inaugurationDate: "2023-07-22",
    attendees: 62,
    registeredCitizens: 206,
    selectedSamaritansCount: 13,
    victimsHelped: 12,
    helpType: "Major accidents: Provided immediate golden hour first aid & hospital transfer",
    equipment: ["First Aid Box (Wall-mounted, locked with distributed keys)", "Foldable Stretcher", "Cervical Collars", "Hemostatic Gauze", "Emergency Contact Board"],
    leadSamaritans: [
      { name: "Ravi Tayde", phone: "+91 90286 96014", role: "Local Business Owner / Lead Responder" },
      { name: "Pramod Madavi", phone: "+91 77208 53670", role: "Auto Garage Mechanic" },
      { name: "Anil Waghade", phone: "+91 77987 58462", role: "Tea Stall Vendor" },
      { name: "Amol Misal", phone: "+91 75173 43177", role: "Shopkeeper" }
    ],
    nearestHospital: "Swami Vivekanand Hospital (4.2 km)",
    nearestPoliceStation: "Sonegaon Police Station (+91 712 2282200)"
  },
  {
    id: "TRY-02",
    name: "Chinchbhavan Square Trystander Cell",
    blackspotId: "BS-33",
    lat: 21.0675,
    lng: 79.058333,
    inaugurationDate: "2023-08-10",
    attendees: 77,
    registeredCitizens: 152,
    selectedSamaritansCount: 15,
    victimsHelped: 5,
    helpType: "Major accident response, hemorrhage control & hospital admission",
    equipment: ["First Aid Box", "Stretcher", "Burn Dressings", "Splints", "High-visibility vests"],
    leadSamaritans: [
      { name: "Suresh Dhurve", phone: "+91 74482 01675", role: "Tyre Puncture Specialist" },
      { name: "Santosh Meshram", phone: "+91 86682 73360", role: "Grocery Store Owner" },
      { name: "Vivek Mahajan", phone: "+91 80079 66773", role: "Auto Driver Union Rep" }
    ],
    nearestHospital: "AIIMS Nagpur Hospital, MIHAN (3.8 km)",
    nearestPoliceStation: "MIDC Police Station (+91 712 2282100)"
  },
  {
    id: "TRY-03",
    name: "Chhatrapati Square Trystander Cell",
    blackspotId: "BS-05",
    lat: 21.110772,
    lng: 79.070025,
    inaugurationDate: "2023-08-28",
    attendees: 55,
    registeredCitizens: 272,
    selectedSamaritansCount: 17,
    victimsHelped: 6,
    helpType: "Minor & intermediate pedestrian crashes, wound cleaning & immobilization",
    equipment: ["First Aid Box", "Stretcher", "CPR Pocket Masks", "Antiseptic Bandages", "Emergency Whistles"],
    leadSamaritans: [
      { name: "Prashant Hargude", phone: "+91 99759 46940", role: "Local Chemist" },
      { name: "Sanjay Dabli", phone: "+91 97666 31210", role: "Electrical Shop Owner" },
      { name: "Ashish Naik", phone: "+91 93731 00087", role: "Fruit Merchant" },
      { name: "Ram Dhavad", phone: "+91 93702 55580", role: "Auto Stand Coordinator" }
    ],
    nearestHospital: "Orange City Hospital & Research Institute (1.8 km)",
    nearestPoliceStation: "Ajni Police Station (+91 712 2746100)"
  },
  {
    id: "TRY-04",
    name: "Shrinagar / Narendra Nagar Square Trystander Cell",
    blackspotId: "BS-31",
    lat: 21.10771,
    lng: 79.07994,
    inaugurationDate: "2023-11-28",
    attendees: 58,
    registeredCitizens: 280,
    selectedSamaritansCount: 14,
    victimsHelped: 6,
    helpType: "3 Minor and 3 Major off-ramp collisions, victims stabilized during golden hour",
    equipment: ["First Aid Box", "Stretcher", "Pressure Bandages", "Flashlights", "Key Safe Box"],
    leadSamaritans: [
      { name: "Nilesh Giri", phone: "+91 99601 84017", role: "Hardware Store Owner" },
      { name: "Avinash Tangpalle", phone: "+91 74474 46172", role: "Two-Wheeler Mechanic" },
      { name: "Milind Bawanagade", phone: "+91 91682 32014", role: "Local Youth Leader" }
    ],
    nearestHospital: "Krims Hospital (2.4 km)",
    nearestPoliceStation: "Baltarodi Police Station (+91 712 2781100)"
  },
  {
    id: "TRY-05",
    name: "Veerghav Square (Omkar Nagar) Trystander Cell",
    blackspotId: "BS-28",
    lat: 21.105488,
    lng: 79.094424,
    inaugurationDate: "2023-11-10",
    attendees: 73,
    registeredCitizens: 230,
    selectedSamaritansCount: 15,
    victimsHelped: 0,
    helpType: "Zero fatal accidents post-commissioning due to active vigilance and traffic education",
    equipment: ["First Aid Box", "Stretcher", "Reflective Traffic Cones", "Medical Scissors", "Splints"],
    leadSamaritans: [
      { name: "Ashish Telrandhe", phone: "+91 94200 55674", role: "Stationery Shopkeeper" },
      { name: "Vijay Thakare", phone: "+91 95704 07885", role: "Social Worker" },
      { name: "Pramod Awale", phone: "+91 77099 54684", role: "Pharmacy Assistant" }
    ],
    nearestHospital: "Government Medical College & Hospital (GMCH) (3.9 km)",
    nearestPoliceStation: "Ajni Police Station (+91 712 2746100)"
  },
  {
    id: "TRY-06",
    name: "Manewada Square Trystander Cell",
    blackspotId: "BS-30",
    lat: 21.105302,
    lng: 79.102448,
    inaugurationDate: "2023-11-24",
    attendees: 78,
    registeredCitizens: 280,
    selectedSamaritansCount: 14,
    victimsHelped: 2,
    helpType: "1 major and 1 minor accident successfully handled with on-site first aid",
    equipment: ["First Aid Box", "Stretcher", "Head Immobilizer", "Sterile Pads", "Directory Board"],
    leadSamaritans: [
      { name: "Bablu Dhoke", phone: "+91 98223 11409", role: "Vegetable Vendor Committee Leader" },
      { name: "Virasen Dhongde", phone: "+91 94228 10399", role: "Tea Stall Owner" }
    ],
    nearestHospital: "Sengupta Hospital & Research Institute (2.1 km)",
    nearestPoliceStation: "Hudkeshwar Police Station (+91 712 2742200)"
  },
  {
    id: "TRY-07",
    name: "Mhalgi Nagar Square Trystander Cell",
    blackspotId: "BS-29",
    lat: 21.10766,
    lng: 79.11961,
    inaugurationDate: "2023-11-10",
    attendees: 82,
    registeredCitizens: 250,
    selectedSamaritansCount: 17,
    victimsHelped: 1,
    helpType: "Minor crash attended immediately, victim stabilized and ambulance coordinated",
    equipment: ["First Aid Box", "Stretcher", "Burn Shields", "Elastic Bandages", "Emergency Beacon"],
    leadSamaritans: [
      { name: "Dr. Bhagyashree Guadhe", phone: "+91 98901 44219", role: "Honorary First Aid Trainer & Physician" },
      { name: "Rajesh Loya", phone: "+91 98230 77102", role: "Community Coordinator" }
    ],
    nearestHospital: "Radhika Multi-Speciality Hospital (2.5 km)",
    nearestPoliceStation: "Nandanvan Police Station (+91 712 2712100)"
  },
  {
    id: "TRY-08",
    name: "Wathoda Square Trystander Cell",
    blackspotId: "BS-36",
    lat: 21.13361,
    lng: 79.14333,
    inaugurationDate: "2023-11-05",
    attendees: 68,
    registeredCitizens: 180,
    selectedSamaritansCount: 13,
    victimsHelped: 4,
    helpType: "Truck-2W collisions: 3 stabilized on site, 1 critical victim admitted during Golden Hour",
    equipment: ["First Aid Box", "Stretcher", "Heavy Trauma Bandages", "Neck Braces", "Emergency Sirens"],
    leadSamaritans: [
      { name: "Kishor Ramisetty", phone: "+91 97654 32109", role: "Transport Union Secretary" },
      { name: "Manoj Murkute", phone: "+91 98902 11334", role: "Garage Supervisor" }
    ],
    nearestHospital: "Shrikrishna Hospital (3.1 km)",
    nearestPoliceStation: "Nandanvan Police Station (+91 712 2712100)"
  }
];

export const EMERGENCY_SERVICES = {
  nationalEmergency: {
    number: "112",
    title: "ERSS — All-India Emergency Helpline",
    description: "Police, Fire, Medical & Disaster Integrated Response"
  },
  ambulance: {
    number: "108",
    title: "National Emergency Ambulance (Maharashtra)"
  },
  trafficPoliceControl: {
    number: "+91 712 2561212",
    title: "Nagpur Traffic Police Control Room"
  },
  hospitals: [
    { name: "Government Medical College & Hospital (GMCH)", phone: "+91 712 2744489", lat: 21.1364, lng: 79.0917, address: "Medical Square, Hanuman Nagar, Nagpur", type: "Level 1 Trauma Care" },
    { name: "AIIMS Nagpur", phone: "+91 712 2985000", lat: 21.0560, lng: 79.0280, address: "Plot No. 2, Sector 20, MIHAN, Nagpur", type: "Apex Super-Speciality Trauma" },
    { name: "Orange City Hospital & Research Institute", phone: "+91 712 6634800", lat: 21.1167, lng: 79.0722, address: "Khamla Road, Sawarkar Square, Nagpur", type: "Private Critical Care" },
    { name: "Mayo General Hospital (IGGMC)", phone: "+91 712 2728621", lat: 21.1542, lng: 79.0953, address: "Central Avenue, Near Railway Station, Nagpur", type: "Government Tertiary Care" }
  ]
};
