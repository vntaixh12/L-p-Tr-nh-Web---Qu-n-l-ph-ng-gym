import { addCheckin, addCheckout, addExpense, addPayment, deleteAllTransactions, deleteClass, deleteExpense, deleteMember, deletePayment, deletePlan, getData, resetData, saveClass, saveMember, savePlan, toggleAttendee } from "./store.js";
import { addDays, localDate } from "./date.js";
import { renderCheckin, renderClasses, renderDashboard, renderFinance, renderInspiration, renderMembers, renderPlans } from "./views.js";
import "./shell.js";

const pageRoot = document.querySelector("#page-content");
const modalRoot = document.querySelector("#modal-root");
const titles = { dashboard: "Tổng quan", members: "Hội viên", checkin: "Check-in", plans: "Gói tập", classes: "Lịch lớp", finance: "Thu chi", inspiration: "Gợi ý tập luyện" };
const pageFiles = { dashboard: "index.html", members: "members.html", checkin: "checkin.html", plans: "plans.html", classes: "classes.html", finance: "finance.html", inspiration: "inspiration.html" };
const pageFromPath = () => Object.keys(pageFiles).find((page) => pageFiles[page] === decodeURIComponent(location.pathname.split("/").pop() || "")) || "dashboard";
const safe = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const byId = (collection, id) => collection.find((item) => item.id === id);

let currentPage = pageFromPath();
let memberQuery = "";
let memberFilter = "all";
let checkinQuery = "";
let classDate = localDate();
let quoteState = { status: "idle", data: null, message: "" };
let quoteRequest = 0;

function render() {
  const data = getData();
  document.querySelector("#member-nav-count").textContent = data.members.length;
  const pages = {
    dashboard: () => renderDashboard(data),
    members: () => renderMembers(data, memberQuery, memberFilter),
    checkin: () => renderCheckin(data, checkinQuery),
    plans: () => renderPlans(data),
    classes: () => renderClasses(data, classDate),
    finance: () => renderFinance(data),
    inspiration: () => renderInspiration(quoteState),
  };
  pageRoot.innerHTML = pages[currentPage]();
}

function navigate(page) {
  if (!pageFiles[page] || page === currentPage) return;
  window.location.assign(`./${pageFiles[page]}`);
}

