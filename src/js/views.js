import { localDate } from "./date.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));
const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
const date = (value) => value ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—";
const time = (value) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const member = (data, id) => data.members.find((item) => item.id === id);
const planName = (data, id) => escapeHtml(data.plans.find((item) => item.id === id)?.name || "Gói đã xóa");
const initials = (name = "") => name.trim().split(/\s+/).slice(-2).map((part) => part[0] || "").join("").toUpperCase();
const avatar = (name = "?") => `<span class="avatar">${escapeHtml(initials(name))}</span>`;
const empty = (title, detail) => `<div class="empty-state"><span>⌕</span><strong>${title}</strong><p>${detail}</p></div>`;
const heading = (eyebrow, title, description, action = "") => `<section class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div>${action}</section>`;
const actionButton = (label, action, extra = "") => `<button class="button button-primary" data-action="${action}" ${extra}><span>＋</span>${label}</button>`;
const currentStatus = (item) => item.status !== "active" || item.expiresAt < localDate() ? "expired" : "active";
const statusLabel = (item) => {
  const status = currentStatus(item);
  if (status === "expired") return '<span class="status-tag status-expired">Hết hạn</span>';
  const remaining = Math.ceil((new Date(`${item.expiresAt}T00:00:00`) - new Date(`${localDate()}T00:00:00`)) / 86400000);
  return remaining <= 14 ? `<span class="status-tag status-warning">Còn ${remaining} ngày</span>` : '<span class="status-tag status-active">Đang hoạt động</span>';
};
const todayCheckins = (data) => data.checkins.filter((entry) => localDate(entry.time) === localDate());

export function renderDashboard(data) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "buổi sáng" : hour < 18 ? "buổi chiều" : "buổi tối";
  const active = data.members.filter((item) => currentStatus(item) === "active");
  const todayEntries = todayCheckins(data);
  const expiring = active.filter((item) => (new Date(`${item.expiresAt}T00:00:00`) - new Date(`${localDate()}T00:00:00`)) / 86400000 <= 14);
  const month = localDate().slice(0, 7);
  const revenue = data.payments.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0);
  const recentPayments = [...data.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentVisits = [...todayEntries].slice(0, 5);
  return `${heading("TỔNG QUAN PHÒNG TẬP", `Chào ${greeting}, Admin ✦`, "Cùng xem nhanh tình hình hoạt động hôm nay.", actionButton("Thêm hội viên", "add-member"))}
    <section class="stats-grid">
      <article class="stat-card"><div class="stat-top"><span>Hội viên hoạt động</span><i class="stat-icon icon-purple">♧</i></div><strong>${active.length}</strong><small>Gói tập còn hiệu lực</small></article>
      <article class="stat-card"><div class="stat-top"><span>Check-in hôm nay</span><i class="stat-icon icon-blue">⌁</i></div><strong>${todayEntries.length}</strong><small>Lượt vào phòng tập</small></article>
      <article class="stat-card"><div class="stat-top"><span>Doanh thu tháng này</span><i class="stat-icon icon-green">₫</i></div><strong class="stat-money">${money(revenue)}</strong><small>${data.payments.filter((item) => item.date.startsWith(month)).length} khoản thanh toán</small></article>
      <article class="stat-card"><div class="stat-top"><span>Sắp hết hạn</span><i class="stat-icon icon-orange">◷</i></div><strong>${expiring.length}</strong><small>Trong vòng 14 ngày</small></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel"><div class="panel-heading"><div><h2>Lượt check-in hôm nay</h2><p>Hội viên đang đến tập luyện</p></div><a class="text-button" href="./checkin.html">Check-in <span>→</span></a></div>
        ${recentVisits.length ? `<div class="activity-list">${recentVisits.map((entry) => `<div class="activity-row">${avatar(member(data, entry.memberId)?.name)}<div class="activity-person"><strong>${escapeHtml(member(data, entry.memberId)?.name || "Hội viên")}</strong><span>${escapeHtml(member(data, entry.memberId)?.phone || "")}</span></div><time>${time(entry.time)}</time><span class="check-dot">✓</span></div>`).join("")}</div>` : empty("Chưa có lượt vào", "Check-in hội viên để bắt đầu thống kê.")}</article>
      <article class="panel"><div class="panel-heading"><div><h2>Hội viên cần gia hạn</h2><p>Chủ động nhắc trước khi hết hạn</p></div><span class="pill-count">${expiring.length}</span></div>
        ${expiring.length ? `<div class="expiring-list">${expiring.slice(0, 4).map((item) => `<div class="expiring-row">${avatar(item.name)}<div class="activity-person"><strong>${escapeHtml(item.name)}</strong><span>Hết hạn ${date(item.expiresAt)}</span></div><button class="mini-link" data-action="payment" data-id="${item.id}">Gia hạn</button></div>`).join("")}</div>` : empty("Không có gói sắp hết hạn", "Các hội viên hiện vẫn đang tập luyện.")}</article>
    </section>
    <article class="panel"><div class="panel-heading"><div><h2>Thanh toán gần đây</h2><p>Các giao dịch mới nhất tại phòng tập</p></div><a class="text-button" href="./finance.html">Xem thu chi <span>→</span></a></div>
      <div class="table-scroll"><table><thead><tr><th>HỘI VIÊN</th><th>GÓI TẬP</th><th>NGÀY</th><th>SỐ TIỀN</th></tr></thead><tbody>${recentPayments.length ? recentPayments.map((payment) => `<tr><td><div class="member-cell">${avatar(member(data, payment.memberId)?.name)}<strong>${escapeHtml(member(data, payment.memberId)?.name || "Hội viên")}</strong></div></td><td>${planName(data, payment.planId)}</td><td>${date(payment.date)}</td><td><strong class="amount-text">${money(payment.amount)}</strong></td></tr>`).join("") : '<tr><td colspan="4">Chưa có thanh toán.</td></tr>'}</tbody></table></div>
    </article>`;
}

