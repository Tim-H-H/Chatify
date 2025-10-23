// src/api.js
import axios from "axios";

export const API_BASE = "https://chatify-api.up.railway.app";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

// CSRF
export async function fetchCsrf() {
  return api.patch("/csrf");
}
export async function clearCsrf() {
  return api.delete("/csrf");
}

/* Auth */
export async function registerUser(payload) {
  return api.post("/auth/register", payload);
}
export async function tokenAuth(payload) {
  return api.post("/auth/token", payload);
}

/* Users */
export async function getUsers(params = {}) { // support pagination + username
  return api.get("/users", { params });
}
export async function getUsersCount() {
  return api.get("/users/count");
}
export async function getUser(userId) {
  return api.get(`/users/${userId}`);
}
export async function updateUser(payload) { // PUT /user
  return api.put("/user", payload);
}
export async function deleteUser(userId) {
  return api.delete(`/users/${userId}`);
}
export async function inviteUser(userId) {
  return api.post(`/invite/${userId}`);
}

export async function getConversations() {
  return api.get("/conversations");
}
export async function getMessages(params = {}) { // e.g. { conversationId, userId, limit }
  return api.get("/messages", { params });
}
export async function createMessage(payload) {
  return api.post("/messages", payload);
}
export async function deleteMessage(msgId) {
  return api.delete(`/messages/${msgId}`);
}

/* Misc */
export async function getEnv() {
  return api.get("/env");
}

export default api;
