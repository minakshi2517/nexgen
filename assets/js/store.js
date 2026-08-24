/**
 * NexGen C2C Skills - Dynamic CMS Data Store (LocalStorage Powered)
 * Manages Courses, Events, Gallery, Testimonials, and Student Inquiries
 */

const NexGenStore = {
  // Default Initial Data
  defaults: {
    events: [
      {
        id: "evt-1",
        title: "Generative AI Masterclass: Prompting to Workflow Automation",
        category: "Webinar",
        date: "2026-08-30",
        time: "06:00 PM IST",
        speaker: "Dr. Rajesh Verma (AI Principal)",
        badge: "Free Live Session",
        link: "book-demo.html"
      },
      {
        id: "evt-2",
        title: "Campus to Corporate 4-Quadrant Leadership Boot Camp",
        category: "Campus Workshop",
        date: "2026-09-05",
        time: "10:00 AM IST",
        speaker: "Ananya Deshmukh (Ex-Corporate HR Lead)",
        badge: "Certified",
        link: "book-demo.html"
      },
      {
        id: "evt-3",
        title: "Industrial Automation 4.0: Hands-On PLC & SCADA Simulation",
        category: "Technical Lab",
        date: "2026-09-12",
        time: "02:00 PM IST",
        speaker: "Er. Amit Saini (Automation Specialist)",
        badge: "Limited Seats",
        link: "book-demo.html"
      }
    ],
    courses: [
      {
        id: "crs-1",
        title: "01 | Artificial Intelligence Foundation Track",
        category: "Artificial Intelligence",
        target: "Students & Beginners",
        duration: "6 Weeks (Live + Projects)",
        mode: "Online Live + Lab Access",
        icon: "fa-robot",
        description: "Understand Generative AI, master 20+ everyday AI tools (ChatGPT, Claude, Midjourney), prompt engineering, and academic project workflows."
      },
      {
        id: "crs-2",
        title: "02 | AI Executive & Professional Accelerator",
        category: "Artificial Intelligence",
        target: "Working Professionals",
        duration: "8 Weeks (Weekend Batches)",
        mode: "Hybrid / Live",
        icon: "fa-bolt",
        description: "Automate daily office tasks, build automated Excel/BI reports, create multi-step Zapier/Make pipelines, and scale business output."
      },
      {
        id: "crs-3",
        title: "03 | Campus to Corporate (C2C) Master Leadership",
        category: "Campus to Corporate",
        target: "Final Year Students & Freshers",
        duration: "4 Weeks Intensive",
        mode: "On-Campus / Live Online",
        icon: "fa-users-cog",
        description: "4-Quadrant matrix: AI+Lead, AI+Work, AI+Learn, AI+Grow. Inspired by The 7 Habits of Highly Effective People and Atomic Habits."
      },
      {
        id: "crs-4",
        title: "04 | Operational Excellence (Lean, Quality & 8D)",
        category: "Industrial Oriented",
        target: "Engineers & Operations Teams",
        duration: "6 Weeks Practical",
        mode: "Interactive Case Studies",
        icon: "fa-chart-line",
        description: "Shop-floor Lean Manufacturing, 5S, TPM, Root Cause Analysis (RCA), and 8D problem solving methodology for world-class quality."
      },
      {
        id: "crs-5",
        title: "05 | Industrial Automation & PLC Programming",
        category: "Industrial Oriented",
        target: "Electrical / Mechanical Engineers",
        duration: "8 Weeks Hands-on",
        mode: "Simulation Lab + Hardware",
        icon: "fa-cogs",
        description: "Complete PLC programming (Siemens, Allen Bradley), HMI/SCADA designing, industrial sensors, hydraulics, and closed-loop control."
      },
      {
        id: "crs-6",
        title: "06 | Industrial Robotics & Servo Motion Control",
        category: "Industrial Oriented",
        target: "Automation Engineers",
        duration: "8 Weeks Advanced",
        mode: "Practical Robotics Simulation",
        icon: "fa-microchip",
        description: "Multi-axis kinematics, servo drive calibration, VFD speed control, robot kinematics, and Industry 4.0 smart factory integration."
      }
    ],
    gallery: [
      {
        id: "gal-1",
        title: "Hands-on AI Lab & Prompt Engineering Workshop",
        category: "Campus",
        tag: "College Bootcamp",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        date: "August 2026"
      },
      {
        id: "gal-2",
        title: "Corporate Executive AI Productivity Seminar",
        category: "Corporate",
        tag: "Leadership Upskilling",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        date: "July 2026"
      },
      {
        id: "gal-3",
        title: "PLC & SCADA Industrial Automation Training Lab",
        category: "Technical",
        tag: "Hands-on Automation",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        date: "July 2026"
      },
      {
        id: "gal-4",
        title: "Campus to Corporate 7 Habits Certification Ceremony",
        category: "Campus",
        tag: "Student Placement Drive",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        date: "June 2026"
      },
      {
        id: "gal-5",
        title: "Faculty Development Program (FDP) on AI in Pedagogy",
        category: "Corporate",
        tag: "Faculty Training",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        date: "May 2026"
      },
      {
        id: "gal-6",
        title: "Robotics Motion Control & Servo Drive Lab Session",
        category: "Technical",
        tag: "Robotics Lab",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
        date: "April 2026"
      }
    ],
    testimonials: [
      {
        id: "tst-1",
        name: "Pooja Sharma",
        role: "B.Tech Computer Science Graduate",
        org: "Placed as Associate Consultant at Top MNC",
        quote: "The AI Foundation and C2C Leadership tracks gave me an unfair advantage in campus placements. The 7 Habits practical framework completely changed how I answer interview case studies!",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "tst-2",
        name: "Rohan Kulkarni",
        role: "Operations & Quality Lead",
        org: "Automotive Manufacturing Enterprise",
        quote: "The Lean, RCA, and 8D problem-solving modules were directly applicable to our plant floor. We cut defect reporting turnaround by 40% using NexGen's AI-enabled analysis templates.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "tst-3",
        name: "Prof. Dr. Sanjay Nair",
        role: "Head of Training & Placements",
        org: "Engineering Institute",
        quote: "NexGen conducted an intensive 3-day Campus-to-Corporate workshop for 250+ students. The feedback was extraordinary. Students learned not just tools, but the real corporate mindset.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      }
    ],
    leads: [
      {
        id: "lead-101",
        name: "Vikram Malhotra",
        phone: "9876543210",
        email: "vikram.m@gmail.com",
        program: "AI Executive & Professional Accelerator",
        type: "Professional",
        message: "Looking for weekend batch timings and fee structure.",
        date: "2026-08-21 14:30",
        status: "New"
      },
      {
        id: "lead-102",
        name: "Sneha Reddy",
        phone: "9823456789",
        email: "sneha.reddy@college.edu",
        program: "Campus to Corporate (C2C) Master Leadership",
        type: "Campus",
        message: "Interested in college-wide workshop for 120 final year students.",
        date: "2026-08-22 09:15",
        status: "Contacted"
      }
    ]
  },

  // Init Data Store
  init() {
    if (!localStorage.getItem("nexgen_events")) {
      localStorage.setItem("nexgen_events", JSON.stringify(this.defaults.events));
    }
    if (!localStorage.getItem("nexgen_courses")) {
      localStorage.setItem("nexgen_courses", JSON.stringify(this.defaults.courses));
    }
    if (!localStorage.getItem("nexgen_gallery")) {
      localStorage.setItem("nexgen_gallery", JSON.stringify(this.defaults.gallery));
    }
    if (!localStorage.getItem("nexgen_testimonials")) {
      localStorage.setItem("nexgen_testimonials", JSON.stringify(this.defaults.testimonials));
    }
    if (!localStorage.getItem("nexgen_leads")) {
      localStorage.setItem("nexgen_leads", JSON.stringify(this.defaults.leads));
    }
  },

  // Getters
  get(key) {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(`nexgen_${key}`)) || this.defaults[key];
    } catch (e) {
      return this.defaults[key];
    }
  },

  // Setters
  set(key, data) {
    localStorage.setItem(`nexgen_${key}`, JSON.stringify(data));
  },

  // Add Item
  addItem(key, item) {
    const list = this.get(key);
    item.id = `${key.slice(0, 3)}-${Date.now()}`;
    list.unshift(item);
    this.set(key, list);
    return item;
  },

  // Update Item
  updateItem(key, id, updatedFields) {
    let list = this.get(key);
    list = list.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    this.set(key, list);
  },

  // Delete Item
  deleteItem(key, id) {
    let list = this.get(key);
    list = list.filter(item => item.id !== id);
    this.set(key, list);
  },

  // Add Lead
  addLead(leadData) {
    const lead = {
      id: `lead-${Date.now()}`,
      date: new Date().toLocaleString(),
      status: "New",
      ...leadData
    };
    const leads = this.get("leads");
    leads.unshift(lead);
    this.set("leads", leads);
    return lead;
  }
};

NexGenStore.init();
