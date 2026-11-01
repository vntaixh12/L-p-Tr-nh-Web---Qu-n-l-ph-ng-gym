import { addDays, localDate } from "./date.js";

const STORAGE_KEY = "fitdesk-gym-v1";
const DATA_VERSION = 2;

const demoData = () => ({
  dataVersion: DATA_VERSION,
  members: [
    { id: "M-1001", name: "Nguyễn Minh Anh", phone: "0901 234 567", email: "minhanh@gmail.com", gender: "Nữ", joinedAt: addDays(localDate(), -120), planId: "P-01", expiresAt: addDays(localDate(), 35), status: "active" },
    { id: "M-1002", name: "Trần Quốc Bảo", phone: "0912 345 678", email: "quocbao@gmail.com", gender: "Nam", joinedAt: addDays(localDate(), -92), planId: "P-02", expiresAt: addDays(localDate(), 8), status: "active" },
    { id: "M-1003", name: "Lê Thu Hà", phone: "0987 654 321", email: "thuha@gmail.com", gender: "Nữ", joinedAt: addDays(localDate(), -65), planId: "P-01", expiresAt: addDays(localDate(), -5), status: "expired" },
    { id: "M-1004", name: "Phạm Gia Huy", phone: "0934 567 890", email: "giahuy@gmail.com", gender: "Nam", joinedAt: addDays(localDate(), -30), planId: "P-03", expiresAt: addDays(localDate(), 150), status: "active" },
    { id: "M-1005", name: "Võ Ngọc Linh", phone: "0965 432 109", email: "ngoclinh@gmail.com", gender: "Nữ", joinedAt: addDays(localDate(), -12), planId: "P-02", expiresAt: addDays(localDate(), 78), status: "active" },
    { id: "M-1006", name: "Đặng Hoàng Nam", phone: "0971 222 333", email: "hoangnam@gmail.com", gender: "Nam", joinedAt: addDays(localDate(), -8), planId: "P-01", expiresAt: addDays(localDate(), 22), status: "active" },
  ],
  plans: [
    { id: "P-01", name: "Tập luyện 1 tháng", duration: 30, price: 500000, description: "Tự do sử dụng khu vực tập luyện." },
    { id: "P-02", name: "Tập luyện 3 tháng", duration: 90, price: 1350000, description: "Tiết kiệm hơn với gói 3 tháng." },
    { id: "P-03", name: "Tập luyện 6 tháng", duration: 180, price: 2400000, description: "Tập luyện dài hạn, linh hoạt." },
    { id: "P-04", name: "Tập luyện 9 tháng", duration: 270, price: 3150000, description: "Tiết kiệm hơn với gói tập 9 tháng." },
    { id: "P-05", name: "Tập luyện 12 tháng", duration: 360, price: 3600000, description: "Mức giá ưu đãi cho hội viên tập luyện cả năm." },
  ],
  classes: [
    { id: "C-01", name: "Yoga Flow", coach: "HLV Mai Phương", time: "07:00", date: localDate(), capacity: 16, room: "Phòng A", attendees: [] },
    { id: "C-02", name: "Strength & Conditioning", coach: "HLV Đức Minh", time: "09:00", date: localDate(), capacity: 12, room: "Phòng B", attendees: [] },
    { id: "C-03", name: "Dance Cardio", coach: "HLV Ngọc Anh", time: "17:30", date: localDate(), capacity: 20, room: "Phòng A", attendees: [] },
    { id: "C-04", name: "Yoga Flow", coach: "HLV Mai Phương", time: "18:30", date: addDays(localDate(), 1), capacity: 16, room: "Phòng A", attendees: [] },
  ],
  checkins: [
    { id: "K-01", memberId: "M-1001", time: new Date().toISOString() },
    { id: "K-02", memberId: "M-1004", time: new Date(Date.now() - 52 * 60000).toISOString() },
    { id: "K-03", memberId: "M-1002", time: new Date(Date.now() - 103 * 60000).toISOString() },
  ],
  payments: [
    { id: "T-01", memberId: "M-1001", planId: "P-01", amount: 500000, date: addDays(localDate(), -4), method: "Chuyển khoản" },
    { id: "T-02", memberId: "M-1005", planId: "P-02", amount: 1350000, date: addDays(localDate(), -2), method: "Tiền mặt" },
    { id: "T-03", memberId: "M-1004", planId: "P-03", amount: 2400000, date: addDays(localDate(), -1), method: "Chuyển khoản" },
    { id: "T-04", memberId: "M-1006", planId: "P-01", amount: 500000, date: localDate(), method: "Tiền mặt" },
  ],
  expenses: [
    { id: "E-01", category: "Điện nước", description: "Hóa đơn điện tháng", amount: 1250000, date: addDays(localDate(), -3), method: "Chuyển khoản" },
    { id: "E-02", category: "Vệ sinh", description: "Vật tư vệ sinh phòng tập", amount: 420000, date: localDate(), method: "Tiền mặt" },
  ],
});