export function renderMembers(data, query = "", filter = "all") {
  const needle = query.trim().toLocaleLowerCase("vi");
  const members = data.members.filter((item) => {
    const matches = `${item.name} ${item.phone} ${item.email} ${item.id}`.toLocaleLowerCase("vi").includes(needle);
    return matches && (filter === "all" || currentStatus(item) === filter);
  });
  return `${heading("QUẢN LÝ KHÁCH HÀNG", "Hội viên", "Quản lý thông tin, gói tập và thời hạn hội viên.", actionButton("Thêm hội viên", "add-member"))}
    <section class="panel table-panel"><div class="table-toolbar"><label class="search-wrap"><span>⌕</span><input id="member-search" type="search" placeholder="Tìm tên, số điện thoại..." value="${escapeHtml(query)}" aria-label="Tìm hội viên"></label><label class="filter-wrap"><span>Trạng thái</span><select id="member-filter" aria-label="Lọc trạng thái"><option value="all" ${filter === "all" ? "selected" : ""}>Tất cả</option><option value="active" ${filter === "active" ? "selected" : ""}>Còn hạn</option><option value="expired" ${filter === "expired" ? "selected" : ""}>Hết hạn</option></select></label><span class="result-count">${members.length} hội viên</span></div>
    <div class="table-scroll"><table><thead><tr><th>HỘI VIÊN</th><th>LIÊN HỆ</th><th>GÓI TẬP</th><th>NGÀY THAM GIA</th><th>HẠN SỬ DỤNG</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>${members.length ? members.map((item) => `<tr><td><div class="member-cell">${avatar(item.name)}<div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.id)}</span></div></div></td><td><div class="contact-cell"><strong>${escapeHtml(item.phone)}</strong><span>${escapeHtml(item.email || "Chưa có email")}</span></div></td><td>${planName(data, item.planId)}</td><td>${date(item.joinedAt)}</td><td>${date(item.expiresAt)}</td><td>${statusLabel(item)}</td><td><div class="row-actions"><button class="icon-button" data-action="edit-member" data-id="${item.id}" aria-label="Sửa ${escapeHtml(item.name)}">✎</button><button class="icon-button action-delete" data-action="delete-member" data-id="${item.id}" aria-label="Xóa ${escapeHtml(item.name)}">×</button><button class="icon-button" data-action="payment" data-id="${item.id}" aria-label="Gia hạn ${escapeHtml(item.name)}">↻</button></div></td></tr>`).join("") : `<tr><td colspan="7">${empty("Không tìm thấy hội viên", "Thử thay đổi từ khóa hoặc bộ lọc.")}</td></tr>`}</tbody></table></div></section>`;
}

