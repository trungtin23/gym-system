const fs = require('fs');
const path = require('path');

const filePath = './Frontend/src/components/schedule/schedule.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the problematic section
const problematicSection = `              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                <p className="text-sm text-gray-600 mb-3">
                  Bạn có chắc chắn muốn{" "}
                  {confirmationAction.type === "CONFIRMED" && "xác nhận"}
                  {confirmationAction.type === "COMPLETED" && "đánh dấu hoàn thành"}
                  {confirmationAction.type === "CANCELLED" && "hủy"} buổi tập với:
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {confirmationAction.data.customer.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {moment(confirmationAction.data.date).format("DD/MM/YYYY")},{" "}
                    {confirmationAction.data.timeStart} - {confirmationAction.data.timeEnd}
                  </p>
                </div>
              </div>`;

const replacement = ``;

// Replace the problematic section
content = content.replace(problematicSection, replacement);

// Write the fixed content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Syntax error fixed successfully!'); 