const STORAGE_KEY = "an-nhien-dorm-data-v1";
const initialData = {
  rooms: [
    { id: "A101", building: "A", floor: 1, capacity: 4, gender: "Nam", price: 850000 },
    { id: "A102", building: "A", floor: 1, capacity: 4, gender: "Nam", price: 850000 },
    { id: "A203", building: "A", floor: 2, capacity: 4, gender: "Nữ", price: 900000 },
    { id: "B105", building: "B", floor: 1, capacity: 6, gender: "Nam", price: 750000 },
    { id: "B202", building: "B", floor: 2, capacity: 4, gender: "Nữ", price: 900000 },
    { id: "C301", building: "C", floor: 3, capacity: 4, gender: "Nam", price: 950000 }
  ],
  residents: [
    { id: "r1", name: "Nguyễn Minh Anh", studentId: "SV2024018", phone: "090 123 4567", email: "minhanh@email.com", room: "A101", startDate: "2026-08-15" },
    { id: "r2", name: "Trần Hoàng Nam", studentId: "SV2023056", phone: "091 234 5678", email: "hoangnam@email.com", room: "A101", startDate: "2026-08-16" },
    { id: "r3", name: "Lê Phương Thảo", studentId: "SV2024022", phone: "093 345 6789", email: "phuongthao@email.com", room: "A203", startDate: "2026-08-17" },
    { id: "r4", name: "Phạm Gia Bảo", studentId: "SV2023031", phone: "098 456 7890", email: "giabao@email.com", room: "B105", startDate: "2026-08-18" },
    { id: "r5", name: "Đỗ Khánh Linh", studentId: "SV2024051", phone: "097 567 8901", email: "khanhlinh@email.com", room: "B202", startDate: "2026-08-19" }
  ],
  invoices: [
    { id: "HD-2611-018", residentId: "r1", residentName: "Nguyễn Minh Anh", room: "A101", description: "Tiền phòng tháng 11", amount: 850000, dueDate: "2026-11-10", status: "paid" },
    { id: "HD-2611-056", residentId: "r2", residentName: "Trần Hoàng Nam", room: "A101", description: "Tiền phòng tháng 11", amount: 850000, dueDate: "2026-11-10", status: "pending" },
    { id: "HD-2611-022", residentId: "r3", residentName: "Lê Phương Thảo", room: "A203", description: "Tiền phòng tháng 11", amount: 900000, dueDate: "2026-11-10", status: "paid" },
    { id: "HD-2611-031", residentId: "r4", residentName: "Phạm Gia Bảo", room: "B105", description: "Tiền phòng tháng 11", amount: 750000, dueDate: "2026-11-10", status: "pending" }
  ]
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.rooms) && Array.isArray(parsed.residents) && Array.isArray(parsed.invoices)) return parsed;
    }
  } catch {
    // Continue with the sample data when local storage is unavailable or invalid.
  }
  return structuredClone(initialData);
}

