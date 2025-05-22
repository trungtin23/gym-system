import React, { useState } from "react";

const TrainingSchedule = () => {
  const initialMembers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      schedule: {
        "2025-05-01": { exercises: ["Squat", "Bench Press"], duration: "1h" },
      },
    },
    {
      id: 2,
      name: "Trần Thị B",
      schedule: {
        "2025-05-02": { exercises: ["Deadlift", "Pull-up"], duration: "45m" },
      },
    },
  ];

  const [members, setMembers] = useState(initialMembers);
  const [role, setRole] = useState("member");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMember, setSelectedMember] = useState(
    role === "trainer" ? members[0]?.id : 1
  );
  const [newExercise, setNewExercise] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [currentMonth] = useState(new Date(2025, 4, 1)); // Tháng 5/2025

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const addSession = (date) => {
    if (!newExercise || !newDuration) return;
    const formattedDate = date.toISOString().split("T")[0];
    const updatedMembers = members.map((member) => {
      if (member.id === selectedMember) {
        return {
          ...member,
          schedule: {
            ...member.schedule,
            [formattedDate]: {
              exercises: [newExercise],
              duration: newDuration,
            },
          },
        };
      }
      return member;
    });
    setMembers(updatedMembers);
    setNewExercise("");
    setNewDuration("");
  };

  const getSessionInfo = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const member = members.find((m) => m.id === selectedMember);
    return member?.schedule[formattedDate] || null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <h1 className="text-xl font-semibold">Ứng dụng quản lý lịch tập</h1>
        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Hội viên</option>
          <option value="trainer">Huấn luyện viên</option>
        </select>
      </header>
      <main className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Lịch Tập</h2>

        {role === "trainer" && (
          <div className="mb-4 flex items-center">
            <label className="mr-2 font-medium">Chọn hội viên:</label>
            <select
              className="border rounded p-2 bg-white"
              value={selectedMember}
              onChange={(e) => setSelectedMember(Number(e.target.value))}
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center font-bold text-gray-700">
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => (
            <div
              key={index}
              className={`p-2 text-center border rounded cursor-pointer transition-colors ${
                day && getSessionInfo(day)
                  ? "bg-green-200 hover:bg-green-300"
                  : "bg-white hover:bg-gray-50"
              } ${selectedDate === day ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => day && setSelectedDate(day)}
            >
              {day ? day.getDate() : ""}
            </div>
          ))}
        </div>

        {selectedDate && (
          <section className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">
              Chi tiết buổi tập: {selectedDate.toLocaleDateString("vi-VN")}
            </h3>
            {getSessionInfo(selectedDate) ? (
              <div className="space-y-2">
                <p>
                  <strong>Bài tập:</strong>{" "}
                  {getSessionInfo(selectedDate).exercises.join(", ")}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {getSessionInfo(selectedDate).duration}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có buổi tập.</p>
            )}

            {role === "trainer" && (
              <div className="mt-4">
                <h4 className="font-bold mb-2">Thêm buổi tập</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Bài tập (e.g., Squat)"
                    className="border rounded p-2 flex-1"
                    value={newExercise}
                    onChange={(e) => setNewExercise(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Thời gian (e.g., 1h)"
                    className="border rounded p-2 flex-1"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                    onClick={() => addSession(selectedDate)}
                    disabled={!newExercise || !newDuration}
                  >
                    Thêm
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default TrainingSchedule;