function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast toast-${type}`;
  const icon = document.createElement("span");
  icon.textContent = type === "success" ? "✓" : "!";
  node.append(icon, document.createTextNode(message));
  document.querySelector("#toast-region").append(node);
  window.setTimeout(() => node.remove(), 3200);
}

function closeModal() {
  modalRoot.replaceChildren();
  document.removeEventListener("keydown", modalKey);
}
function modalKey(event) { if (event.key === "Escape") closeModal(); }
function openModal(title, content) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const dialog = document.createElement("section");
  dialog.className = "modal-card";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "modal-title");
  const header = document.createElement("header");
  header.className = "modal-header";
  const heading = document.createElement("h2");
  heading.id = "modal-title";
  heading.textContent = title;
  const close = document.createElement("button");
  close.className = "icon-button modal-close";
  close.type = "button";
  close.setAttribute("aria-label", "Đóng");
  close.textContent = "×";
  close.addEventListener("click", closeModal);
  header.append(heading, close);
  const body = document.createElement("div");
  body.className = "modal-body";
  body.innerHTML = content;
  dialog.append(header, body);
  backdrop.append(dialog);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeModal(); });
  modalRoot.replaceChildren(backdrop);
  document.addEventListener("keydown", modalKey);
  modalRoot.querySelector("input, select, button")?.focus();
}

const field = (label, name, value = "", type = "text", required = true, options = "") =>
  `<label class="form-field"><span>${label}${required ? " *" : ""}</span><input name="${name}" type="${type}" value="${safe(value)}" ${required ? "required" : ""} ${options}></label>`;
const selectField = (label, name, choices, selected = "") =>
  `<label class="form-field"><span>${label} *</span><select name="${name}" required>${choices.map(([value, text]) => `<option value="${safe(value)}" ${value === selected ? "selected" : ""}>${safe(text)}</option>`).join("")}</select></label>`;
const formActions = (label) => `<div class="form-actions"><button class="button button-outline" type="button" data-close>Hủy</button><button class="button button-primary" type="submit">${label}</button></div>`;

function submitForm(selector, handler) {
  modalRoot.querySelector(selector).addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      handler(Object.fromEntries(new FormData(event.currentTarget).entries()));
    } catch (error) {
      toast(error.message || "Không thể lưu dữ liệu.", "error");
    }
  });
  modalRoot.querySelector("[data-close]").addEventListener("click", closeModal);
}

function memberForm(id = "") {
  const data = getData();
  const old = byId(data.members, id);
  if (!data.plans.length) return toast("Hãy tạo một gói tập trước.", "error");
  const value = old || { name: "", phone: "", email: "", gender: "Nam", joinedAt: localDate(), planId: data.plans[0].id, expiresAt: "" };
  const plans = data.plans.map((plan) => [plan.id, `${plan.name} — ${new Intl.NumberFormat("vi-VN").format(plan.price)}đ`]);
  openModal(old ? "Chỉnh sửa hội viên" : "Thêm hội viên", `<form id="member-form" class="form-grid">${field("Họ và tên", "name", value.name)}${field("Số điện thoại", "phone", value.phone, "tel")}<label class="form-field"><span>Email</span><input name="email" type="email" value="${safe(value.email)}"></label>${selectField("Giới tính", "gender", [["Nam", "Nam"], ["Nữ", "Nữ"], ["Khác", "Khác"]], value.gender)}${selectField("Gói tập", "planId", plans, value.planId)}${field("Ngày tham gia", "joinedAt", value.joinedAt, "date")}${field("Ngày hết hạn", "expiresAt", value.expiresAt, "date", false)}${formActions(old ? "Cập nhật hội viên" : "Thêm hội viên")}</form>`);
  submitForm("#member-form", (form) => {
    if (!form.expiresAt) form.expiresAt = addDays(form.joinedAt, byId(getData().plans, form.planId).duration);
    saveMember({ ...form, id: old?.id, status: form.expiresAt < localDate() ? "expired" : "active" });
    closeModal(); render(); toast(old ? "Đã cập nhật hội viên." : "Đã thêm hội viên.");
  });
}

function planForm(id = "") {
  const old = byId(getData().plans, id);
  const value = old || { name: "", duration: 30, price: "", description: "" };
  openModal(old ? "Chỉnh sửa gói tập" : "Tạo gói tập", `<form id="plan-form" class="form-grid">${field("Tên gói", "name", value.name)}${field("Thời hạn (ngày)", "duration", value.duration, "number", true, 'min="1"')}${field("Giá (VNĐ)", "price", value.price, "number", true, 'min="0"')}${field("Mô tả", "description", value.description, "text", false)}${formActions(old ? "Lưu gói tập" : "Tạo gói")}</form>`);
  submitForm("#plan-form", (form) => {
    savePlan({ ...form, id: old?.id }); closeModal(); render(); toast(old ? "Đã cập nhật gói tập." : "Đã tạo gói tập.");
  });
}

function paymentForm(memberId = "", planId = "") {
  const data = getData();
  if (!data.members.length || !data.plans.length) return toast("Cần có hội viên và gói tập trước khi thanh toán.", "error");
  const members = data.members.map((item) => [item.id, `${item.name} · ${item.phone}`]);
  const plans = data.plans.map((item) => [item.id, `${item.name} · ${new Intl.NumberFormat("vi-VN").format(item.price)}đ`]);
  openModal("Ghi nhận thanh toán", `<form id="payment-form" class="form-grid">${selectField("Hội viên", "memberId", members, memberId || data.members[0].id)}${selectField("Gói tập", "planId", plans, planId || data.plans[0].id)}${selectField("Phương thức", "method", [["Tiền mặt", "Tiền mặt"], ["Chuyển khoản", "Chuyển khoản"], ["Thẻ", "Thẻ ngân hàng"]])}<p class="form-note">Hạn sử dụng sẽ được cộng theo thời hạn của gói.</p>${formActions("Lưu thanh toán")}</form>`);
  submitForm("#payment-form", (form) => { addPayment(form); closeModal(); render(); toast("Đã ghi nhận thanh toán và cập nhật hạn gói."); });
}

function expenseForm() {
  openModal("Ghi nhận khoản chi", `<form id="expense-form" class="form-grid">${selectField("Danh mục", "category", [["Điện nước", "Điện nước"], ["Lương nhân viên", "Lương nhân viên"], ["Thuê mặt bằng", "Thuê mặt bằng"], ["Thiết bị", "Thiết bị"], ["Vệ sinh", "Vệ sinh"], ["Marketing", "Marketing"], ["Khác", "Khác"]])}${field("Số tiền (VNĐ)", "amount", "", "number", true, 'min="1"')}${field("Ngày chi", "date", localDate(), "date")}${selectField("Phương thức", "method", [["Tiền mặt", "Tiền mặt"], ["Chuyển khoản", "Chuyển khoản"], ["Thẻ", "Thẻ ngân hàng"]])}<label class="form-field form-field-full"><span>Nội dung chi *</span><input name="description" required maxlength="180"></label>${formActions("Lưu khoản chi")}</form>`);
  submitForm("#expense-form", (form) => { addExpense(form); closeModal(); render(); toast("Đã ghi nhận khoản chi."); });
}

function classForm(id = "") {
  const old = byId(getData().classes, id);
  const value = old || { name: "", coach: "", time: "09:00", date: classDate, capacity: 16, room: "Phòng A" };
  openModal(old ? "Chỉnh sửa lớp học" : "Tạo lớp học", `<form id="class-form" class="form-grid">${field("Tên lớp", "name", value.name)}${field("Huấn luyện viên", "coach", value.coach)}${field("Ngày học", "date", value.date, "date")}${field("Giờ học", "time", value.time, "time")}${field("Sức chứa", "capacity", value.capacity, "number", true, `min="${old?.attendees.length || 1}"`)}${field("Phòng tập", "room", value.room)}${formActions(old ? "Lưu lớp" : "Tạo lớp")}</form>`);
  submitForm("#class-form", (form) => {
    saveClass({ ...form, id: old?.id, attendees: old?.attendees || [] });
    classDate = form.date; closeModal(); render(); toast(old ? "Đã cập nhật lớp học." : "Đã tạo lớp học.");
  });
}

function attendanceModal(classId) {
  const data = getData();
  const gymClass = byId(data.classes, classId);
  const eligible = data.members.filter((item) => item.status === "active" && item.expiresAt >= localDate());
  openModal(`Học viên · ${gymClass.name}`, `<p class="form-note">${gymClass.date} · ${gymClass.time} · ${gymClass.attendees.length}/${gymClass.capacity} chỗ</p><div class="attendance-list">${eligible.map((item) => `<label class="attendance-row"><input type="checkbox" data-attendee="${item.id}" ${gymClass.attendees.includes(item.id) ? "checked" : ""}><span>${safe(item.name)}<small>${safe(item.phone)}</small></span></label>`).join("") || "<p>Chưa có hội viên đủ điều kiện.</p>"}</div><div class="form-actions"><button class="button button-outline" type="button" data-close>Đóng</button></div>`);
  modalRoot.querySelector("[data-close]").addEventListener("click", closeModal);
  modalRoot.querySelectorAll("[data-attendee]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    try {
      toggleAttendee(classId, checkbox.dataset.attendee);
      render(); attendanceModal(classId); toast(checkbox.checked ? "Đã đăng ký học viên vào lớp." : "Đã hủy đăng ký học viên.");
    } catch (error) { checkbox.checked = false; toast(error.message, "error"); }
  }));
}

function confirm(message, label, action) {
  openModal("Xác nhận thao tác", `<p class="confirm-copy">${message}</p><div class="form-actions"><button class="button button-outline" data-close>Hủy</button><button class="button button-danger" id="confirm-action">${label}</button></div>`);
  modalRoot.querySelector("[data-close]").addEventListener("click", closeModal);
  modalRoot.querySelector("#confirm-action").addEventListener("click", () => {
    try { action(); closeModal(); render(); toast("Đã hoàn tất thao tác."); }
    catch (error) { toast(error.message, "error"); }
  });
}

async function loadQuote() {
  // Avoid stale results when a new request is started before the previous one finishes.
  const requestId = ++quoteRequest;
  quoteState = { status: "loading", data: null, message: "" };
  render();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://dummyjson.com/quotes/random", { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Dịch vụ trả về HTTP ${response.status}.`);
    const result = await response.json();
    if (typeof result.quote !== "string" || !result.quote.trim()) throw new Error("Dữ liệu gợi ý không đúng định dạng.");
    if (requestId !== quoteRequest) return;
    quoteState = { status: "success", data: { quote: result.quote, author: result.author || "" }, message: "" };
  } catch (error) {
    if (requestId !== quoteRequest) return;
    console.error("Không thể tải gợi ý tập luyện:", error);
    quoteState = { status: "error", data: null, message: error.name === "AbortError" ? "Yêu cầu quá thời gian chờ. Kiểm tra kết nối và thử lại." : "Không kết nối được dịch vụ. Kiểm tra mạng rồi thử lại." };
  } finally {
    window.clearTimeout(timeout);
    if (requestId === quoteRequest && currentPage === "inspiration") render();
  }
}