function readData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return demoData();
    const parsed = JSON.parse(stored);
    const defaults = demoData();
    const result = Object.fromEntries(Object.keys(defaults).map((key) => [key, Array.isArray(defaults[key]) ? (Array.isArray(parsed[key]) ? parsed[key] : defaults[key]) : defaults[key]]));
    const checkins = result.checkins.filter((entry) => result.members.some((member) => member.id === entry.memberId));
    const removedOrphanCheckins = checkins.length !== result.checkins.length;
    result.checkins = checkins;
    if ((parsed.dataVersion || 1) < DATA_VERSION) {
      const plans = [...result.plans];
      for (const plan of defaults.plans.slice(3)) {
        if (!plans.some((item) => item.id === plan.id)) plans.push(plan);
      }
      result.plans = plans;
      result.dataVersion = DATA_VERSION;
    }
    if ((parsed.dataVersion || 1) < DATA_VERSION || removedOrphanCheckins) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }
    return result;
  } catch (error) {
    console.error("Không thể đọc dữ liệu phòng gym:", error);
    return demoData();
  }
}

let data = readData();

function persist(nextData = data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    data = nextData;
  } catch (error) {
    console.error("Không thể lưu dữ liệu phòng gym:", error);
    throw new Error("Không thể lưu dữ liệu. Hãy kiểm tra quyền lưu trữ của trình duyệt.");
  }
}

function nextId(prefix, items) {
  const max = items.reduce((highest, item) => {
    const number = Number(item.id.match(/(\d+)$/)?.[1] || 0);
    return Math.max(highest, number);
  }, 0) + 1;
  return `${prefix}-${String(max).padStart(4, "0")}`;
}

export const getData = () => data;

export function saveMember(member) {
  if (!member.name?.trim()) throw new Error("Vui lòng nhập tên hội viên.");
  if (member.phone.replace(/\D/g, "").length < 9) throw new Error("Số điện thoại cần ít nhất 9 chữ số.");
  const members = member.id
    ? data.members.map((item) => item.id === member.id ? { ...item, ...member, name: member.name.trim() } : item)
    : [{ ...member, id: nextId("M", data.members), name: member.name.trim() }, ...data.members];
  persist({ ...data, members });
}

export function deleteMember(id) {
  if (!data.members.some((member) => member.id === id)) throw new Error("Không tìm thấy hội viên.");
  persist({
    ...data,
    members: data.members.filter((member) => member.id !== id),
    checkins: data.checkins.filter((checkin) => checkin.memberId !== id),
    classes: data.classes.map((gymClass) => ({ ...gymClass, attendees: gymClass.attendees.filter((memberId) => memberId !== id) })),
  });
}

export function savePlan(plan) {
  if (!plan.name?.trim()) throw new Error("Vui lòng nhập tên gói tập.");
  if (Number(plan.duration) < 1 || Number(plan.price) < 0) throw new Error("Thời hạn phải dương, giá không được âm.");
  const plans = plan.id
    ? data.plans.map((item) => item.id === plan.id ? { ...item, ...plan, duration: Number(plan.duration), price: Number(plan.price) } : item)
    : [...data.plans, { ...plan, id: nextId("P", data.plans), duration: Number(plan.duration), price: Number(plan.price) }];
  persist({ ...data, plans });
}

export function deletePlan(id) {
  if (data.members.some((member) => member.planId === id)) throw new Error("Không thể xóa gói đang được hội viên sử dụng.");
  persist({ ...data, plans: data.plans.filter((plan) => plan.id !== id) });
}

