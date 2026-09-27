/**
 * EcoCollect - Smart Waste Collection & Recycling Platform
 * Client Application Logic (FIT-FEST 2026 Hackathon)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let state = {
    categories: [],
    selectedCategory: 'plastic',
    requests: [],
    activeTrackingId: 'ECO-9281',
    stats: {}
  };

  // --- DOM Elements ---
  const mainNav = document.getElementById('mainNav');
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewPanels = document.querySelectorAll('.view-panel');
  const categoryGrid = document.getElementById('categoryGrid');
  const selectedCategoryInput = document.getElementById('selectedCategoryInput');
  const weightInput = document.getElementById('estimatedWeightInput');
  const weightDisplay = document.getElementById('weightDisplay');
  const scheduledDateInput = document.getElementById('scheduledDateInput');
  const pickupForm = document.getElementById('pickupForm');
  const geoLocateBtn = document.getElementById('geoLocateBtn');
  const demoDataBtn = document.getElementById('demoDataBtn');
  const headerCtaBtn = document.getElementById('headerCtaBtn');

  // Summary Elements
  const summaryCategoryName = document.getElementById('summaryCategoryName');
  const summaryCategoryBadge = document.getElementById('summaryCategoryBadge');
  const summaryWeight = document.getElementById('summaryWeight');
  const summaryPoints = document.getElementById('summaryPoints');
  const summaryCo2 = document.getElementById('summaryCo2');
  const summaryBin = document.getElementById('summaryBin');
  const summaryTip = document.getElementById('summaryTip');

  // Tracking Elements
  const trackInput = document.getElementById('trackInput');
  const trackSearchBtn = document.getElementById('trackSearchBtn');
  const trackCard = document.getElementById('trackCard');
  const chipBtns = document.querySelectorAll('.chip-btn');
  const printReceiptBtn = document.getElementById('printReceiptBtn');

  // Admin Elements
  const adminTableBody = document.getElementById('adminTableBody');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const filterStatus = document.getElementById('filterStatus');
  const filterCategory = document.getElementById('filterCategory');
  const adminRefreshBtn = document.getElementById('adminRefreshBtn');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const tableEmptyState = document.getElementById('tableEmptyState');

  // Modal Elements
  const statusModal = document.getElementById('statusModal');
  const closeStatusModalBtn = document.getElementById('closeStatusModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const updateStatusForm = document.getElementById('updateStatusForm');
  const certificateModal = document.getElementById('certificateModal');
  const closeCertBtn = document.getElementById('closeCertBtn');

  // --- Initialize App ---
  initDateInput();
  fetchCategories();
  fetchStats();
  fetchRequests();
  setupEventListeners();

  // Set default date to tomorrow
  function initDateInput() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    scheduledDateInput.value = `${yyyy}-${mm}-${dd}`;
    scheduledDateInput.min = new Date().toISOString().split('T')[0];
  }

  // --- Navigation Handling ---
  function switchView(viewId) {
    viewPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === viewId);
    });

    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewId === 'adminView') {
      fetchRequests();
    } else if (viewId === 'statsView') {
      fetchStats();
    } else if (viewId === 'trackView') {
      loadTracking(state.activeTrackingId);
    }
  }

  // --- Fetch Categories ---
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        state.categories = data.categories;
        renderCategorySelection();
        renderGuideCards();
        updateSummary();
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  // Render Category Selection Grid in Booking Form
  function renderCategorySelection() {
    categoryGrid.innerHTML = '';
    state.categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = `category-card ${cat.id === state.selectedCategory ? 'selected' : ''}`;
      card.dataset.id = cat.id;

      card.innerHTML = `
        <div class="category-icon">${cat.icon}</div>
        <div class="category-name">${cat.name}</div>
        <div class="category-sub">${cat.description}</div>
        <div class="category-reward-tag">⭐ +${cat.pointsPerKg} Pts / kg</div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedCategory = cat.id;
        selectedCategoryInput.value = cat.id;
        updateSummary();
      });

      categoryGrid.appendChild(card);
    });
  }

  // Render Waste Guide Cards
  function renderGuideCards() {
    const grid = document.getElementById('guideCardsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    state.categories.forEach(cat => {
      let binClass = 'bin-yellow';
      if (cat.id === 'organic') binClass = 'bin-green';
      if (cat.id === 'ewaste' || cat.id === 'paper') binClass = 'bin-blue';
      if (cat.id === 'metal_glass') binClass = 'bin-gray';
      if (cat.id === 'hazardous') binClass = 'bin-red';

      const card = document.createElement('div');
      card.className = 'guide-card glass-panel';
      card.innerHTML = `
        <div class="g-card-top">
          <div class="g-card-icon">${cat.icon}</div>
          <span class="g-bin-badge ${binClass}">${cat.recyclingBin}</span>
        </div>
        <h3 class="g-card-title">${cat.name}</h3>
        <p class="g-card-desc">${cat.description}</p>
        <div class="g-card-instructions">
          <strong>Disposal Instruction:</strong><br>${cat.disposalGuide}
        </div>
        <div class="g-card-stats">
          <span>Carbon Offset: ~${cat.co2PerKg} kg CO₂ / kg</span>
          <span>Reward: ${cat.pointsPerKg} Pts / kg</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // --- Dynamic Summary Calculations ---
  function updateSummary() {
    const currentCat = state.categories.find(c => c.id === state.selectedCategory) || {
      name: 'Plastic Waste',
      pointsPerKg: 15,
      co2PerKg: 1.8,
      recyclingBin: 'Yellow Bin',
      disposalGuide: 'Rinse thoroughly before pickup.'
    };

    const weight = parseFloat(weightInput.value) || 5;
    const points = Math.round(weight * currentCat.pointsPerKg);
    const co2 = Math.round(weight * currentCat.co2PerKg * 10) / 10;

    summaryCategoryName.textContent = currentCat.name;
    summaryCategoryBadge.textContent = currentCat.name;
    summaryWeight.textContent = `${weight.toFixed(1)} Kg`;
    summaryPoints.textContent = `+${points} Points`;
    summaryCo2.textContent = `~${co2} Kg CO₂`;
    summaryBin.textContent = currentCat.recyclingBin;
    summaryTip.innerHTML = `💡 <strong>Pro Tip:</strong> ${currentCat.disposalGuide}`;
  }

  // --- Geolocation Auto-Detection ---
  function handleGeolocation() {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    geoLocateBtn.textContent = '⏳ Detecting...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mockAddress = `Sector 62, Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
        document.getElementById('pickupAddressInput').value = `Block C-2, Tech Boulevard (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
        document.getElementById('cityInput').value = 'Noida';
        document.getElementById('pincodeInput').value = '201309';
        document.getElementById('landmarkInput').value = 'Near Innovation Center';
        geoLocateBtn.textContent = '✅ Location Detected';
        showToast('Address auto-filled via GPS coordinates!', 'success');
        setTimeout(() => {
          geoLocateBtn.textContent = '📍 Auto-Detect Location';
        }, 3000);
      },
      () => {
        // Fallback for permissions blocked
        document.getElementById('pickupAddressInput').value = 'Flat 204, Lotus Green Enclave, Tech Park';
        document.getElementById('cityInput').value = 'Noida';
        document.getElementById('pincodeInput').value = '201301';
        geoLocateBtn.textContent = '📍 Auto-Detect Location';
        showToast('Default hackathon test coordinates filled.', 'info');
      }
    );
  }

  // --- Submit Pickup Request ---
  async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(pickupForm);
    const payload = {
      category: formData.get('category'),
      estimatedWeightKg: parseFloat(formData.get('estimatedWeightKg')),
      scheduledDate: formData.get('scheduledDate'),
      timeSlot: formData.get('timeSlot'),
      userName: formData.get('userName'),
      userPhone: formData.get('userPhone'),
      pickupAddress: formData.get('pickupAddress'),
      landmark: formData.get('landmark'),
      city: formData.get('city'),
      pincode: formData.get('pincode'),
      notes: formData.get('notes')
    };

    if (!payload.userName || !payload.userPhone || !payload.pickupAddress) {
      showToast('Please fill in your name, contact phone, and address.', 'error');
      return;
    }

    const submitBtn = document.getElementById('submitPickupBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Scheduling Pickup...';

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.request) {
        showToast(`🎉 Pickup Scheduled! Tracking ID: ${data.request.id}`, 'success');
        state.activeTrackingId = data.request.id;
        trackInput.value = data.request.id;

        // Reset form partially
        pickupForm.reset();
        initDateInput();
        weightInput.value = 5;
        weightDisplay.textContent = '5.0 kg';
        updateSummary();

        // Switch to track view immediately
        setTimeout(() => {
          switchView('trackView');
          loadTracking(data.request.id);
          fetchStats();
        }, 800);
      } else {
        showToast(data.error || 'Failed to submit pickup request', 'error');
      }
    } catch (err) {
      showToast('Network error while scheduling pickup', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Confirm & Dispatch Pickup Request';
    }
  }

  // --- Tracking View Logic ---
  async function loadTracking(requestId) {
    if (!requestId) return;

    try {
      const res = await fetch(`/api/requests/${requestId.trim()}`);
      const data = await res.json();

      if (data.success && data.request) {
        renderTrackingDetails(data.request);
      } else {
        showToast('Tracking ID not found. Check ID or try demo chips.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading tracking details', 'error');
    }
  }

  function renderTrackingDetails(req) {
    document.getElementById('trackRequestId').textContent = req.id;
    const badge = document.getElementById('trackStatusBadge');
    badge.textContent = req.status;
    badge.className = `status-badge status-${req.status.toLowerCase().replace(/\s+/g, '-')}`;

    document.getElementById('trackCreatedDate').textContent = `Slot: ${req.scheduledDate} &bull; ${req.timeSlot}`;
    document.getElementById('trackUserName').textContent = `${req.userName} (${req.userPhone})`;
    document.getElementById('trackCategory').textContent = req.categoryName;
    document.getElementById('trackWeight').textContent = `${req.estimatedWeightKg} Kg`;
    document.getElementById('trackAddress').textContent = `${req.pickupAddress}, ${req.city} - ${req.pincode} (${req.landmark || 'No landmark'})`;
    document.getElementById('trackSlot').textContent = req.timeSlot;

    // Driver details
    document.getElementById('trackDriverName').textContent = req.assignedDriver || 'Assigning soon...';
    document.getElementById('trackDriverPhone').textContent = req.driverPhone || 'Dispatcher pending allocation';
    const callBtn = document.getElementById('callDriverBtn');
    if (req.driverPhone) {
      callBtn.href = `tel:${req.driverPhone}`;
      callBtn.style.display = 'inline-flex';
    } else {
      callBtn.style.display = 'none';
    }

    document.getElementById('trackPoints').textContent = `${req.ecoPoints} Pts`;
    document.getElementById('trackCo2').textContent = `${req.co2SavedKg} Kg`;

    // Stepper updates
    updateStepper(req.status);

    // Audit Timeline
    const timeline = document.getElementById('trackTimeline');
    timeline.innerHTML = '';
    if (req.statusHistory && req.statusHistory.length > 0) {
      req.statusHistory.forEach(h => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        const formattedDate = new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        item.innerHTML = `
          <div>
            <span class="t-status">${h.status}</span>
            <span class="t-time">${formattedDate}</span>
          </div>
          <div class="t-note">${h.note || ''}</div>
        `;
        timeline.appendChild(item);
      });
    }

    // Set Certificate details
    document.getElementById('certUserName').textContent = req.userName;
    document.getElementById('certCode').textContent = `${req.id}-CERT`;
    document.getElementById('certWeight').textContent = `${req.estimatedWeightKg} Kg ${req.categoryName}`;
    document.getElementById('certCo2').textContent = `${req.co2SavedKg} Kg CO₂`;
    document.getElementById('certPoints').textContent = `+${req.ecoPoints} Points`;
  }

  function updateStepper(currentStatus) {
    const statusSequence = ['Pending', 'Assigned', 'In Route', 'Collected', 'Recycled'];
    const currentIndex = statusSequence.indexOf(currentStatus);

    const stepNodes = document.querySelectorAll('.step-node');
    const stepLines = document.querySelectorAll('.step-line');

    stepNodes.forEach((node, idx) => {
      node.classList.remove('completed', 'active');
      if (idx < currentIndex) {
        node.classList.add('completed');
      } else if (idx === currentIndex) {
        node.classList.add('active');
      }
    });

    stepLines.forEach((line, idx) => {
      line.classList.toggle('active', idx < currentIndex);
    });
  }

  // --- Admin Dashboard Logic ---
  async function fetchRequests() {
    const statusVal = filterStatus.value;
    const catVal = filterCategory.value;
    const query = adminSearchInput.value.trim();

    let endpoint = `/api/requests?status=${encodeURIComponent(statusVal)}&category=${encodeURIComponent(catVal)}`;
    if (query) {
      endpoint += `&search=${encodeURIComponent(query)}`;
    }

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        state.requests = data.requests;
        renderAdminTable(data.requests);
      }
    } catch (err) {
      console.error('Failed to load admin requests:', err);
    }
  }

  function renderAdminTable(list) {
    adminTableBody.innerHTML = '';
    if (!list || list.length === 0) {
      tableEmptyState.style.display = 'block';
      return;
    }
    tableEmptyState.style.display = 'none';

    list.forEach(req => {
      const tr = document.createElement('tr');
      const statusSlug = req.status.toLowerCase().replace(/\s+/g, '-');

      tr.innerHTML = `
        <td><span class="id-badge">${req.id}</span></td>
        <td>
          <strong>${req.userName}</strong><br>
          <small class="text-muted">${req.userPhone}</small>
        </td>
        <td>${req.categoryName}</td>
        <td><strong>${req.estimatedWeightKg} kg</strong></td>
        <td>
          ${req.pickupAddress}<br>
          <small class="text-muted">${req.city} - ${req.pincode}</small>
        </td>
        <td><small>${req.timeSlot}</small></td>
        <td><span class="status-badge status-${statusSlug}">${req.status}</span></td>
        <td><small>${req.assignedDriver || 'Unassigned'}</small></td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm action-manage-btn" data-id="${req.id}">
            ⚙️ Dispatch
          </button>
        </td>
      `;

      tr.querySelector('.action-manage-btn').addEventListener('click', () => {
        openStatusModal(req);
      });

      adminTableBody.appendChild(tr);
    });
  }

  // --- Modal Open & Save ---
  function openStatusModal(req) {
    document.getElementById('modalRequestId').value = req.id;
    document.getElementById('modalRequestCode').textContent = req.id;
    document.getElementById('modalCitizenName').textContent = `${req.userName} &bull; ${req.pickupAddress}`;
    document.getElementById('modalStatusSelect').value = req.status;
    document.getElementById('modalDriverInput').value = req.assignedDriver || 'Ramesh Kumar (Truck #UP-16-EK-402)';
    document.getElementById('modalDriverPhoneInput').value = req.driverPhone || '+91 98111 22334';
    document.getElementById('modalNoteInput').value = `Status set to ${req.status} by Dispatcher`;

    statusModal.classList.add('open');
  }

  function closeStatusModal() {
    statusModal.classList.remove('open');
  }

  async function handleStatusUpdate(e) {
    e.preventDefault();
    const id = document.getElementById('modalRequestId').value;
    const newStatus = document.getElementById('modalStatusSelect').value;
    const assignedDriver = document.getElementById('modalDriverInput').value;
    const driverPhone = document.getElementById('modalDriverPhoneInput').value;
    const note = document.getElementById('modalNoteInput').value;

    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedDriver,
          driverPhone,
          note
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Request ${id} updated to ${newStatus}`, 'success');
        closeStatusModal();
        fetchRequests();
        fetchStats();
        if (state.activeTrackingId === id) {
          loadTracking(id);
        }
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  }

  // --- Statistics & Environmental Impact ---
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        state.stats = data.stats;
        renderStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function renderStats(s) {
    // Strip stats
    document.getElementById('statTotalKg').textContent = `${s.totalWeightKg} kg`;
    document.getElementById('statCo2Saved').textContent = `${s.totalCo2SavedKg} kg`;
    document.getElementById('statTrees').textContent = `${s.treesEquivalent}`;
    document.getElementById('statEcoPoints').textContent = `${s.totalEcoPoints}`;

    // Admin KPIs
    document.getElementById('kpiTotal').textContent = s.totalRequests;
    document.getElementById('kpiPending').textContent = s.pendingRequests;
    document.getElementById('kpiActive').textContent = s.activeDispatches;
    document.getElementById('kpiCompleted').textContent = s.completedPickups;

    // Analytics View Hero
    document.getElementById('analyticsCo2Num').textContent = `${s.totalCo2SavedKg} Kg`;
    document.getElementById('analyticsPointsNum').textContent = `${s.totalEcoPoints} Pts`;

    // Render Category Distribution Bars
    const barsList = document.getElementById('categoryBarsList');
    if (barsList && s.categoryBreakdown) {
      barsList.innerHTML = '';
      const maxKg = Math.max(...Object.values(s.categoryBreakdown).map(b => b.totalKg), 10);

      Object.entries(s.categoryBreakdown).forEach(([key, val]) => {
        const percent = Math.min(100, Math.round((val.totalKg / maxKg) * 100));
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
          <div class="bar-meta">
            <span>${val.icon} ${val.name}</span>
            <span>${val.totalKg.toFixed(1)} kg (${val.count} pickups)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percent}%;"></div>
          </div>
        `;
        barsList.appendChild(row);
      });
    }
  }

  // --- Export Data to CSV ---
  function exportCSV() {
    if (!state.requests || state.requests.length === 0) {
      showToast('No request data to export.', 'info');
      return;
    }

    const headers = ['Request ID', 'Citizen Name', 'Phone', 'Category', 'Weight (Kg)', 'Address', 'City', 'Pincode', 'Slot', 'Status', 'Driver'];
    const rows = state.requests.map(r => [
      r.id,
      `"${r.userName}"`,
      `"${r.userPhone}"`,
      `"${r.categoryName}"`,
      r.estimatedWeightKg,
      `"${r.pickupAddress}"`,
      `"${r.city}"`,
      r.pincode,
      `"${r.timeSlot}"`,
      r.status,
      `"${r.assignedDriver || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecocollect_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported Successfully!', 'success');
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Nav view switching
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Brand logo click
    document.getElementById('brandLogo').addEventListener('click', () => switchView('bookView'));
    headerCtaBtn.addEventListener('click', () => switchView('bookView'));

    // Weight slider
    weightInput.addEventListener('input', () => {
      const val = parseFloat(weightInput.value);
      weightDisplay.textContent = `${val.toFixed(1)} kg`;
      updateSummary();
    });

    // Form submit
    pickupForm.addEventListener('submit', handleFormSubmit);

    // Geolocation button
    geoLocateBtn.addEventListener('click', handleGeolocation);

    // Track search
    trackSearchBtn.addEventListener('click', () => {
      const id = trackInput.value.trim();
      if (id) {
        state.activeTrackingId = id;
        loadTracking(id);
      }
    });

    trackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const id = trackInput.value.trim();
        if (id) {
          state.activeTrackingId = id;
          loadTracking(id);
        }
      }
    });

    // Demo tracking chips
    chipBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.id;
        trackInput.value = id;
        state.activeTrackingId = id;
        loadTracking(id);
      });
    });

    // Certificate modal
    printReceiptBtn.addEventListener('click', () => {
      certificateModal.classList.add('open');
    });
    closeCertBtn.addEventListener('click', () => {
      certificateModal.classList.remove('open');
    });

    // Admin filters
    filterStatus.addEventListener('change', fetchRequests);
    filterCategory.addEventListener('change', fetchRequests);
    adminSearchInput.addEventListener('input', debounce(fetchRequests, 300));
    adminRefreshBtn.addEventListener('click', () => {
      fetchRequests();
      fetchStats();
      showToast('Data refreshed', 'success');
    });
    exportDataBtn.addEventListener('click', exportCSV);

    // Admin status modal
    closeStatusModalBtn.addEventListener('click', closeStatusModal);
    cancelModalBtn.addEventListener('click', closeStatusModal);
    updateStatusForm.addEventListener('submit', handleStatusUpdate);

    // Waste Guide search
    const guideSearchInput = document.getElementById('guideSearchInput');
    if (guideSearchInput) {
      guideSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.guide-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? 'flex' : 'none';
        });
      });
    }

    // Demo Data Seed Button
    demoDataBtn.addEventListener('click', async () => {
      showToast('Demo data initialized with 4 live pickup requests!', 'success');
      fetchStats();
      fetchRequests();
    });
  }

  // Helper debounce
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
});