let data = loadData();
let activeView = "overview";
let searchTerm = "";
const view = document.querySelector("#view");
const dialog = document.querySelector("#resident-dialog");
const residentForm = document.querySelector("#resident-form");
const searchInputMarkup = `<label class="search-box"><span aria-hidden="true">⌕</span><input id="view-search" type="search" placeholder="Tìm kiếm..." aria-label="Tìm kiếm"></label>`;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);
const currency = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
const formatDate = (date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T00:00:00`));
const initials = (name) => name.split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
const roomOccupants = (roomId) => data.residents.filter((resident) => resident.room === roomId).length;
const occupancy = () => data.rooms.reduce((total, room) => total + roomOccupants(room.id), 0);

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    showToast("Không thể lưu dữ liệu trên trình duyệt này.");
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setView(nextView) {
  activeView = nextView;
  searchTerm = "";
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === nextView));
  const labels = { overview: "Tổng quan", residents: "Sinh viên", rooms: "Phòng ở", payments: "Hóa đơn" };
  document.querySelector("#breadcrumb-current").textContent = labels[nextView];
  render();
}

function residentRows(residents) {
  if (!residents.length) return `<tr><td class="empty-state" colspan="5">Chưa tìm thấy sinh viên phù hợp.</td></tr>`;
  return residents.map((resident) => `
    <tr>
      <td><div class="resident-cell"><span class="avatar avatar-${["green", "peach", "lilac", "blue"][data.residents.indexOf(resident) % 4]}">${escapeHtml(initials(resident.name))}</span><span><strong>${escapeHtml(resident.name)}</strong><small>${escapeHtml(resident.studentId)}</small></span></div></td>
      <td><span class="room-tag">${escapeHtml(resident.room)}</span></td>
      <td>${escapeHtml(resident.phone)}</td>
      <td>${formatDate(resident.startDate)}</td>
      <td><button class="row-action" type="button" data-action="remove-resident" data-id="${escapeHtml(resident.id)}" aria-label="Xóa ${escapeHtml(resident.name)} khỏi danh sách">···</button></td>
    </tr>`).join("");
}

function invoiceRows(invoices) {
  if (!invoices.length) return `<tr><td class="empty-state" colspan="5">Không có hóa đơn phù hợp.</td></tr>`;
  return invoices.map((invoice) => `
    <tr>
      <td><strong class="invoice-id">${escapeHtml(invoice.id)}</strong><small class="cell-subtitle">${escapeHtml(invoice.description)}</small></td>
      <td><div class="resident-cell compact"><span class="avatar avatar-green">${escapeHtml(initials(invoice.residentName))}</span><span><strong>${escapeHtml(invoice.residentName)}</strong><small>Phòng ${escapeHtml(invoice.room)}</small></span></div></td>
      <td class="amount-cell">${currency(invoice.amount)}</td>
      <td><span class="status ${invoice.status === "paid" ? "status-paid" : "status-pending"}"><i></i>${invoice.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span></td>
      <td>${invoice.status === "pending" ? `<button class="text-action" type="button" data-action="mark-paid" data-id="${escapeHtml(invoice.id)}">Ghi nhận</button>` : `<span class="muted">${formatDate(invoice.dueDate)}</span>`}</td>
    </tr>`).join("");
}

function renderOverview() {
  const pending = data.invoices.filter((invoice) => invoice.status === "pending");
  const occupied = occupancy();
  const capacity = data.rooms.reduce((total, room) => total + room.capacity, 0);
  const collected = data.invoices.filter((invoice) => invoice.status === "paid").reduce((total, invoice) => total + invoice.amount, 0);
  return `
    <section class="page-heading">
      <div><span class="eyebrow">TỔNG QUAN KÝ TÚC XÁ</span><h1>Chào mừng trở lại, Minh Anh <span class="wave">✳</span></h1><p>Cùng điểm qua tình hình ký túc xá hôm nay nhé.</p></div>
      <button class="button button-primary" type="button" data-action="add-resident"><span>＋</span> Thêm sinh viên</button>
    </section>
    <section class="stats-grid" aria-label="Chỉ số tổng quan">
      <article class="stat-card"><div class="stat-top"><span>Tổng sinh viên</span><span class="stat-icon icon-mint">♙</span></div><strong class="stat-value">${data.residents.length}<small>người</small></strong><div class="stat-foot"><span class="trend">↗ ${data.residents.length ? "Đang lưu trú" : "Chưa có sinh viên"}</span><span>trong ký túc xá</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Tỷ lệ lấp đầy</span><span class="stat-icon icon-blue">▦</span></div><strong class="stat-value">${capacity ? Math.round((occupied / capacity) * 100) : 0}<small>%</small></strong><div class="stat-foot"><span>${occupied}/${capacity}</span><span>chỗ đang sử dụng</span></div><div class="progress-track"><span style="width:${capacity ? Math.min((occupied / capacity) * 100, 100) : 0}%"></span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Hóa đơn chờ xử lý</span><span class="stat-icon icon-peach">◷</span></div><strong class="stat-value">${pending.length}<small>hóa đơn</small></strong><div class="stat-foot"><span class="pending-value">${currency(pending.reduce((sum, invoice) => sum + invoice.amount, 0))}</span><span>chưa thanh toán</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Đã thu tháng này</span><span class="stat-icon icon-purple">↗</span></div><strong class="stat-value stat-currency">${currency(collected)}</strong><div class="stat-foot"><span class="trend">Đã ghi nhận</span><span>trong tháng 11</span></div></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel room-overview">
        <div class="panel-heading"><div><span class="eyebrow">KHÔNG GIAN SỐNG</span><h2>Tình trạng phòng</h2></div><button class="link-button" type="button" data-view="rooms">Xem tất cả <span>→</span></button></div>
        <div class="room-list">${data.rooms.slice(0, 4).map((room) => {
          const count = roomOccupants(room.id);
          const percent = Math.min((count / room.capacity) * 100, 100);
          return `<div class="room-row"><div class="room-number">${escapeHtml(room.id)}</div><div class="room-info"><div><strong>Tòa ${escapeHtml(room.building)} · Tầng ${room.floor}</strong><span>${room.gender === "Nam" ? "Nam" : "Nữ"}</span></div><div class="room-progress"><span style="width:${percent}%"></span></div></div><span class="room-capacity">${count}<small>/${room.capacity}</small></span></div>`;
        }).join("")}</div>
        <div class="room-legend"><span><i class="legend-dot dot-green"></i>Còn chỗ</span><span><i class="legend-dot dot-orange"></i>Sắp đầy</span><span><i class="legend-dot dot-gray"></i>Đã đầy</span></div>
      </article>
      <article class="panel payment-summary">
        <div class="panel-heading"><div><span class="eyebrow">THU CHI</span><h2>Hóa đơn gần đây</h2></div><button class="link-button" type="button" data-view="payments">Tất cả <span>→</span></button></div>
          <div class="mini-invoices">${data.invoices.slice(0, 4).map((invoice) => `<div class="mini-invoice"><span class="invoice-symbol ${invoice.status === "paid" ? "symbol-paid" : "symbol-pending"}">${invoice.status === "paid" ? "✓" : "◷"}</span><div class="mini-invoice-copy"><strong>${escapeHtml(invoice.residentName)}</strong><small>${escapeHtml(invoice.description)} · ${escapeHtml(invoice.room)}</small></div><span class="mini-invoice-amount">${currency(invoice.amount)}<small class="${invoice.status === "paid" ? "paid-text" : "pending-text"}">${invoice.status === "paid" ? "Đã thu" : "Đang chờ"}</small></span></div>`).join("")}</div>
      </article>
    </section>
    <section class="panel table-panel">
      <div class="panel-heading table-heading"><div><span class="eyebrow">CỘNG ĐỒNG AN NHIÊN</span><h2>Sinh viên mới nhất</h2></div><button class="link-button" type="button" data-view="residents">Xem danh sách <span>→</span></button></div>
      <div class="table-wrap"><table><thead><tr><th>SINH VIÊN</th><th>PHÒNG</th><th>ĐIỆN THOẠI</th><th>NGÀY NHẬN PHÒNG</th><th></th></tr></thead><tbody>${residentRows(data.residents.slice(-4).reverse())}</tbody></table></div>
    </section>`;
}

function renderResidents() {
  const residents = data.residents.filter((resident) => `${resident.name} ${resident.studentId} ${resident.room} ${resident.phone}`.toLocaleLowerCase("vi").includes(searchTerm.toLocaleLowerCase("vi")));
  return `
    <section class="page-heading">
      <div><span class="eyebrow">CỘNG ĐỒNG AN NHIÊN</span><h1>Sinh viên nội trú</h1><p>Quản lý hồ sơ và thông tin lưu trú của sinh viên.</p></div>
      <button class="button button-primary" type="button" data-action="add-resident"><span>＋</span> Thêm sinh viên</button>
    </section>
    <section class="panel table-panel directory-panel">
      <div class="panel-heading directory-heading"><div><h2>Danh sách sinh viên <span class="count-pill">${data.residents.length}</span></h2><p>Thông tin sinh viên đang lưu trú tại ký túc xá.</p></div>${searchInputMarkup}</div>
      <div class="table-wrap"><table><thead><tr><th>SINH VIÊN</th><th>PHÒNG</th><th>ĐIỆN THOẠI</th><th>NGÀY NHẬN PHÒNG</th><th></th></tr></thead><tbody>${residentRows(residents)}</tbody></table></div>
      <div class="table-foot">Hiển thị ${residents.length} / ${data.residents.length} sinh viên</div>
    </section>`;
}

function renderRooms() {
  return `
    <section class="page-heading">
      <div><span class="eyebrow">KHÔNG GIAN SỐNG</span><h1>Phòng ở</h1><p>Theo dõi sức chứa và tình trạng phòng theo từng tòa.</p></div>
      <div class="occupancy-chip"><span class="legend-dot dot-green"></span>${occupancy()} / ${data.rooms.reduce((total, room) => total + room.capacity, 0)} chỗ đang sử dụng</div>
    </section>
    <section class="building-summary"><div class="building-select"><span class="building-icon">⌂</span><span><strong>Ký túc xá An Nhiên</strong><small>3 tòa nhà · ${data.rooms.length} phòng</small></span></div><span class="status status-active"><i></i>Đang hoạt động</span></section>
    <section class="room-card-grid">${data.rooms.map((room) => {
      const count = roomOccupants(room.id);
      const percent = Math.min((count / room.capacity) * 100, 100);
      const isFull = count >= room.capacity;
      const isNearlyFull = percent >= 75 && !isFull;
      return `<article class="room-card"><div class="room-card-top"><span class="room-card-icon">▦</span><span class="room-status ${isFull ? "full" : isNearlyFull ? "nearly-full" : "available"}"><i></i>${isFull ? "Đã đầy" : isNearlyFull ? "Sắp đầy" : "Còn chỗ"}</span></div><h2>Phòng ${escapeHtml(room.id)}</h2><p>Tòa ${escapeHtml(room.building)} · Tầng ${room.floor} · ${escapeHtml(room.gender)}</p><div class="room-capacity-row"><span>Sức chứa</span><strong>${count} <small>/ ${room.capacity} người</small></strong></div><div class="room-progress large"><span class="${isFull ? "full-bar" : isNearlyFull ? "nearly-full-bar" : ""}" style="width:${percent}%"></span></div><div class="room-card-bottom"><span>Phí lưu trú / tháng</span><strong>${currency(room.price)}</strong></div></article>`;
    }).join("")}</section>`;
}

function renderPayments() {
  const invoices = data.invoices.filter((invoice) => `${invoice.id} ${invoice.residentName} ${invoice.room}`.toLocaleLowerCase("vi").includes(searchTerm.toLocaleLowerCase("vi")));
  const pending = data.invoices.filter((invoice) => invoice.status === "pending");
  return `
    <section class="page-heading">
      <div><span class="eyebrow">THU CHI KÝ TÚC XÁ</span><h1>Hóa đơn & thanh toán</h1><p>Theo dõi các khoản phí và cập nhật trạng thái thanh toán.</p></div>
        <div class="month-chip"><span>▣</span> Tháng 11, 2026 <span class="chevron">⌄</span></div>
    </section>
    <section class="payment-stats"><article class="payment-stat"><span>Tổng hóa đơn</span><strong>${data.invoices.length}</strong><small>hóa đơn trong tháng</small></article><article class="payment-stat"><span>Đã thanh toán</span><strong>${data.invoices.filter((invoice) => invoice.status === "paid").length}</strong><small>đã ghi nhận thành công</small></article><article class="payment-stat pending-card"><span>Chưa thanh toán</span><strong>${pending.length}</strong><small>${currency(pending.reduce((sum, invoice) => sum + invoice.amount, 0))} đang chờ</small></article></section>
    <section class="panel table-panel directory-panel">
      <div class="panel-heading directory-heading"><div><h2>Danh sách hóa đơn <span class="count-pill">${invoices.length}</span></h2><p>Hóa đơn lưu trú tháng 11, 2026.</p></div>${searchInputMarkup}</div>
      <div class="table-wrap"><table><thead><tr><th>MÃ HÓA ĐƠN</th><th>SINH VIÊN</th><th>SỐ TIỀN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>${invoiceRows(invoices)}</tbody></table></div>
    </section>`;
}

function render() {
  const renderers = { overview: renderOverview, residents: renderResidents, rooms: renderRooms, payments: renderPayments };
  view.innerHTML = renderers[activeView]();
  const search = document.querySelector("#view-search");
  if (search) {
    search.value = searchTerm;
    search.addEventListener("input", () => {
      searchTerm = search.value;
      const cursor = search.selectionStart;
      render();
      const updatedSearch = document.querySelector("#view-search");
      updatedSearch.focus();
      updatedSearch.setSelectionRange(cursor, cursor);
    });
  }
}

function openResidentDialog() {
  const roomSelect = residentForm.elements.room;
  const availableRooms = data.rooms.filter((room) => roomOccupants(room.id) < room.capacity);
  roomSelect.innerHTML = availableRooms.map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.id)} · ${room.capacity - roomOccupants(room.id)} chỗ trống</option>`).join("");
  document.querySelector("#form-error").textContent = "";
  if (!availableRooms.length) {
    showToast("Hiện không còn phòng trống để xếp sinh viên.");
    return;
  }
  residentForm.elements.startDate.value = new Date().toISOString().slice(0, 10);
  dialog.showModal();
  residentForm.elements.name.focus();
}