pageRoot.addEventListener("click", (event) => {
  const dateButton = event.target.closest("[data-date]");
  if (dateButton) { classDate = dateButton.dataset.date; render(); return; }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  try {
    switch (action) {
      case "add-member": memberForm(); break;
      case "edit-member": memberForm(id); break;
      case "delete-member": confirm("Xóa hội viên cùng các lượt check-in và đăng ký lớp của người này? Lịch sử thanh toán vẫn được giữ lại.", "Xóa hội viên", () => deleteMember(id)); break;
      case "add-plan": planForm(); break;
      case "edit-plan": planForm(id); break;
      case "delete-plan": confirm("Bạn có chắc muốn xóa gói tập này?", "Xóa gói tập", () => deletePlan(id)); break;
      case "add-class": classForm(); break;
      case "edit-class": classForm(id); break;
      case "delete-class": confirm("Bạn có chắc muốn xóa lớp học này?", "Xóa lớp học", () => deleteClass(id)); break;
      case "attendance": attendanceModal(id); break;
      case "payment": paymentForm(id || "", button.dataset.planId || ""); break;
      case "add-payment": paymentForm(); break;
      case "add-expense": expenseForm(); break;
      case "delete-all-transactions":
        confirm("Bạn có chắc muốn xóa toàn bộ lịch sử thu và chi? Thao tác này không thể hoàn tác và không làm thay đổi hạn gói của hội viên.", "Xóa tất cả", deleteAllTransactions);
        break;
      case "delete-transaction":
        if (button.dataset.type === "payment") {
          confirm("Xóa lịch sử thanh toán này? Thao tác này không thay đổi hạn sử dụng gói của hội viên.", "Xóa giao dịch", () => deletePayment(id));
        } else if (button.dataset.type === "expense") {
          confirm("Xóa khoản chi này khỏi lịch sử và tổng chi phí?", "Xóa khoản chi", () => deleteExpense(id));
        } else {
          throw new Error("Loại giao dịch không hợp lệ.");
        }
        break;
      case "checkin":
        addCheckin(id); render(); toast(`Check-in thành công: ${byId(getData().members, id)?.name || "hội viên"}.`); break;
      case "checkout":
        addCheckout(id); render(); toast("Đã ghi nhận check-out."); break;
      case "retry-quote": loadQuote(); break;
    }
  } catch (error) { toast(error.message || "Không thể hoàn thành thao tác.", "error"); }
});

