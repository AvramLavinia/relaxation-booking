import React, { useEffect, useState } from "react";
import { API_URL } from "../api/auth";

export default function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setUsers(data.users || []));
    fetch(`${API_URL}/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setBookings(data.bookings || []));
    fetch(`${API_URL}/facilities`)
      .then(r => r.json()).then(data => setFacilities(data.facilities || []));
  }, [token]);

  const makeAdmin = async (id) => {
    await fetch(`${API_URL}/admin/users/${id}/admin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Admin role assigned!");
  };

  const revokeAdmin = async (id) => {
    await fetch(`${API_URL}/admin/users/${id}/admin`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Admin role revoked!");
  };

  // Facility add/edit/remove can be implemented similarly

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Panel</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <h3>Users</h3>
      <table border="1" cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Name</th><th>Admin</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.display_name}</td>
              <td>
                {/* You may want to fetch roles for each user for real admin status */}
                <button onClick={() => makeAdmin(u.id)}>Make Admin</button>
                <button onClick={() => revokeAdmin(u.id)}>Revoke Admin</button>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Bookings</h3>
      <table border="1" cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>Facility</th><th>Start</th><th>End</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.user_email}</td>
              <td>{b.facility_name}</td>
              <td>{b.start_time}</td>
              <td>{b.end_time}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Facility management UI can be added here */}
    </div>
  );
}