function handleClick(event) {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    event.preventDefault();
    setView(viewButton.dataset.view);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  if (actionButton.dataset.action === "add-resident") openResidentDialog();
  if (actionButton.dataset.action === "remove-resident") {
    const resident = data.residents.find((item) => item.id === actionButton.dataset.id);
    if (!resident || !window.confirm(`Xóa ${resident.name} khỏi danh sách nội trú?`)) return;
    data.residents = data.residents.filter((item) => item.id !== resident.id);
    saveData();
    render();
    showToast("Đã xóa hồ sơ sinh viên.");
  }
  if (actionButton.dataset.action === "mark-paid") {
    const invoice = data.invoices.find((item) => item.id === actionButton.dataset.id);
    if (!invoice) return;
    invoice.status = "paid";
    saveData();
    render();
    showToast("Đã ghi nhận thanh toán.");
  }
}

document.addEventListener("click", handleClick);
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector(".dialog-cancel").addEventListener("click", () => dialog.close());
residentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(residentForm);
  const studentId = String(formData.get("studentId")).trim();
  const room = data.rooms.find((item) => item.id === formData.get("room"));
  const error = document.querySelector("#form-error");
  if (data.residents.some((resident) => resident.studentId.toLowerCase() === studentId.toLowerCase())) {
    error.textContent = "Mã sinh viên này đã có trong danh sách.";
    residentForm.elements.studentId.focus();
    return;
  }
  if (!room || roomOccupants(room.id) >= room.capacity) {
    error.textContent = "Phòng đã đầy. Vui lòng chọn phòng khác.";
    return;
  }
  const resident = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(formData.get("name")).trim(),
    studentId,
    phone: String(formData.get("phone")).trim(),
    email: String(formData.get("email")).trim(),
    room: room.id,
    startDate: String(formData.get("startDate"))
  };
  data.residents.push(resident);
  saveData();
  residentForm.reset();
  dialog.close();
  setView("residents");
  showToast("Đã thêm sinh viên vào danh sách.");
});
document.querySelector("#reset-data").addEventListener("click", () => {
  if (!window.confirm("Khôi phục dữ liệu mẫu? Các thay đổi đã lưu trên trình duyệt sẽ bị xóa.")) return;
  data = structuredClone(initialData);
  saveData();
  setView("overview");
  showToast("Đã khôi phục dữ liệu mẫu.");
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
render();
