import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Bell,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Filter,
  Calendar as CalendarIcon,
  List,
  Grid,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import "moment/locale/vi";
import { toast } from "react-toastify";

moment.locale("vi");
const localizer = momentLocalizer(moment);

export default function PTScheduleComponent() {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    completedBookings: 0,
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [displayMode, setDisplayMode] = useState("calendar"); // calendar, list

  // Mock PT ID - Sẽ được thay thế bằng ID của người dùng đăng nhập
  const trainerId = "PT123";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Giả lập lấy dữ liệu từ API
        // Trong thực tế, đây sẽ là các endpoint thực từ backend của bạn
        const [schedulesRes, bookingsRes] = await Promise.all([
          axios.get(`/api/trainer/${trainerId}/schedules`),
          axios.get(`/api/trainer/${trainerId}/bookings`),
        ]);

        // Sẽ thay bằng dữ liệu API thực tế
        // Mockup data cho mục đích demo
        const mockSchedules = generateMockSchedules();
        const mockBookings = generateMockBookings();

        setSchedules(mockSchedules);
        setBookings(mockBookings);

        // Tạo events cho calendar từ schedules và bookings
        const combinedEvents = [
          ...mockSchedules.map((schedule) => ({
            id: schedule.id,
            title: "Ca làm việc",
            start: new Date(`${schedule.date}T${schedule.startTime}`),
            end: new Date(`${schedule.date}T${schedule.endTime}`),
            resourceId: "schedule",
            status: "available",
            type: "schedule",
            schedule,
          })),
          ...mockBookings.map((booking) => ({
            id: booking.id,
            title: `Buổi tập: ${booking.customerName}`,
            start: new Date(`${booking.date}T${booking.startTime}`),
            end: new Date(`${booking.date}T${booking.endTime}`),
            resourceId: "booking",
            status: booking.status,
            type: "booking",
            booking,
          })),
        ];

        setEvents(combinedEvents);

        // Tính toán các thống kê cho dashboard
        const today = new Date().toISOString().split("T")[0];
        setDashboardStats({
          totalBookings: mockBookings.length,
          pendingBookings: mockBookings.filter((b) => b.status === "PENDING")
            .length,
          todayBookings: mockBookings.filter((b) => b.date === today).length,
          completedBookings: mockBookings.filter(
            (b) => b.status === "COMPLETED"
          ).length,
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải lịch tập. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, [trainerId]);

  // Hàm tạo dữ liệu mẫu cho schedules
  const generateMockSchedules = () => {
    const schedules = [];
    const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const timeSlots = [
      { start: "08:00:00", end: "10:00:00" },
      { start: "10:30:00", end: "12:30:00" },
      { start: "14:00:00", end: "16:00:00" },
      { start: "17:00:00", end: "19:00:00" },
    ];

    let id = 1;
    // Tạo lịch cho 4 tuần tới
    for (let week = 0; week < 4; week++) {
      daysOfWeek.forEach((day) => {
        // Không phải mọi ngày đều có tất cả các slot (để trông tự nhiên hơn)
        const availableSlots =
          day === "WEDNESDAY"
            ? timeSlots.slice(0, 2)
            : day === "FRIDAY"
            ? timeSlots.slice(1, 3)
            : timeSlots;

        availableSlots.forEach((slot) => {
          const date = new Date();
          date.setDate(date.getDate() + week * 7 + getDayOffset(day));
          const dateStr = date.toISOString().split("T")[0];

          schedules.push({
            id: `sch-${id++}`,
            dayOfWeek: day,
            date: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: Math.random() > 0.2, // 80% là available
          });
        });
      });
    }
    return schedules;
  };

  // Hàm tạo dữ liệu mẫu cho bookings
  const generateMockBookings = () => {
    const bookings = [];
    const statuses = ["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"];
    const customers = [
      {
        id: "cust1",
        name: "Nguyễn Văn An",
        phone: "0901234567",
        email: "an@example.com",
      },
      {
        id: "cust2",
        name: "Trần Thị Bình",
        phone: "0912345678",
        email: "binh@example.com",
      },
      {
        id: "cust3",
        name: "Lê Văn Cường",
        phone: "0923456789",
        email: "cuong@example.com",
      },
      {
        id: "cust4",
        name: "Phạm Thị Dung",
        phone: "0934567890",
        email: "dung@example.com",
      },
    ];

    let id = 1;
    // Tạo random bookings dựa trên schedules
    const mockSchedules = generateMockSchedules();
    for (let i = 0; i < 15; i++) {
      const randomSchedule =
        mockSchedules[Math.floor(Math.random() * mockSchedules.length)];
      const randomCustomer =
        customers[Math.floor(Math.random() * customers.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      bookings.push({
        id: `book-${id++}`,
        date: randomSchedule.date,
        startTime: randomSchedule.startTime,
        endTime: randomSchedule.endTime,
        customerId: randomCustomer.id,
        customerName: randomCustomer.name,
        customerPhone: randomCustomer.phone,
        customerEmail: randomCustomer.email,
        status: randomStatus,
        notes:
          randomStatus === "CANCELLED"
            ? "Khách hàng bận đột xuất"
            : "Tập trung vào bài tập cơ tay và vai",
        createdAt: new Date(
          new Date(randomSchedule.date).getTime() -
            Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }
    return bookings;
  };

  // Helper function để tính offset từ ngày hiện tại đến ngày trong tuần mong muốn
  const getDayOffset = (day) => {
    const days = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 0,
    };
    const today = new Date().getDay();
    return (days[day] - today + 7) % 7;
  };

  // Xử lý khi người dùng click vào một event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Xử lý khi chọn view khác (tháng, tuần, ngày)
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Xử lý thay đổi trạng thái booking
  const handleChangeBookingStatus = async (bookingId, newStatus) => {
    try {
      // Trong ứng dụng thực tế, gọi API để cập nhật trạng thái
      // await axios.patch(`/api/bookings/${bookingId}`, { status: newStatus });

      // Cập nhật state
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      setEvents(
        events.map((event) =>
          event.type === "booking" && event.booking.id === bookingId
            ? {
                ...event,
                status: newStatus,
                booking: { ...event.booking, status: newStatus },
              }
            : event
        )
      );

      setSelectedEvent(null);
      setIsModalOpen(false);

      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  // Custom styles for events
  const eventStyleGetter = (event) => {
    let backgroundColor = "";
    let borderColor = "";

    if (event.type === "schedule") {
      backgroundColor = "#BBDEFB";
      borderColor = "#2196F3";
    } else {
      // Bookings
      switch (event.status) {
        case "CONFIRMED":
          backgroundColor = "#C8E6C9";
          borderColor = "#4CAF50";
          break;
        case "PENDING":
          backgroundColor = "#FFECB3";
          borderColor = "#FFC107";
          break;
        case "COMPLETED":
          backgroundColor = "#D1C4E9";
          borderColor = "#673AB7";
          break;
        case "CANCELLED":
          backgroundColor = "#FFCCBC";
          borderColor = "#FF5722";
          break;
        default:
          backgroundColor = "#E1F5FE";
          borderColor = "#03A9F4";
      }
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "4px",
        opacity: 0.95,
        color: "#373a3c",
        padding: "2px 5px",
        fontSize: "13px",
        textAlign: "left",
        fontWeight: "500",
      },
    };
  };

  // Filter events based on status
  const filteredEvents = events.filter((event) => {
    if (filterStatus === "all") return true;
    if (event.type === "schedule") return filterStatus === "schedule";
    return event.status === filterStatus;
  });

  // Format date for header
  const formatHeaderDate = (date) => {
    if (view === "month") {
      return moment(date).format("MMMM YYYY");
    } else if (view === "week") {
      const start = moment(date).startOf("week").format("DD/MM");
      const end = moment(date).endOf("week").format("DD/MM");
      return `${start} - ${end}, ${moment(date).format("YYYY")}`;
    } else {
      return moment(date).format("dddd, DD MMMM YYYY");
    }
  };

  // Render bookings in list view
  const renderBookingsList = () => {
    // Group bookings by date
    const groupedBookings = {};
    const filteredBookings = bookings.filter((booking) => {
      if (filterStatus === "all") return true;
      return booking.status === filterStatus;
    });

    filteredBookings.forEach((booking) => {
      if (!groupedBookings[booking.date]) {
        groupedBookings[booking.date] = [];
      }
      groupedBookings[booking.date].push(booking);
    });

    // Sort dates
    const sortedDates = Object.keys(groupedBookings).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="booking-day">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
              {moment(date).format("dddd, DD/MM/YYYY")}
            </h3>
            <div className="space-y-3">
              {groupedBookings[date].map((booking) => (
                <div
                  key={booking.id}
                  className="booking-card bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4"
                  onClick={() => {
                    setSelectedEvent({
                      type: "booking",
                      booking: booking,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.customerName}
                      </h4>
                      <div className="text-gray-500 text-sm">
                        {booking.startTime.substring(0, 5)} -{" "}
                        {booking.endTime.substring(0, 5)}
                      </div>
                    </div>
                    <div
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        booking.status === "COMPLETED"
                          ? "bg-purple-100 text-purple-800"
                          : ""
                      }
                      ${
                        booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    `}
                    >
                      {booking.status === "CONFIRMED" && "Đã xác nhận"}
                      {booking.status === "PENDING" && "Chờ xác nhận"}
                      {booking.status === "COMPLETED" && "Hoàn thành"}
                      {booking.status === "CANCELLED" && "Đã hủy"}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Ghi chú:</strong> {booking.notes}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Đặt {moment(booking.createdAt).fromNow()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedDates.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-3">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Không có lịch hẹn nào
            </h3>
            <p className="text-gray-500 mt-1">
              Không tìm thấy lịch hẹn nào phù hợp với bộ lọc hiện tại
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý lịch tập
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-2">
                  PT
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Huấn luyện viên
                  </div>
                  <div className="text-xs text-gray-500">Đang online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Tổng số buổi tập
                </h2>
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.totalBookings}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Chờ xác nhận
                </h2>
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.pendingBookings}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Lịch hôm nay
                </h2>
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.todayBookings}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Đã hoàn thành
                </h2>
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardStats.completedBookings}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 flex flex-wrap items-center justify-between gap-4 border">
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                const newDate = new Date(date);
                if (view === "month") {
                  newDate.setMonth(newDate.getMonth() - 1);
                } else if (view === "week") {
                  newDate.setDate(newDate.getDate() - 7);
                } else {
                  newDate.setDate(newDate.getDate() - 1);
                }
                setDate(newDate);
              }}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-medium text-gray-900 mx-4 min-w-[200px] text-center">
              {formatHeaderDate(date)}
            </h2>

            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                const newDate = new Date(date);
                if (view === "month") {
                  newDate.setMonth(newDate.getMonth() + 1);
                } else if (view === "week") {
                  newDate.setDate(newDate.getDate() + 7);
                } else {
                  newDate.setDate(newDate.getDate() + 1);
                }
                setDate(newDate);
              }}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            <button
              className="ml-4 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              onClick={() => setDate(new Date())}
            >
              Hôm nay
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className={`p-2 ${
                  view === "month"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleViewChange("month")}
              >
                <span className="sr-only">Tháng</span>
                <Grid className="h-5 w-5" />
              </button>

              <button
                className={`p-2 ${
                  view === "week"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleViewChange("week")}
              >
                <span className="sr-only">Tuần</span>
                <CalendarIcon className="h-5 w-5" />
              </button>

              <button
                className={`p-2 ${
                  view === "day"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleViewChange("day")}
              >
                <span className="sr-only">Ngày</span>
                <Clock className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className={`p-2 ${
                  displayMode === "calendar"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setDisplayMode("calendar")}
              >
                <span className="sr-only">Lịch</span>
                <CalendarIcon className="h-5 w-5" />
              </button>

              <button
                className={`p-2 ${
                  displayMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setDisplayMode("list")}
              >
                <span className="sr-only">Danh sách</span>
                <List className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <div className="flex items-center px-3 py-2 border rounded-lg">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  className="text-sm bg-transparent text-gray-700 focus:outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="schedule">Chỉ ca làm việc</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar or List View */}
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : displayMode === "calendar" ? (
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 800 }}
              views={["month", "week", "day"]}
              view={view}
              date={date}
              onNavigate={setDate}
              onView={setView}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              dayPropGetter={(date) => {
                const today = new Date();
                if (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) {
                  return { className: "bg-blue-50" };
                }
                return {};
              }}
              messages={{
                month: "Tháng",
                week: "Tuần",
                day: "Ngày",
                today: "Hôm nay",
                next: "Sau",
                previous: "Trước",
                agenda: "Lịch trình",
                showMore: (total) => `+ ${total} buổi tập khác`,
              }}
            />
          ) : (
            renderBookingsList()
          )}
        </div>
      </main>

      {/* Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedEvent.type === "booking"
                    ? "Chi tiết lịch hẹn"
                    : "Chi tiết ca làm việc"}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsModalOpen(false);
                  }}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedEvent.type === "booking" ? (
                <div>
                  <div className="mb-6">
                    <div
                      className={`
                      inline-block px-3 py-1 rounded-full text-sm font-medium mb-2
                      ${
                        selectedEvent.booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        selectedEvent.booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        selectedEvent.booking.status === "COMPLETED"
                          ? "bg-purple-100 text-purple-800"
                          : ""
                      }
                      ${
                        selectedEvent.booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    `}
                    >
                      {selectedEvent.booking.status === "CONFIRMED" &&
                        "Đã xác nhận"}
                      {selectedEvent.booking.status === "PENDING" &&
                        "Chờ xác nhận"}
                      {selectedEvent.booking.status === "COMPLETED" &&
                        "Hoàn thành"}
                      {selectedEvent.booking.status === "CANCELLED" && "Đã hủy"}
                    </div>

                    <h4 className="font-medium text-lg text-gray-900">
                      Buổi tập với {selectedEvent.booking.customerName}
                    </h4>

                    <div className="mt-2 text-gray-700">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span>
                          {moment(selectedEvent.booking.date).format(
                            "dddd, DD/MM/YYYY"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center mt-1">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span>
                          {selectedEvent.booking.startTime.substring(0, 5)} -{" "}
                          {selectedEvent.booking.endTime.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Thông tin khách hàng
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {selectedEvent.booking.customerName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {selectedEvent.booking.customerPhone}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {selectedEvent.booking.customerEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.booking.notes && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Ghi chú
                      </h5>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {selectedEvent.booking.notes}
                      </p>
                    </div>
                  )}

                  {selectedEvent.booking.status !== "COMPLETED" &&
                    selectedEvent.booking.status !== "CANCELLED" && (
                      <div className="flex space-x-3 mt-4 border-t pt-4">
                        {selectedEvent.booking.status === "PENDING" && (
                          <button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            onClick={() =>
                              handleChangeBookingStatus(
                                selectedEvent.booking.id,
                                "CONFIRMED"
                              )
                            }
                          >
                            Xác nhận
                          </button>
                        )}

                        {selectedEvent.booking.status === "CONFIRMED" && (
                          <button
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            onClick={() =>
                              handleChangeBookingStatus(
                                selectedEvent.booking.id,
                                "COMPLETED"
                              )
                            }
                          >
                            Đánh dấu hoàn thành
                          </button>
                        )}

                        <button
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                          onClick={() =>
                            handleChangeBookingStatus(
                              selectedEvent.booking.id,
                              "CANCELLED"
                            )
                          }
                        >
                          Hủy buổi tập
                        </button>
                      </div>
                    )}
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <div
                      className={`
                      inline-block px-3 py-1 rounded-full text-sm font-medium mb-2
                      ${
                        selectedEvent.schedule.isAvailable
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}
                    >
                      {selectedEvent.schedule.isAvailable
                        ? "Có thể nhận học viên"
                        : "Không còn nhận học viên"}
                    </div>

                    <h4 className="font-medium text-lg text-gray-900">
                      Ca làm việc
                    </h4>

                    <div className="mt-2 text-gray-700">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span>
                          {moment(selectedEvent.schedule.date).format(
                            "dddd, DD/MM/YYYY"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center mt-1">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span>
                          {selectedEvent.schedule.startTime.substring(0, 5)} -{" "}
                          {selectedEvent.schedule.endTime.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        selectedEvent.schedule.isAvailable
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                      onClick={() => {
                        // Toggle availability
                        const updatedSchedules = schedules.map((sch) =>
                          sch.id === selectedEvent.schedule.id
                            ? { ...sch, isAvailable: !sch.isAvailable }
                            : sch
                        );

                        setSchedules(updatedSchedules);

                        // Update events
                        setEvents(
                          events.map((event) =>
                            event.type === "schedule" &&
                            event.schedule.id === selectedEvent.schedule.id
                              ? {
                                  ...event,
                                  schedule: {
                                    ...event.schedule,
                                    isAvailable: !event.schedule.isAvailable,
                                  },
                                }
                              : event
                          )
                        );

                        setSelectedEvent(null);
                        setIsModalOpen(false);

                        toast.success(
                          "Cập nhật trạng thái ca làm việc thành công!"
                        );
                      }}
                    >
                      {selectedEvent.schedule.isAvailable
                        ? "Đóng ca tập này"
                        : "Mở lại ca tập này"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
