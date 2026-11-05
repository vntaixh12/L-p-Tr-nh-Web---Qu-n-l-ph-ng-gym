const pages = [
  ["dashboard", "index.html", "▦", "Tổng quan"],
  ["members", "members.html", "♧", "Hội viên"],
  ["checkin", "checkin.html", "⌁", "Check-in"],
  ["plans", "plans.html", "◈", "Gói tập"],
  ["classes", "classes.html", "▤", "Lịch lớp"],
  ["finance", "finance.html", "◷", "Thu chi"],
  ["inspiration", "inspiration.html", "✦", "Gợi ý tập luyện"],
];

const root = document.querySelector("#app-shell");
if (!root) throw new Error("Không tìm thấy vùng hiển thị ứng dụng.");

root.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="./index.html" aria-label="FitDesk — trang tổng quan">
        <span class="brand-mark">F</span>
        <span class="brand-copy"><strong>fitdesk</strong><small>GYM MANAGEMENT</small></span>
      </a>
      <p class="sidebar-label">QUẢN LÝ PHÒNG TẬP</p>
      <nav class="nav-list" aria-label="Điều hướng chính">
        ${pages.map(([page, href, icon, label]) => `<a class="nav-link" href="./${href}" data-page="${page}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>${page === "members" ? '<span class="nav-count" id="member-nav-count"></span>' : ""}</a>`).join("")}
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-note"><span>✦</span><p>Không ngừng vận động. Không ngừng tiến bộ.</p></div>
        <div class="user-card">
          <span class="avatar avatar-dark" aria-hidden="true">A</span>
          <span class="user-info"><strong>Quản trị viên</strong><span>FitDesk Gym</span></span>
          <button class="icon-button" id="reset-data" aria-label="Khôi phục dữ liệu mẫu" title="Khôi phục dữ liệu mẫu">↻</button>
          <button class="icon-button" id="logout" aria-label="Đăng xuất" title="Đăng xuất">↪</button>
        </div>
      </div>
    </aside>
    <button class="sidebar-backdrop" id="sidebar-backdrop" type="button" aria-label="Đóng menu"></button>
    <main class="main-content">
      <header class="topbar">
        <button class="icon-button menu-toggle" id="menu-toggle" aria-label="Mở menu" aria-controls="sidebar" aria-expanded="false">☰</button>
        <div class="breadcrumb"><span>FitDesk</span><span class="crumb-separator">/</span><strong id="page-label">Tổng quan</strong></div>
        <div class="topbar-actions"><span class="today-label" id="today-label"></span><span class="top-avatar" aria-label="Quản trị viên">A</span></div>
      </header>
      <section class="page-container" id="page-content" aria-live="polite"></section>
      <footer class="app-footer">FitDesk <span>·</span> Quản lý phòng gym đơn giản và hiệu quả</footer>
    </main>
  </div>
  <div id="modal-root"></div>
  <div class="toast-region" id="toast-region" aria-live="polite" aria-atomic="true"></div>
`;