pageRoot.addEventListener("input", (event) => {
  if (event.target.id === "member-search" || event.target.id === "checkin-search") {
    const inputId = event.target.id;
    const position = event.target.selectionStart;
    if (inputId === "member-search") memberQuery = event.target.value;
    else checkinQuery = event.target.value;
    render();
    const replacement = document.getElementById(inputId);
    replacement.focus();
    replacement.setSelectionRange(position, position);
  }
});
pageRoot.addEventListener("change", (event) => {
  if (event.target.id === "member-filter") { memberFilter = event.target.value; render(); }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-page]");
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(link.dataset.page);
});

const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menu-toggle");
const closeSidebar = () => { sidebar.classList.remove("sidebar-open"); menuToggle.setAttribute("aria-expanded", "false"); };
menuToggle.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("sidebar-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
document.querySelector("#sidebar-backdrop").addEventListener("click", closeSidebar);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSidebar(); });
document.querySelector("#reset-data").addEventListener("click", () => confirm("Khôi phục toàn bộ dữ liệu phòng tập mẫu? Dữ liệu hiện tại sẽ bị thay thế.", "Khôi phục", resetData));
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "short" }).format(new Date());
document.title = `FitDesk — ${titles[currentPage]}`;
document.querySelector("#page-label").textContent = titles[currentPage];
document.querySelectorAll(".nav-link").forEach((link) => {
  const isActive = link.dataset.page === currentPage;
  link.classList.toggle("active", isActive);
  if (isActive) link.setAttribute("aria-current", "page");
});
render();
if (currentPage === "inspiration") loadQuote();
