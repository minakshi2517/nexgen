/**
 * NexGen C2C Skills - Admin CMS Portal Logic with 2-Step Email Verification
 */

let currentGeneratedOtp = null;
let currentPendingEmail = "admin@nexgenc2cskills.com";
let resendTimerInterval = null;

// Auth State Check on Page Load
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem("nexgen_admin_auth") === "true";
  const authOverlay = document.getElementById("admin-auth-overlay");
  const cmsWrapper = document.getElementById("admin-cms-wrapper");
  const userEmailDisplay = document.getElementById("admin-user-email");

  if (isAuth) {
    if (authOverlay) authOverlay.style.display = "none";
    if (cmsWrapper) cmsWrapper.style.display = "block";
    const savedEmail = sessionStorage.getItem("nexgen_admin_email") || "admin@nexgenc2cskills.com";
    if (userEmailDisplay) userEmailDisplay.textContent = savedEmail;
    return true;
  } else {
    if (authOverlay) authOverlay.style.display = "flex";
    if (cmsWrapper) cmsWrapper.style.display = "none";
    return false;
  }
}

// Step 1: Credentials Submission
window.handleStep1Submit = function(e) {
  e.preventDefault();
  const emailInput = document.getElementById("auth-email").value.trim();
  const passInput = document.getElementById("auth-password").value.trim();
  const errorBox = document.getElementById("step1-error");
  const errorMsg = document.getElementById("step1-error-msg");

  const validPasswords = ["admin123", "admin", "nexgen2026", "nexgen@2026"];

  if (!emailInput || !emailInput.includes("@")) {
    errorBox.style.display = "block";
    errorMsg.textContent = "Please enter a valid administrator email address.";
    return;
  }

  if (!validPasswords.includes(passInput)) {
    errorBox.style.display = "block";
    errorMsg.textContent = "Incorrect password. (Default master password is: admin123)";
    return;
  }

  errorBox.style.display = "none";
  currentPendingEmail = emailInput;

  // Generate 6-digit OTP code
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Transition to Step 2
  document.getElementById("admin-login-step1").style.display = "none";
  document.getElementById("admin-login-step2").style.display = "block";
  document.getElementById("auth-display-email").textContent = currentPendingEmail;

  // Clear previous OTP inputs
  document.querySelectorAll(".otp-digit").forEach(input => input.value = "");
  const firstOtpInput = document.querySelector('.otp-digit[data-index="0"]');
  if (firstOtpInput) setTimeout(() => firstOtpInput.focus(), 150);

  // Show Simulated Email Toast Notification
  showEmailOtpToast(currentGeneratedOtp, currentPendingEmail);
};

// Step 2: OTP Verification
window.handleStep2Submit = function(e) {
  e.preventDefault();
  const digits = Array.from(document.querySelectorAll(".otp-digit")).map(i => i.value).join("");
  const errorBox = document.getElementById("step2-error");
  const errorMsg = document.getElementById("step2-error-msg");

  if (digits.length < 6) {
    errorBox.style.display = "block";
    errorMsg.textContent = "Please enter the full 6-digit verification code.";
    return;
  }

  // Validate OTP (Matches generated OTP or master bypass 123456)
  if (digits === currentGeneratedOtp || digits === "123456") {
    errorBox.style.display = "none";
    sessionStorage.setItem("nexgen_admin_auth", "true");
    sessionStorage.setItem("nexgen_admin_email", currentPendingEmail);
    
    // Hide Auth Gateway & Reveal Dashboard
    const authOverlay = document.getElementById("admin-auth-overlay");
    const cmsWrapper = document.getElementById("admin-cms-wrapper");
    if (authOverlay) authOverlay.style.display = "none";
    if (cmsWrapper) cmsWrapper.style.display = "block";
    
    const userEmailDisplay = document.getElementById("admin-user-email");
    if (userEmailDisplay) userEmailDisplay.textContent = currentPendingEmail;

    // Load initial data
    if (typeof loadDashboardStats === "function") {
      loadDashboardStats();
      loadCoursesTable();
      loadEventsTable();
      loadGalleryGrid();
      loadTestimonialsList();
      loadLeadsTable();
    }
  } else {
    errorBox.style.display = "block";
    errorMsg.textContent = `Invalid OTP code. The code sent to ${currentPendingEmail} is: ${currentGeneratedOtp}`;
  }
};