export function saveClass(gymClass) {
  if (!gymClass.name?.trim() || !gymClass.coach?.trim()) throw new Error("Vui lòng nhập tên lớp và huấn luyện viên.");
  if (Number(gymClass.capacity) < 1) throw new Error("Sức chứa lớp phải lớn hơn 0.");
  const classes = gymClass.id
    ? data.classes.map((item) => item.id === gymClass.id ? { ...item, ...gymClass, capacity: Number(gymClass.capacity) } : item)
    : [...data.classes, { ...gymClass, id: nextId("C", data.classes), capacity: Number(gymClass.capacity), attendees: [] }];
  persist({ ...data, classes });
}

export function deleteClass(id) {
  persist({ ...data, classes: data.classes.filter((item) => item.id !== id) });
}

export function toggleAttendee(classId, memberId) {
  const gymClass = data.classes.find((item) => item.id === classId);
  if (!gymClass) throw new Error("Không tìm thấy lớp học.");
  const isRegistered = gymClass.attendees.includes(memberId);
  if (!isRegistered && gymClass.attendees.length >= Number(gymClass.capacity)) throw new Error("Lớp đã đủ số lượng học viên.");
  const attendees = isRegistered ? gymClass.attendees.filter((id) => id !== memberId) : [...gymClass.attendees, memberId];
  persist({ ...data, classes: data.classes.map((item) => item.id === classId ? { ...item, attendees } : item) });
}

export function addCheckin(memberId) {
  const member = data.members.find((item) => item.id === memberId);
  if (!member || member.status !== "active" || member.expiresAt < localDate()) throw new Error("Hội viên không có gói tập còn hiệu lực.");
  if (data.checkins.some((item) => item.memberId === memberId && localDate(item.time) === localDate())) throw new Error("Hội viên này đã check-in hôm nay.");
  const checkins = [{ id: nextId("K", data.checkins), memberId, time: new Date().toISOString() }, ...data.checkins];
  persist({ ...data, checkins });
}

export function addCheckout(checkinId) {
  const checkin = data.checkins.find((item) => item.id === checkinId);
  if (!checkin || localDate(checkin.time) !== localDate()) throw new Error("Không tìm thấy lượt check-in hôm nay.");
  if (checkin.checkOutTime) throw new Error("Hội viên này đã check-out.");
  const checkins = data.checkins.map((item) => item.id === checkinId ? { ...item, checkOutTime: new Date().toISOString() } : item);
  persist({ ...data, checkins });
}

export function addPayment({ memberId, planId, method }) {
  const member = data.members.find((item) => item.id === memberId);
  const plan = data.plans.find((item) => item.id === planId);
  if (!member || !plan) throw new Error("Không tìm thấy hội viên hoặc gói tập.");
  const renewalDate = member.expiresAt > localDate() ? member.expiresAt : localDate();
  const updatedMember = { ...member, planId, status: "active", expiresAt: addDays(renewalDate, plan.duration) };
  const payment = { id: nextId("T", data.payments), memberId, planId, amount: Number(plan.price), date: localDate(), method };
  persist({ ...data, members: data.members.map((item) => item.id === memberId ? updatedMember : item), payments: [payment, ...data.payments] });
}

export function deletePayment(id) {
  if (!data.payments.some((item) => item.id === id)) throw new Error("Không tìm thấy giao dịch thanh toán.");
  persist({ ...data, payments: data.payments.filter((item) => item.id !== id) });
}

export function addExpense(expense) {
  const amount = Number(expense.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Số tiền chi cần lớn hơn 0.");
  const record = { ...expense, id: nextId("E", data.expenses), amount, description: expense.description.trim() };
  persist({ ...data, expenses: [record, ...data.expenses] });
}

export function deleteExpense(id) {
  if (!data.expenses.some((item) => item.id === id)) throw new Error("Không tìm thấy khoản chi.");
  persist({ ...data, expenses: data.expenses.filter((item) => item.id !== id) });
}

export function deleteAllTransactions() {
  if (!data.payments.length && !data.expenses.length) throw new Error("Không có giao dịch nào để xóa.");
  persist({ ...data, payments: [], expenses: [] });
}

export function resetData() {
  persist(demoData());
}
