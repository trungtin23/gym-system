import { useState, useEffect } from "react";
import {
  Star,
  Filter,
  Search,
  Phone,
  Mail,
  Award,
  Clock,
  Dumbbell,
} from "lucide-react";
import axios from "axios";

export default function ListPTComponent() {
  const [trainers, setTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/trainers");

        // Ánh xạ dữ liệu từ API sang định dạng frontend mong đợi
        const formattedTrainers = response.data.map((trainer) => ({
          id: trainer.id,
          name: trainer.user.full_name,
          specialty: trainer.specialization,
          experience: trainer.experience + " năm",
          certifications: trainer.certifications
            ? trainer.certifications.split(",").map((c) => c.trim())
            : [],
          email: trainer.user?.email || "Không có",
          phone: trainer.user?.phone || "Không có",
          availability: "Linh hoạt", // giả định hoặc điều chỉnh theo dữ liệu thật
          bio: trainer.bio || "Không có thông tin",
          story: trainer.story || "Không có thông tin",
          rating: 4.8, // giả định nếu API không trả về
          image: "/images/default-avatar.png", // hình mặc định
        }));

        setTrainers(formattedTrainers);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách huấn luyện viên:", err);
        setError(
          "Không thể tải danh sách huấn luyện viên. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const specialties = [
    ...new Set(trainers.map((trainer) => trainer.specialty)),
  ];

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "" || trainer.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">FitPro Gym</h1>
          <p className="mt-2">
            Đội ngũ huấn luyện viên chuyên nghiệp, sẵn sàng đồng hành cùng mục
            tiêu của bạn
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc chuyên môn..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Tất cả chuyên môn</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">
          Danh sách huấn luyện viên ({filteredTrainers.length})
        </h2>

        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              Không tìm thấy huấn luyện viên phù hợp với tiêu chí của bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{trainer.name}</h3>
                      <p className="text-blue-600 font-medium">
                        {trainer.specialty}
                      </p>
                    </div>
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                      <Star
                        className="h-4 w-4 text-yellow-500 mr-1"
                        fill="#EAB308"
                      />
                      <span className="font-semibold">{trainer.rating}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{trainer.experience}</span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{trainer.availability}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-600 line-clamp-2">
                    {trainer.bio}
                  </p>

                  <div className="mt-6 flex justify-between">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setSelectedTrainer(trainer)}
                    >
                      Xem chi tiết
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300">
                      Đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTrainer.name}</h2>
                  <p className="text-blue-600 font-medium">
                    {selectedTrainer.specialty}
                  </p>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedTrainer(null)}
                >
                  <svg
                    xmlns=""
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

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedTrainer.image || "/api/placeholder/400/320"}
                    alt={selectedTrainer.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{selectedTrainer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{selectedTrainer.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
                  <p className="text-gray-700">{selectedTrainer.bio}</p>
                  <p className="text-gray-700">{selectedTrainer.story}</p>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Chứng chỉ</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedTrainer.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700">
                        {cert}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{selectedTrainer.experience}</span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{selectedTrainer.availability}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-3 transition-colors duration-300"
                  onClick={() => setSelectedTrainer(null)}
                >
                  Đóng
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-300">
                  Đặt lịch ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