// Resend OTP Code
window.resendOtpCode = function(e) {
  if (e) e.preventDefault();
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  showEmailOtpToast(currentGeneratedOtp, currentPendingEmail);
  const errorBox = document.getElementById("step2-error");
  if (errorBox) errorBox.style.display = "none";
};

// Back to Step 1
window.backToStep1 = function(e) {
  if (e) e.preventDefault();
  document.getElementById("admin-login-step2").style.display = "none";
  document.getElementById("admin-login-step1").style.display = "block";
  document.getElementById("step1-error").style.display = "none";
};

// Admin Logout
window.handleAdminLogout = function() {
  if (confirm("Are you sure you want to log out of the NexGen Admin CMS?")) {
    sessionStorage.removeItem("nexgen_admin_auth");
    sessionStorage.removeItem("nexgen_admin_email");
    currentGeneratedOtp = null;
    checkAdminAuth();
    backToStep1();
  }
};

// Show Live Email Dispatch Toast
function showEmailOtpToast(otp, email) {
  const toast = document.getElementById("auth-email-toast");
  const codeSpan = document.getElementById("toast-otp-code");
  if (toast && codeSpan) {
    codeSpan.textContent = otp;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 12000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Check Auth State First
  checkAdminAuth();

  // Setup OTP Digit Input Auto-Advance & Backspace Handler
  const otpInputs = document.querySelectorAll(".otp-digit");
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData("text").trim();
      if (/^\d{6}$/.test(pastedData)) {
        pastedData.split("").forEach((char, i) => {
          if (otpInputs[i]) otpInputs[i].value = char;
        });
        otpInputs[5].focus();
      }
    });
  });

  // Check active tab
  const navBtns = document.querySelectorAll(".admin-nav-item");
  const tabContents = document.querySelectorAll(".admin-tab-content");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      navBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = document.getElementById(`tab-${tabId}`);
      if (targetTab) targetTab.classList.add("active");

      loadTabData(tabId);
    });
  });

  // Initial Load
  loadDashboardStats();
  loadCoursesTable();
  loadEventsTable();
  loadGalleryGrid();
  loadTestimonialsList();
  loadLeadsTable();

  function loadTabData(tabId) {
    if (tabId === "dashboard") loadDashboardStats();
    if (tabId === "courses") loadCoursesTable();
    if (tabId === "events") loadEventsTable();
    if (tabId === "gallery") loadGalleryGrid();
    if (tabId === "testimonials") loadTestimonialsList();
    if (tabId === "leads") loadLeadsTable();
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  function loadDashboardStats() {
    const leads = NexGenStore.get("leads") || [];
    const courses = NexGenStore.get("courses") || [];
    const events = NexGenStore.get("events") || [];
    const gallery = NexGenStore.get("gallery") || [];

    document.getElementById("stat-leads-count").textContent = leads.length;
    document.getElementById("stat-courses-count").textContent = courses.length;
    document.getElementById("stat-events-count").textContent = events.length;
    document.getElementById("stat-gallery-count").textContent = gallery.length;

    // Recent leads preview
    const recentLeadsTable = document.getElementById("recent-leads-tbody");
    if (recentLeadsTable) {
      recentLeadsTable.innerHTML = leads.slice(0, 5).map(lead => `
        <tr>
          <td><strong>${lead.name}</strong></td>
          <td>${lead.phone}</td>
          <td><span class="admin-badge blue">${lead.program}</span></td>
          <td>${lead.date}</td>
          <td><span class="admin-badge ${lead.status === 'New' ? 'gold' : 'emerald'}">${lead.status}</span></td>
          <td>
            <a href="https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20NexGen%20C2C%20Skills." target="_blank" class="admin-action-btn wa" title="Chat on WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          </td>
        </tr>
      `).join("");
    }
  }

  // ==========================================
  // COURSES MANAGEMENT
  // ==========================================
  function loadCoursesTable() {
    const courses = NexGenStore.get("courses") || [];
    const tbody = document.getElementById("courses-tbody");
    if (!tbody) return;

    tbody.innerHTML = courses.map((course, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <i class="fas ${course.icon || 'fa-graduation-cap'}" style="color:var(--accent-cyan);"></i>
            <strong>${course.title}</strong>
          </div>
        </td>
        <td><span class="admin-badge cyan">${course.category}</span></td>
        <td>${course.target}</td>
        <td>${course.duration}</td>
        <td>
          <button onclick="deleteCourse('${course.id}')" class="admin-action-btn delete" title="Delete Course">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.deleteCourse = function(id) {
    if (confirm("Are you sure you want to delete this course?")) {
      NexGenStore.deleteItem("courses", id);
      loadCoursesTable();
      loadDashboardStats();
    }
  };

  const addCourseForm = document.getElementById("add-course-form");
  if (addCourseForm) {
    addCourseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newCourse = {
        title: document.getElementById("c-title").value,
        category: document.getElementById("c-category").value,
        target: document.getElementById("c-target").value,
        duration: document.getElementById("c-duration").value,
        mode: document.getElementById("c-mode").value,
        icon: document.getElementById("c-icon").value || "fa-robot",
        description: document.getElementById("c-desc").value
      };
      NexGenStore.addItem("courses", newCourse);
      addCourseForm.reset();
      closeAdminModal("modal-add-course");
      loadCoursesTable();
      loadDashboardStats();
      alert("Course added successfully!");
    });
  }

  // ==========================================
  // EVENTS MANAGEMENT
  // ==========================================
  function loadEventsTable() {
    const events = NexGenStore.get("events") || [];
    const tbody = document.getElementById("events-tbody");
    if (!tbody) return;

    tbody.innerHTML = events.map((evt, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td><strong>${evt.title}</strong></td>
        <td><span class="admin-badge gold">${evt.category}</span></td>
        <td>${evt.date} (${evt.time})</td>
        <td>${evt.speaker}</td>
        <td><span class="admin-badge emerald">${evt.badge}</span></td>
        <td>
          <button onclick="deleteEvent('${evt.id}')" class="admin-action-btn delete" title="Delete Event">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.deleteEvent = function(id) {
    if (confirm("Are you sure you want to delete this event?")) {
      NexGenStore.deleteItem("events", id);
      loadEventsTable();
      loadDashboardStats();
    }
  };

  const addEventForm = document.getElementById("add-event-form");
  if (addEventForm) {
    addEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newEvent = {
        title: document.getElementById("e-title").value,
        category: document.getElementById("e-category").value,
        date: document.getElementById("e-date").value,
        time: document.getElementById("e-time").value,
        speaker: document.getElementById("e-speaker").value,
        badge: document.getElementById("e-badge").value || "Open",
        link: "book-demo.html"
      };
      NexGenStore.addItem("events", newEvent);
      addEventForm.reset();
      closeAdminModal("modal-add-event");
      loadEventsTable();
      loadDashboardStats();
      alert("Event added! Live Ticker and Events page updated.");
    });
  }

  // ==========================================
  // GALLERY MANAGEMENT
  // ==========================================
  function loadGalleryGrid() {
    const gallery = NexGenStore.get("gallery") || [];
    const container = document.getElementById("admin-gallery-grid");
    if (!container) return;

    container.innerHTML = gallery.map(item => `
      <div class="admin-gallery-card">
        <img src="${item.image}" alt="${item.title}" class="admin-gallery-thumb">
        <div class="admin-gallery-body">
          <span class="admin-badge cyan">${item.category}</span>
          <h4 style="font-size:0.95rem; margin:0.4rem 0; color:#fff;">${item.title}</h4>
          <small style="color:var(--text-muted); display:block; margin-bottom:0.6rem;">${item.date} • ${item.tag}</small>
          <button onclick="deleteGalleryItem('${item.id}')" class="btn btn-sm btn-outline" style="color:#ef4444; border-color:rgba(239,68,68,0.3); width:100%;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join("");
  }

  window.deleteGalleryItem = function(id) {
    if (confirm("Delete this gallery image?")) {
      NexGenStore.deleteItem("gallery", id);
      loadGalleryGrid();
      loadDashboardStats();
    }
  };

  const addGalleryForm = document.getElementById("add-gallery-form");
  if (addGalleryForm) {
    addGalleryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newItem = {
        title: document.getElementById("g-title").value,
        category: document.getElementById("g-category").value,
        tag: document.getElementById("g-tag").value,
        image: document.getElementById("g-url").value,
        date: document.getElementById("g-date").value || "August 2026"
      };
      NexGenStore.addItem("gallery", newItem);
      addGalleryForm.reset();
      closeAdminModal("modal-add-gallery");
      loadGalleryGrid();
      loadDashboardStats();
      alert("Gallery image added!");
    });
  }

  // ==========================================
  // TESTIMONIALS MANAGEMENT
  // ==========================================
  function loadTestimonialsList() {
    const testimonials = NexGenStore.get("testimonials") || [];
    const container = document.getElementById("admin-testimonials-grid");
    if (!container) return;

    container.innerHTML = testimonials.map(item => `
      <div class="admin-testimonial-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">
          <div style="display:flex; gap:0.8rem; align-items:center;">
            <img src="${item.avatar}" alt="${item.name}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
            <div>
              <strong style="color:#fff; display:block;">${item.name}</strong>
              <small style="color:var(--accent-cyan);">${item.role} • ${item.org}</small>
            </div>
          </div>
          <button onclick="deleteTestimonial('${item.id}')" class="admin-action-btn delete"><i class="fas fa-trash"></i></button>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.5;">"${item.quote}"</p>
      </div>
    `).join("");
  }

  window.deleteTestimonial = function(id) {
    if (confirm("Delete this testimonial?")) {
      NexGenStore.deleteItem("testimonials", id);
      loadTestimonialsList();
    }
  };

  const addTestimonialForm = document.getElementById("add-testimonial-form");
  if (addTestimonialForm) {
    addTestimonialForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newTestimonial = {
        name: document.getElementById("t-name").value,
        role: document.getElementById("t-role").value,
        org: document.getElementById("t-org").value,
        quote: document.getElementById("t-quote").value,
        rating: 5,
        avatar: document.getElementById("t-avatar").value || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
      };
      NexGenStore.addItem("testimonials", newTestimonial);
      addTestimonialForm.reset();
      closeAdminModal("modal-add-testimonial");
      loadTestimonialsList();
      alert("Testimonial added!");
    });
  }

  // ==========================================
  // LEADS & CRM
  // ==========================================
  function loadLeadsTable() {
    const leads = NexGenStore.get("leads") || [];
    const tbody = document.getElementById("leads-tbody");
    if (!tbody) return;

    tbody.innerHTML = leads.map((lead, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td><strong>${lead.name}</strong></td>
        <td>
          <a href="tel:${lead.phone}" style="color:var(--accent-cyan); font-weight:600;">${lead.phone}</a>
        </td>
        <td>${lead.email || 'N/A'}</td>
        <td><span class="admin-badge blue">${lead.program}</span></td>
        <td><small style="color:var(--text-secondary); max-width:200px; display:block;">${lead.message || 'General Inquiry'}</small></td>
        <td><small>${lead.date}</small></td>
        <td>
          <select onchange="updateLeadStatus('${lead.id}', this.value)" class="form-control" style="padding:0.25rem 0.6rem; font-size:0.8rem; width:auto;">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Enrolled" ${lead.status === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <a href="https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20NexGen%20C2C%20Skills.%20We%20received%20your%20inquiry%20regarding%20${encodeURIComponent(lead.program)}." target="_blank" class="admin-action-btn wa" title="Message on WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
          <button onclick="deleteLead('${lead.id}')" class="admin-action-btn delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.updateLeadStatus = function(id, status) {
    NexGenStore.updateItem("leads", id, { status });
    loadDashboardStats();
  };

  window.deleteLead = function(id) {
    if (confirm("Delete this lead?")) {
      NexGenStore.deleteItem("leads", id);
      loadLeadsTable();
      loadDashboardStats();
    }
  };

  // Export Leads to CSV
  window.exportLeadsCSV = function() {
    const leads = NexGenStore.get("leads") || [];
    if (!leads.length) {
      alert("No leads found to export.");
      return;
    }

    let csv = "ID,Name,Phone,Email,Program,Message,Date,Status\n";
    leads.forEach(l => {
      csv += `"${l.id}","${l.name}","${l.phone}","${l.email || ''}","${l.program}","${(l.message || '').replace(/"/g, '""')}","${l.date}","${l.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NexGen_Leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Demo Data
  window.resetAllDemoData = function() {
    if (confirm("Reset all store data to defaults? This will reload sample courses, events, gallery, and testimonials.")) {
      localStorage.removeItem("nexgen_events");
      localStorage.removeItem("nexgen_courses");
      localStorage.removeItem("nexgen_gallery");
      localStorage.removeItem("nexgen_testimonials");
      localStorage.removeItem("nexgen_leads");
      NexGenStore.init();
      loadDashboardStats();
      loadCoursesTable();
      loadEventsTable();
      loadGalleryGrid();
      loadTestimonialsList();
      loadLeadsTable();
      alert("Store reset to defaults!");
    }
  };

  // Admin Modal Controls
  window.openAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  };

  window.closeAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  };
});
