import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Star,
  Activity,
  TrendingUp,
  Heart,
  Target,
  CheckCircle,
  Award,
  BarChart3,
  Filter,
  Search,
  Download,
  X,
  User,
  Dumbbell,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthProvider";

moment.locale("vi");

// Component đánh giá sao (readonly)
const StarRating = ({ rating, readonly = true }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// Component thống kê tổng quan
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% so với tháng trước
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Component chi tiết buổi tập hoàn thành
const CompletedSessionCard = ({ session, userRole, onViewDetails }) => {
  const isTrainer = userRole === 'TRAINER';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header thông tin cơ bản */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={
                isTrainer 
                  ? session.customer?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                  : session.trainer?.avatar || "https://randomuser.me/api/portraits/men/45.jpg"
              }
              alt={isTrainer ? session.customer?.name : session.trainer?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {isTrainer ? session.customer?.name : session.trainer?.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{moment(session.date).format("DD/MM/YYYY")}</span>
                <Clock className="h-4 w-4 ml-3 mr-1" />
                <span>{session.timeStart} - {session.timeEnd}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Hoàn thành
            </span>
          </div>
        </div>

        {/* Thông tin địa điểm và ghi chú */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{session.location}</span>
          </div>
          {session.notes && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <strong>Ghi chú:</strong> {session.notes}
            </div>
          )}
        </div>

        {/* Kết quả buổi tập */}
        {session.workoutResult && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-600" />
              Kết quả buổi tập
            </h4>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {session.workoutResult.calories_burned && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-xs text-gray-600">Calo</span>
                    </div>
                    <p className="font-semibold text-gray-900">{session.workoutResult.calories_burned}</p>
                  </div>
                )}
                {session.workoutResult.current_weight && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-xs text-gray-600">Cân nặng</span>
                    </div>
                    <p className="font-semibold text-gray-900">{session.workoutResult.current_weight} kg</p>
                  </div>
                )}
                {session.workoutResult.completion_percentage && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-gray-600">Hoàn thành</span>
                    </div>
                    <p className="font-semibold text-gray-900">{session.workoutResult.completion_percentage}%</p>
                  </div>
                )}
                {session.workoutResult.heart_rate_avg && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-gray-600">Nhịp tim</span>
                    </div>
                    <p className="font-semibold text-gray-900">{session.workoutResult.heart_rate_avg} bpm</p>
                  </div>
                )}
              </div>
              
              {/* Đánh giá của PT */}
              {session.workoutResult.trainer_rating && (
                <div className="border-t border-green-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Đánh giá của PT:</span>
                    <StarRating rating={session.workoutResult.trainer_rating} />
                  </div>
                  {session.workoutResult.trainer_feedback && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{session.workoutResult.trainer_feedback}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Đánh giá của hội viên */}
        {session.rating && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Đánh giá của hội viên
            </h4>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Số sao:</span>
                <StarRating rating={session.rating} />
              </div>
              {session.ratingComment && (
                <p className="text-sm text-gray-600 italic">
                  "{session.ratingComment}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bài tập đã thực hiện */}
        {session.exercises && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Dumbbell className="h-4 w-4 mr-2 text-blue-600" />
              Bài tập đã thực hiện
            </h4>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {session.exercises}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={() => onViewDetails(session)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

// Component modal chi tiết buổi tập
const SessionDetailModal = ({ session, isOpen, onClose, userRole }) => {
  if (!isOpen || !session) return null;

  const isTrainer = userRole === 'TRAINER';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết buổi tập hoàn thành
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Thông tin {isTrainer ? 'hội viên' : 'huấn luyện viên'}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      isTrainer 
                        ? session.customer?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                        : session.trainer?.avatar || "https://randomuser.me/api/portraits/men/45.jpg"
                    }
                    alt={isTrainer ? session.customer?.name : session.trainer?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {isTrainer ? session.customer?.name : session.trainer?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isTrainer ? session.customer?.phone : session.trainer?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin buổi tập</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{moment(session.date).format("dddd, DD/MM/YYYY")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{session.timeStart} - {session.timeEnd}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm">{session.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kết quả chi tiết */}
          {session.workoutResult && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Kết quả buổi tập chi tiết</h3>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-lg">
                      <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {session.workoutResult.calories_burned || 0}
                      </p>
                      <p className="text-sm text-gray-600">Calo tiêu thụ</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-lg">
                      <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {session.workoutResult.workout_duration_minutes || 0}
                      </p>
                      <p className="text-sm text-gray-600">Phút tập luyện</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {session.workoutResult.completion_percentage || 0}%
                      </p>
                      <p className="text-sm text-gray-600">Hoàn thành</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin sức khỏe */}
                {(session.workoutResult.current_weight || session.workoutResult.heart_rate_avg) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {session.workoutResult.current_weight && (
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin cân nặng</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cân nặng hiện tại:</span>
                          <span className="font-semibold">{session.workoutResult.current_weight} kg</span>
                        </div>
                        {session.workoutResult.bmi && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">BMI:</span>
                            <span className="font-semibold">{session.workoutResult.bmi}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {session.workoutResult.heart_rate_avg && (
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin nhịp tim</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Nhịp tim trung bình:</span>
                          <span className="font-semibold">{session.workoutResult.heart_rate_avg} bpm</span>
                        </div>
                        {session.workoutResult.heart_rate_max && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Nhịp tim tối đa:</span>
                            <span className="font-semibold">{session.workoutResult.heart_rate_max} bpm</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Phản hồi và đánh giá của PT */}
                {(session.workoutResult.trainer_rating || session.workoutResult.trainer_feedback) && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Đánh giá và phản hồi từ PT</h4>
                    {session.workoutResult.trainer_rating && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Đánh giá hiệu suất:</span>
                        <StarRating rating={session.workoutResult.trainer_rating} />
                      </div>
                    )}
                    {session.workoutResult.trainer_feedback && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Phản hồi từ PT:</span>
                        <p className="text-sm text-gray-600 mt-1 italic bg-gray-50 p-3 rounded">
                          "{session.workoutResult.trainer_feedback}"
                        </p>
                      </div>
                    )}
                    {session.workoutResult.next_session_recommendations && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Khuyến nghị cho buổi tập tiếp theo:</span>
                        <p className="text-sm text-gray-600 mt-1 bg-blue-50 p-3 rounded">
                          {session.workoutResult.next_session_recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Đánh giá của hội viên */}
          {session.rating && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Đánh giá từ hội viên</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">Đánh giá tổng thể:</span>
                  <StarRating rating={session.rating} />
                </div>
                {session.ratingComment && (
                  <div>
                    <span className="font-medium text-gray-700">Nhận xét:</span>
                    <p className="text-gray-600 mt-1 italic bg-white p-3 rounded">
                      "{session.ratingComment}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bài tập đã thực hiện */}
          {session.exercises && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Bài tập đã thực hiện</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {session.exercises}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component chính
export default function CompletedScheduleComponent() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, with-rating, with-results
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("month"); // week, month, quarter, year
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageRating: 0,
    totalCalories: 0,
    averageCompletion: 0
  });

  const { user, isLoggedIn } = useContext(AuthContext);
  const userRole = user?.data?.role || 'USER';

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCompletedSessions();
    }
  }, [isLoggedIn, user, dateRange]);

  useEffect(() => {
    calculateStats();
  }, [completedSessions]);

  const fetchCompletedSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      // Determine API endpoint based on user role
      const endpoint = userRole === 'TRAINER' 
        ? 'http://localhost:3000/appointments/trainer/me'
        : 'http://localhost:3000/appointments/user/me';

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        // Filter only completed sessions and transform data
        const completed = response.data.data
          .filter(appointment => appointment.status === 'COMPLETED')
          .map(appointment => ({
            id: appointment.id,
            date: appointment.date ? appointment.date.split('T')[0] : new Date().toISOString().split('T')[0],
            timeStart: appointment.timeSlot?.startTime || "00:00",
            timeEnd: appointment.timeSlot?.endTime || "00:00",
            customer: userRole === 'TRAINER' ? {
              id: appointment.user?.id || "unknown",
              name: appointment.user?.full_name || appointment.user?.fullName || appointment.user?.username || "Khách hàng không xác định",
              phone: appointment.user?.phone || "Chưa có thông tin",
              email: appointment.user?.email || "Chưa có thông tin",
              avatar: appointment.user?.profileImage || null
            } : null,
            trainer: userRole !== 'TRAINER' ? {
              id: appointment.trainer?.id || "unknown",
              name: appointment.trainer?.name || "Huấn luyện viên không xác định",
              phone: appointment.trainer?.phone || "Chưa có thông tin",
              avatar: appointment.trainer?.profileImage || null
            } : null,
            location: appointment.location || "Phòng tập chính",
            status: appointment.status,
            notes: appointment.notes || "",
            exercises: appointment.exercises || "",
            rating: appointment.rating?.rating || null,
            ratingComment: appointment.rating?.comment || "",
            workoutResult: appointment.workoutResult || null,
            createdAt: appointment.created_at || new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

        setCompletedSessions(completed);
      } else {
        setCompletedSessions([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu buổi tập hoàn thành:", error);
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError("Bạn không có quyền xem dữ liệu này. Vui lòng đăng nhập lại.");
        } else if (error.response.status === 404) {
          setError("Không tìm thấy dữ liệu. Vui lòng kiểm tra cấu hình hệ thống.");
        } else {
          setError(`Lỗi từ máy chủ: ${error.response.data?.message || 'Vui lòng thử lại sau'}`);
        }
      } else if (error.request) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Lỗi khi tải dữ liệu: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (completedSessions.length === 0) {
      setStats({
        totalSessions: 0,
        averageRating: 0,
        totalCalories: 0,
        averageCompletion: 0
      });
      return;
    }

    const sessionsWithRating = completedSessions.filter(session => session.rating);
    const sessionsWithResults = completedSessions.filter(session => session.workoutResult);

    const averageRating = sessionsWithRating.length > 0
      ? sessionsWithRating.reduce((sum, session) => sum + session.rating, 0) / sessionsWithRating.length
      : 0;

    const totalCalories = sessionsWithResults.reduce((sum, session) => 
      sum + (session.workoutResult?.calories_burned || 0), 0);

    const averageCompletion = sessionsWithResults.length > 0
      ? sessionsWithResults.reduce((sum, session) => 
          sum + (session.workoutResult?.completion_percentage || 0), 0) / sessionsWithResults.length
      : 0;

    setStats({
      totalSessions: completedSessions.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalCalories,
      averageCompletion: Math.round(averageCompletion)
    });
  };

  const getFilteredSessions = () => {
    return completedSessions.filter(session => {
      const matchesFilter = 
        filterType === "all" ||
        (filterType === "with-rating" && session.rating) ||
        (filterType === "with-results" && session.workoutResult);

      const matchesSearch = searchTerm === "" ||
        (userRole === 'TRAINER' 
          ? session.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
          : session.trainer?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        session.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
            <p className="text-gray-600 mb-6">
              Bạn cần đăng nhập để xem lịch sử buổi tập hoàn thành.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={fetchCompletedSessions}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lịch sử buổi tập hoàn thành
              </h1>
              <p className="text-gray-600 mt-1">
                {userRole === 'TRAINER' 
                  ? 'Xem kết quả và đánh giá từ các hội viên' 
                  : 'Xem lại các buổi tập đã hoàn thành và kết quả đạt được'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCompletedSessions}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                disabled={loading}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? "Đang tải..." : "Làm mới"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng buổi tập"
            value={stats.totalSessions}
            icon={Calendar}
            color="bg-blue-500"
          />
          <StatCard
            title="Đánh giá trung bình"
            value={`${stats.averageRating}/5`}
            icon={Star}
            color="bg-yellow-500"
          />
          <StatCard
            title="Tổng calo tiêu thụ"
            value={stats.totalCalories.toLocaleString()}
            icon={Target}
            color="bg-orange-500"
          />
          <StatCard
            title="% Hoàn thành trung bình"
            value={`${stats.averageCompletion}%`}
            icon={CheckCircle}
            color="bg-green-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách buổi tập hoàn thành
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={`Tìm kiếm theo ${userRole === 'TRAINER' ? 'tên hội viên' : 'tên PT'}...`}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    className="pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Tất cả buổi tập</option>
                    <option value="with-rating">Có đánh giá</option>
                    <option value="with-results">Có kết quả</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredSessions().length > 0 ? (
                  getFilteredSessions().map((session) => (
                    <CompletedSessionCard
                      key={session.id}
                      session={session}
                      userRole={userRole}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có buổi tập hoàn thành
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || filterType !== "all"
                        ? "Không tìm thấy buổi tập nào phù hợp với bộ lọc."
                        : "Bạn chưa có buổi tập hoàn thành nào."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSession(null);
        }}
        userRole={userRole}
      />
    </div>
  );
}
