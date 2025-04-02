import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <ul className="list-disc pl-4">
        <li>Manage Pets</li>
        <li>View Adoption Requests</li>
        <li>Generate Reports</li>
      </ul>
    </div>
  );
};

export default Dashboard;