export function renderCheckin(data, query = "") {
  const eligible = data.members.filter((item) => currentStatus(item) === "active" && `${item.name} ${item.phone} ${item.id}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  const visits = todayCheckins(data);
  return `${heading("HOẠT ĐỘNG HÔM NAY", "Check-in", "Xác nhận lượt vào tập của hội viên trong vài giây.", `<span class="date-chip">◷ &nbsp;${date(localDate())}</span>`)}
    <section class="checkin-layout"><article class="panel"><div class="panel-heading"><div><h2>Tìm hội viên</h2><p>Chỉ hội viên còn hạn mới có thể check-in.</p></div></div><label class="search-wrap wide-search"><span>⌕</span><input id="checkin-search" type="search" placeholder="Nhập tên, mã hoặc số điện thoại..." value="${escapeHtml(query)}" aria-label="Tìm hội viên để check-in"></label><div class="member-picker">${eligible.length ? eligible.map((item) => `<div class="picker-row">${avatar(item.name)}<div class="picker-name"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.phone)} · ${planName(data, item.planId)}</small></div>${statusLabel(item)}<button class="button button-primary button-small" data-action="checkin" data-id="${item.id}" ${visits.some((visit) => visit.memberId === item.id) ? "disabled" : ""}>${visits.some((visit) => visit.memberId === item.id) ? "Đã vào" : "Check-in"}</button></div>`).join("") : empty("Không có hội viên đủ điều kiện", "Cần một gói tập còn hiệu lực để check-in.")}</div></article>
    <article class="panel"><div class="panel-heading"><div><h2>Lượt vào hôm nay</h2><p>${visits.length} lượt đã xác nhận</p></div><span class="pill-count">${visits.length}</span></div>${visits.length ? `<div class="activity-list">${visits.map((visit) => `<div class="activity-row">${avatar(member(data, visit.memberId)?.name)}<div class="activity-person"><strong>${escapeHtml(member(data, visit.memberId)?.name || "Hội viên")}</strong><span>Vào ${time(visit.time)}${visit.checkOutTime ? ` · Ra ${time(visit.checkOutTime)}` : " · Đang tập"}</span></div>${visit.checkOutTime ? '<span class="status-tag status-active">Đã ra</span>' : `<button class="button button-outline button-small" data-action="checkout" data-id="${escapeHtml(visit.id)}">Check-out</button>`}</div>`).join("")}</div>` : empty("Chưa có lượt check-in", "Lượt vào tập đầu tiên sẽ hiển thị ở đây.")}</article></section>`;
}

export function renderPlans(data) {
  const colors = ["plan-green", "plan-gold", "plan-blue"];
  return `${heading("SẢN PHẨM & DỊCH VỤ", "Gói tập", "Thiết lập giá, thời hạn và quyền lợi hội viên.", actionButton("Tạo gói tập", "add-plan"))}
    <section class="plan-grid">${data.plans.length ? data.plans.map((plan, index) => `<article class="plan-card ${colors[index % colors.length]}"><div class="plan-card-top"><span class="plan-icon">${["◈", "✦", "◇"][index % 3]}</span><div class="row-actions"><button class="icon-button" data-action="edit-plan" data-id="${plan.id}" aria-label="Sửa ${escapeHtml(plan.name)}">✎</button><button class="icon-button action-delete" data-action="delete-plan" data-id="${plan.id}" aria-label="Xóa ${escapeHtml(plan.name)}">×</button></div></div><span class="eyebrow">${plan.duration} NGÀY</span><h2>${escapeHtml(plan.name)}</h2><p>${escapeHtml(plan.description || "Gói tập dành cho mọi cấp độ.")}</p><strong class="plan-price">${money(plan.price)}</strong><div class="plan-benefit"><span>Thời hạn</span><strong>${plan.duration} ngày</strong></div><div class="plan-benefit"><span>Hội viên đang dùng</span><strong>${data.members.filter((item) => item.planId === plan.id).length}</strong></div><button class="button button-outline plan-register" data-action="payment" data-plan-id="${plan.id}">Đăng ký hội viên <span>→</span></button></article>`).join("") : empty("Chưa có gói tập", "Tạo gói đầu tiên cho phòng tập.")}</section>`;
}

export function renderClasses(data, selectedDate) {
  const classes = data.classes.filter((item) => item.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const dayTabs = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() + index);
    const value = localDate(day);
    const weekday = index === 0 ? "Hôm nay" : new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(day);
    return `<button class="date-tab ${selectedDate === value ? "selected" : ""}" data-date="${value}"><span>${weekday}</span><strong>${day.getDate()}</strong></button>`;
  }).join("");
  return `${heading("LỚP HỌC NHÓM", "Lịch lớp", "Sắp xếp lịch huấn luyện và danh sách tham gia.", actionButton("Tạo lớp học", "add-class"))}
    <div class="class-date-toolbar"><div class="date-tabs">${dayTabs}</div><span class="date-chip">${date(selectedDate)}</span></div>
    <section class="class-list">${classes.length ? classes.map((item) => `<article class="class-card"><div class="class-time"><strong>${escapeHtml(item.time)}</strong><span>${escapeHtml(item.room)}</span></div><div class="class-color-bar"></div><div class="class-details"><span class="eyebrow">${escapeHtml(item.coach)}</span><h2>${escapeHtml(item.name)}</h2><p>${item.attendees.length} / ${item.capacity} học viên</p><div class="attendee-stack">${item.attendees.slice(0, 6).map((id) => avatar(member(data, id)?.name)).join("")}</div></div><div class="class-actions"><button class="button button-outline button-small" data-action="attendance" data-id="${item.id}">Học viên</button><button class="icon-button" data-action="edit-class" data-id="${item.id}" aria-label="Sửa lớp">✎</button><button class="icon-button action-delete" data-action="delete-class" data-id="${item.id}" aria-label="Xóa lớp">×</button></div></article>`).join("") : empty("Chưa có lớp trong ngày này", "Chọn một ngày khác hoặc tạo lớp học mới.")}</section>`;
}

export function renderFinance(data) {
  const month = localDate().slice(0, 7);
  const income = data.payments.filter((item) => item.date.startsWith(month));
  const expenses = data.expenses.filter((item) => item.date.startsWith(month));
  const revenue = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const spending = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const records = [
    ...data.payments.map((item) => ({ ...item, type: "Thu", title: member(data, item.memberId)?.name || "Hội viên", detail: planName(data, item.planId) })),
    ...data.expenses.map((item) => ({ ...item, type: "Chi", title: item.category, detail: item.description })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return `${heading("DOANH THU & CHI PHÍ", "Thu chi", "Theo dõi các khoản thu và chi phí vận hành.", `<div class="finance-actions">${actionButton("Khoản chi", "add-expense")}<button class="button button-primary" data-action="add-payment"><span>＋</span>Thanh toán</button></div>`)}
    <section class="finance-summary"><article class="finance-highlight"><span>DOANH THU THÁNG NÀY</span><strong>${money(revenue)}</strong><p>${income.length} giao dịch</p></article><article class="finance-small"><span>Chi phí tháng này</span><strong>${money(spending)}</strong><small>${expenses.length} khoản chi</small></article><article class="finance-small"><span>Chênh lệch thu — chi</span><strong>${money(revenue - spending)}</strong><small>Ước tính trong tháng</small></article></section>
    <article class="panel table-panel"><div class="panel-heading"><div><h2>Lịch sử giao dịch</h2><p>Doanh thu và chi phí phòng tập</p></div><button class="button button-danger" data-action="delete-all-transactions" ${records.length ? "" : "disabled"}>Xóa tất cả</button></div><div class="table-scroll"><table><thead><tr><th>MÃ</th><th>LOẠI</th><th>NỘI DUNG</th><th>NGÀY</th><th>PHƯƠNG THỨC</th><th>SỐ TIỀN</th><th>THAO TÁC</th></tr></thead><tbody>${records.length ? records.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td><span class="transaction-type ${item.type === "Thu" ? "type-income" : "type-expense"}">${item.type}</span></td><td><div class="contact-cell"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div></td><td>${date(item.date)}</td><td>${escapeHtml(item.method)}</td><td><strong class="${item.type === "Thu" ? "amount-text" : "expense-text"}">${item.type === "Chi" ? "− " : "+ "}${money(item.amount)}</strong></td><td><button class="icon-button action-delete" data-action="delete-transaction" data-type="${item.type === "Thu" ? "payment" : "expense"}" data-id="${escapeHtml(item.id)}" aria-label="Xóa giao dịch ${escapeHtml(item.id)}" title="Xóa giao dịch">×</button></td></tr>`).join("") : `<tr><td colspan="7">${empty("Chưa có giao dịch", "Các khoản thu và chi sẽ xuất hiện ở đây.")}</td></tr>`}</tbody></table></div></article>`;
}

export function renderInspiration(state) {
  const quoteContent = state.status === "loading"
    ? '<div class="quote-state"><span class="loader"></span><strong>Đang tải gợi ý tập luyện...</strong><p>Đang kết nối dịch vụ nội dung.</p></div>'
    : state.status === "error"
      ? `<div class="quote-state quote-error"><strong>Chưa thể tải gợi ý lúc này</strong><p>${escapeHtml(state.message)}</p><button class="button button-outline" data-action="retry-quote">Thử lại</button></div>`
      : state.data
        ? `<blockquote class="quote-card"><span class="quote-mark">“</span><p>${escapeHtml(state.data.quote)}</p><footer>${escapeHtml(state.data.author || "FitDesk")}</footer></blockquote>`
        : '<div class="quote-state"><strong>Mỗi buổi tập là một bước tiến</strong><p>Nhận một lời nhắc ngẫu nhiên để tiếp thêm động lực hôm nay.</p><button class="button button-primary" data-action="retry-quote">Lấy gợi ý</button></div>';
  return `${heading("SỨC KHỎE & ĐỘNG LỰC", "Gợi ý tập luyện", "Một chút cảm hứng cho hành trình khỏe mạnh hơn.", '<a class="button button-outline" href="./index.html">← Tổng quan</a>')}
    <section class="inspiration-layout"><article class="inspiration-panel"><span class="eyebrow">✦ &nbsp;ĐỘNG LỰC MỖI NGÀY</span><div id="quote-content">${quoteContent}</div><button class="button button-outline" data-action="retry-quote">↻ &nbsp;Gợi ý khác</button></article><aside class="api-note"><span class="api-note-icon">↗</span><p class="eyebrow">FETCH API</p><h2>Lời nhắc từ cộng đồng</h2><p>Trích dẫn được tải bất đồng bộ từ dịch vụ công khai. Nếu mạng hoặc dịch vụ gặp sự cố, bạn có thể thử lại.</p><span class="api-badge"><i></i>${state.status === "loading" ? "Đang kết nối" : state.status === "error" ? "Tạm ngoại tuyến" : state.data ? "Đã tải nội dung" : "Sẵn sàng tải"}</span></aside></section>`;
}
