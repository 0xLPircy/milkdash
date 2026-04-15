
import { useState, useEffect, useCallback } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "p1", name: "Full Cream Milk", unit: "500ml", price: 28, color: "#3B6D11" },
  { id: "p2", name: "Toned Milk", unit: "500ml", price: 22, color: "#185FA5" },
  { id: "p3", name: "Double Toned", unit: "500ml", price: 18, color: "#534AB7" },
  { id: "p4", name: "Skimmed Milk", unit: "500ml", price: 20, color: "#993C1D" },
  { id: "p5", name: "Full Cream Milk", unit: "1L", price: 52, color: "#3B6D11" },
  { id: "p6", name: "Organic Milk", unit: "500ml", price: 45, color: "#0F6E56" },
];

const ZONES = ["North Bengaluru", "South Bengaluru", "East Bengaluru", "West Bengaluru", "Central"];
const DRIVERS = [
  { id: "d1", name: "Rajan Kumar", phone: "9876543210", zone: "North Bengaluru", deliveries: 247, rating: 4.8, status: "active", vehicle: "TVS XL100", routes: ["R1","R2"] },
  { id: "d2", name: "Suresh Babu", phone: "9876543211", zone: "South Bengaluru", deliveries: 189, rating: 4.6, status: "active", vehicle: "Honda Activa", routes: ["R3"] },
  { id: "d3", name: "Mohan Das", phone: "9876543212", zone: "East Bengaluru", deliveries: 312, rating: 4.9, status: "active", vehicle: "TVS XL100", routes: ["R4","R5"] },
  { id: "d4", name: "Venkat Rao", phone: "9876543213", zone: "West Bengaluru", deliveries: 156, rating: 4.5, status: "on_leave", vehicle: "Bajaj RE", routes: ["R6"] },
  { id: "d5", name: "Kiran Patel", phone: "9876543214", zone: "Central", deliveries: 98, rating: 4.7, status: "active", vehicle: "TVS XL100", routes: ["R7"] },
];

const firstNames = ["Aarav","Abhishek","Aditya","Amrita","Ananya","Anjali","Arjun","Deepa","Divya","Gaurav","Geeta","Harish","Ishaan","Jaya","Karthik","Kavita","Lakshmi","Mahesh","Meera","Nisha","Priya","Rahul","Rajesh","Ramesh","Riya","Rohit","Sandeep","Sanjay","Sneha","Sunil","Sushma","Tanvi","Usha","Vijay","Vinod","Yamini","Zara","Akash","Bhavna","Chetan"];
const lastNames = ["Sharma","Gupta","Kumar","Patel","Singh","Reddy","Rao","Nair","Pillai","Menon","Joshi","Agarwal","Mehta","Shah","Verma","Bhat","Iyer","Iyengar","Hegde","Shetty"];
const streets = ["MG Road","Indiranagar","Koramangala","HSR Layout","Whitefield","Jayanagar","JP Nagar","Marathahalli","Bellandur","Sarjapur","Electronic City","Bannerghatta","Hebbal","Yelahanka","Rajajinagar"];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec=2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }

const CUSTOMERS = Array.from({ length: 50 }, (_, i) => {
  const firstName = randItem(firstNames);
  const lastName = randItem(lastNames);
  const zone = randItem(ZONES);
  const wallet = randFloat(-200, 2000, 0);
  const bottles = randInt(0, 6);
  return {
    id: `c${i+1}`,
    name: `${firstName} ${lastName}`,
    phone: `98${randInt(10000000, 99999999)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    address: `${randInt(1,200)}, ${randItem(streets)}, ${zone}`,
    zone,
    wallet,
    bottles_issued: bottles + randInt(0,3),
    bottles_returned: randInt(0, bottles),
    bottles_pending: bottles,
    status: wallet < -100 ? "paused" : wallet < 200 ? "at_risk" : "active",
    joined: `2023-${String(randInt(1,12)).padStart(2,'0')}-${String(randInt(1,28)).padStart(2,'0')}`,
    notes: [],
    totalOrders: randInt(20, 300),
    totalRevenue: randInt(2000, 30000),
  };
});

const SUB_TYPES = ["daily","alternate","custom"];
const SUBS = Array.from({ length: 100 }, (_, i) => {
  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const product = randItem(PRODUCTS);
  const qty = randInt(1, 4);
  const type = randItem(SUB_TYPES);
  return {
    id: `s${i+1}`,
    customerId: customer.id,
    customerName: customer.name,
    zone: customer.zone,
    productId: product.id,
    productName: product.name,
    productUnit: product.unit,
    quantity: qty,
    type,
    status: customer.status === "paused" ? "paused" : Math.random() > 0.1 ? "active" : "paused",
    startDate: `2023-${String(randInt(1,12)).padStart(2,'0')}-01`,
    price: product.price * qty,
    override: null,
    customDays: type === "custom" ? [1,3,5] : null,
  };
});

const ORDER_STATUSES = ["delivered","failed","pending","in_transit"];
const FAIL_REASONS = ["Customer absent","Gate locked","Address not found","Refused delivery","Milk quality issue"];
const TODAY = new Date().toISOString().split("T")[0];
const ORDERS = Array.from({ length: 120 }, (_, i) => {
  const sub = SUBS[i % SUBS.length];
  const status = i < 80 ? randItem(ORDER_STATUSES) : "pending";
  const date = i < 40 ? TODAY : i < 80 ? `2024-01-${String(randInt(1,31)).padStart(2,'0')}` : TODAY;
  return {
    id: `o${i+1}`,
    subscriptionId: sub.id,
    customerId: sub.customerId,
    customerName: sub.customerName,
    zone: sub.zone,
    productName: sub.productName,
    productUnit: sub.productUnit,
    quantity: sub.quantity,
    amount: sub.price,
    status,
    date,
    failReason: status === "failed" ? randItem(FAIL_REASONS) : null,
    driverId: randItem(DRIVERS).id,
    deliveredAt: status === "delivered" ? `${String(randInt(5,9)).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')} AM` : null,
  };
});

const ROUTES = [
  { id: "R1", name: "North-A", zone: "North Bengaluru", driverId: "d1", stops: 18, status: "completed" },
  { id: "R2", name: "North-B", zone: "North Bengaluru", driverId: "d1", stops: 15, status: "in_progress" },
  { id: "R3", name: "South-A", zone: "South Bengaluru", driverId: "d2", stops: 22, status: "pending" },
  { id: "R4", name: "East-A", zone: "East Bengaluru", driverId: "d3", stops: 19, status: "completed" },
  { id: "R5", name: "East-B", zone: "East Bengaluru", driverId: "d3", stops: 14, status: "in_progress" },
  { id: "R6", name: "West-A", zone: "West Bengaluru", driverId: "d4", stops: 12, status: "pending" },
  { id: "R7", name: "Central-A", zone: "Central", driverId: "d5", stops: 20, status: "in_progress" },
];

const INVENTORY = PRODUCTS.map(p => ({
  productId: p.id,
  productName: p.name,
  unit: p.unit,
  available: randFloat(50, 300, 1),
  required: randFloat(100, 280, 1),
  buffer: randFloat(10, 50, 1),
}));

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --sidebar-w: 220px;
    --topbar-h: 52px;
    --milk-blue: #0B4F8A;
    --milk-blue-light: #E6F0FA;
    --milk-teal: #0D7E5E;
    --milk-teal-light: #E2F4EE;
    --accent: #1A6FE8;
    --accent-light: #EBF3FF;
    --bg: #F7F8FA;
    --surface: #FFFFFF;
    --border: #E5E7EB;
    --border-strong: #D1D5DB;
    --text: #111827;
    --text-2: #374151;
    --text-3: #6B7280;
    --text-4: #9CA3AF;
    --green: #16A34A;
    --green-bg: #DCFCE7;
    --yellow: #D97706;
    --yellow-bg: #FEF3C7;
    --red: #DC2626;
    --red-bg: #FEE2E2;
    --blue: #1D4ED8;
    --blue-bg: #DBEAFE;
    --gray-bg: #F3F4F6;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
  }

  .app { display: flex; height: 100vh; overflow: hidden; }
  
  .sidebar {
    width: var(--sidebar-w);
    background: #0B1221;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sidebar::-webkit-scrollbar { display: none; }
  
  .sidebar-logo {
    padding: 16px 16px 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #1E2940;
  }
  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #1A6FE8, #0D7E5E);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: white; font-family: 'DM Mono', monospace;
  }
  .logo-text { font-size: 15px; font-weight: 600; color: #F9FAFB; letter-spacing: -0.3px; }
  .logo-sub { font-size: 10px; color: #6B7280; letter-spacing: 0.5px; text-transform: uppercase; }

  .nav-section { padding: 8px 0; }
  .nav-label {
    padding: 8px 16px 4px;
    font-size: 10px;
    font-weight: 600;
    color: #4B5563;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 16px;
    cursor: pointer;
    color: #9CA3AF;
    font-size: 12.5px;
    font-weight: 400;
    border-radius: 0;
    transition: all 0.12s;
    border-left: 2px solid transparent;
    user-select: none;
  }
  .nav-item:hover { color: #E5E7EB; background: #111827; }
  .nav-item.active { color: #60A5FA; background: #111827; border-left-color: #60A5FA; font-weight: 500; }
  .nav-icon { font-size: 14px; width: 16px; text-align: center; }
  .nav-badge {
    margin-left: auto;
    background: #DC2626;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 10px;
    line-height: 16px;
  }

  .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  
  .topbar {
    height: var(--topbar-h);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 20px;
    gap: 12px;
    flex-shrink: 0;
  }
  .topbar-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .topbar-sub { font-size: 12px; color: var(--text-3); margin-left: 2px; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .topbar-search {
    display: flex; align-items: center;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 0 10px;
    gap: 6px; height: 32px; width: 200px;
  }
  .topbar-search input {
    border: none; background: transparent; outline: none;
    font-size: 12.5px; color: var(--text); width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .topbar-search input::placeholder { color: var(--text-4); }
  .icon-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; cursor: pointer;
    background: var(--bg); border: 1px solid var(--border);
    font-size: 14px; color: var(--text-3);
    transition: all 0.1s; position: relative;
  }
  .icon-btn:hover { background: var(--gray-bg); color: var(--text); }
  .notif-dot {
    position: absolute; top: 5px; right: 5px;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--red); border: 1px solid white;
  }
  .avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #1A6FE8, #0D7E5E);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: white; cursor: pointer;
  }
  
  .content { flex: 1; overflow-y: auto; padding: 20px 24px; }
  
  .page-header { margin-bottom: 20px; }
  .page-title { font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: -0.4px; }
  .page-sub { font-size: 12.5px; color: var(--text-3); margin-top: 2px; }
  
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .kpi-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px;
  }
  .kpi-label { font-size: 11.5px; font-weight: 500; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .kpi-value { font-size: 26px; font-weight: 600; color: var(--text); letter-spacing: -0.8px; font-family: 'DM Mono', monospace; }
  .kpi-change { font-size: 11.5px; margin-top: 4px; display: flex; align-items: center; gap: 3px; }
  .kpi-up { color: var(--green); }
  .kpi-down { color: var(--red); }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px;
  }
  .card-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
  .card-title span { font-size: 11.5px; font-weight: 400; color: var(--text-3); margin-left: auto; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th { padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 9px 12px; border-bottom: 1px solid var(--border); color: var(--text-2); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: var(--bg); }

  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 10px;
    font-size: 11px; font-weight: 500; white-space: nowrap;
  }
  .badge-green { background: var(--green-bg); color: #15803D; }
  .badge-yellow { background: var(--yellow-bg); color: #92400E; }
  .badge-red { background: var(--red-bg); color: #991B1B; }
  .badge-blue { background: var(--blue-bg); color: #1E40AF; }
  .badge-gray { background: var(--gray-bg); color: var(--text-3); }
  .badge-teal { background: #CCFBF1; color: #115E59; }

  .btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0 12px; height: 32px;
    border-radius: 7px; cursor: pointer;
    font-size: 12.5px; font-weight: 500;
    border: 1px solid var(--border);
    background: var(--surface); color: var(--text-2);
    transition: all 0.1s; white-space: nowrap; font-family: 'DM Sans', sans-serif;
  }
  .btn:hover { background: var(--bg); }
  .btn-primary {
    background: var(--accent); border-color: var(--accent);
    color: white;
  }
  .btn-primary:hover { background: #1558C8; }
  .btn-danger { background: var(--red); border-color: var(--red); color: white; }
  .btn-danger:hover { background: #B91C1C; }
  .btn-sm { padding: 0 8px; height: 26px; font-size: 11.5px; }

  .search-filter {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px; flex-wrap: wrap;
  }
  .search-input {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 0 10px;
    height: 32px; flex: 1; max-width: 280px;
  }
  .search-input input {
    border: none; background: transparent; outline: none;
    font-size: 12.5px; color: var(--text); width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .search-input input::placeholder { color: var(--text-4); }
  select {
    height: 32px; padding: 0 8px;
    border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); color: var(--text-2);
    font-size: 12.5px; outline: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

  .stat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .stat-label { font-size: 12px; color: var(--text-3); width: 130px; flex-shrink: 0; }
  .stat-bar { flex: 1; }
  .stat-val { font-size: 12px; font-weight: 500; color: var(--text); width: 60px; text-align: right; font-family: 'DM Mono', monospace; }

  .alert-item {
    display: flex; gap: 10px; padding: 10px 12px;
    border-radius: 8px; margin-bottom: 8px; align-items: flex-start;
  }
  .alert-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
  .alert-text { font-size: 12px; line-height: 1.5; }
  .alert-text strong { font-weight: 600; display: block; margin-bottom: 1px; }

  .drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.35); z-index: 100;
    display: flex; justify-content: flex-end;
  }
  .drawer {
    width: 480px; background: var(--surface);
    height: 100%; overflow-y: auto;
    display: flex; flex-direction: column;
    box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  }
  .drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0; position: sticky; top: 0; background: var(--surface); z-index: 1;
  }
  .drawer-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .drawer-close {
    margin-left: auto; width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px; cursor: pointer; color: var(--text-3);
    background: var(--bg); border: 1px solid var(--border);
    font-size: 14px;
  }
  .drawer-close:hover { background: var(--gray-bg); }
  .drawer-body { padding: 20px; flex: 1; }
  .drawer-footer {
    padding: 14px 20px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; flex-shrink: 0;
  }

  .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .tab {
    padding: 8px 14px; cursor: pointer; font-size: 12.5px;
    color: var(--text-3); border-bottom: 2px solid transparent;
    margin-bottom: -1px; font-weight: 500; white-space: nowrap;
  }
  .tab:hover { color: var(--text); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 11.5px; font-weight: 600; color: var(--text-3); margin-bottom: 5px; display: block; text-transform: uppercase; letter-spacing: 0.4px; }
  .form-input {
    width: 100%; height: 34px; padding: 0 10px;
    border: 1px solid var(--border); border-radius: 7px;
    background: var(--surface); font-size: 12.5px; color: var(--text);
    outline: none; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.1s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-select {
    width: 100%; height: 34px; padding: 0 10px;
    border: 1px solid var(--border); border-radius: 7px;
    background: var(--surface); font-size: 12.5px; color: var(--text);
    outline: none; font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .wallet-bar {
    height: 8px; border-radius: 4px; overflow: hidden;
    background: var(--border); margin-top: 4px;
  }
  .timeline-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
  }
  .timeline-line {
    width: 1px; background: var(--border);
    margin: 2px 0 2px 3.5px; flex-shrink: 0; min-height: 16px;
  }

  .mini-chart { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
  .mini-bar { flex: 1; border-radius: 2px 2px 0 0; min-height: 4px; }

  .map-placeholder {
    background: linear-gradient(135deg, #EBF3FF 0%, #E2F4EE 100%);
    border-radius: 8px; height: 200px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-3); font-size: 12px;
    border: 1px dashed var(--border-strong);
    flex-direction: column; gap: 6px;
  }
  .map-pin { font-size: 24px; }

  .cutoff-timer {
    display: flex; align-items: center; gap: 6px;
    background: var(--yellow-bg); border: 1px solid #FDE68A;
    border-radius: 8px; padding: 8px 12px; margin-bottom: 14px;
  }
  .cutoff-time { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 600; color: var(--yellow); }

  .inventory-row {
    display: flex; flex-direction: column; gap: 4px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .inventory-row:last-child { border-bottom: none; }
  .inv-name { font-size: 12.5px; font-weight: 500; color: var(--text); }
  .inv-numbers { display: flex; gap: 16px; font-size: 11.5px; color: var(--text-3); }
  .inv-num-val { font-family: 'DM Mono', monospace; font-weight: 500; }

  .driver-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px; 
    display: flex; align-items: flex-start; gap: 12px;
  }
  .driver-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600; flex-shrink: 0;
  }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 200;
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: var(--surface); border-radius: 12px;
    width: 440px; max-height: 80vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-header {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
  }
  .modal-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .modal-body { padding: 20px; }
  .modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }

  .empty-state { text-align: center; padding: 40px 20px; color: var(--text-3); }
  .empty-icon { font-size: 32px; margin-bottom: 8px; }
  .empty-title { font-size: 13px; font-weight: 500; color: var(--text-2); margin-bottom: 4px; }

  .risk-indicator {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 500;
  }
  .risk-dot { width: 6px; height: 6px; border-radius: 50%; }

  .scroll-fade { max-height: 340px; overflow-y: auto; }
  .scroll-fade::-webkit-scrollbar { width: 4px; }
  .scroll-fade::-webkit-scrollbar-track { background: transparent; }
  .scroll-fade::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .toggle {
    position: relative; width: 36px; height: 20px; cursor: pointer;
  }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; inset: 0;
    background: var(--border-strong); border-radius: 10px; transition: 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 14px; height: 14px; left: 3px; bottom: 3px;
    background: white; border-radius: 50%; transition: 0.2s;
  }
  .toggle input:checked + .toggle-slider { background: var(--accent); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(16px); }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function statusBadge(s) {
  const map = {
    active: "badge-green", paused: "badge-gray", at_risk: "badge-yellow",
    delivered: "badge-green", failed: "badge-red", pending: "badge-blue",
    in_transit: "badge-teal", completed: "badge-green", in_progress: "badge-blue",
    on_leave: "badge-yellow", daily: "badge-blue", alternate: "badge-teal", custom: "badge-gray",
  };
  const label = { at_risk: "At Risk", in_transit: "In Transit", in_progress: "In Progress", on_leave: "On Leave", daily: "Daily", alternate: "Alternate", custom: "Custom" };
  return <span className={`badge ${map[s] || "badge-gray"}`}>{label[s] || s?.charAt(0).toUpperCase() + s?.slice(1)}</span>;
}

function WalletBadge({ amount }) {
  const cls = amount < 0 ? "badge-red" : amount < 200 ? "badge-yellow" : "badge-green";
  return <span className={`badge ${cls}`} style={{fontFamily:"'DM Mono',monospace"}}>₹{amount.toLocaleString()}</span>;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function ProgressBar({ value, max, color = "#1A6FE8" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function MiniChart({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="mini-bar" style={{ height: `${Math.round((v / max) * 100)}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
      ))}
    </div>
  );
}

function Drawer({ title, onClose, children, footer }) {
  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <div className="drawer-close" onClick={onClose}>✕</div>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <div className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}>✕</div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function Dashboard({ onNav }) {
  const totalCustomers = CUSTOMERS.length;
  const activeSubs = SUBS.filter(s => s.status === "active").length;
  const todayOrders = ORDERS.filter(o => o.date === TODAY);
  const delivered = todayOrders.filter(o => o.status === "delivered").length;
  const failed = todayOrders.filter(o => o.status === "failed").length;
  const pending = todayOrders.filter(o => o.status === "pending" || o.status === "in_transit").length;
  const todayRevenue = todayOrders.reduce((a, o) => a + o.amount, 0);
  const atRisk = CUSTOMERS.filter(c => c.status === "at_risk").length;
  const paused = CUSTOMERS.filter(c => c.status === "paused").length;
  const lowBalance = CUSTOMERS.filter(c => c.wallet < 0).length;

  const deliveryPct = todayOrders.length ? Math.round((delivered / todayOrders.length) * 100) : 0;

  const zoneStats = ZONES.map(z => ({
    zone: z,
    total: todayOrders.filter(o => o.zone === z).length,
    done: todayOrders.filter(o => o.zone === z && o.status === "delivered").length,
  }));

  const weekData = [42, 38, 51, 47, 55, 44, delivered];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Operations Dashboard</div>
        <div className="page-sub">Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Customers</div>
          <div className="kpi-value">{totalCustomers}</div>
          <div className="kpi-change kpi-up">↑ 3 this week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Subscriptions</div>
          <div className="kpi-value">{activeSubs}</div>
          <div className="kpi-change kpi-down">↓ 2 paused today</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Today's Deliveries</div>
          <div className="kpi-value">{todayOrders.length}</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>{delivered} done · {failed} failed · {pending} pending</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Today's Revenue</div>
          <div className="kpi-value">₹{todayRevenue.toLocaleString()}</div>
          <div className="kpi-change kpi-up">↑ 8% vs yesterday</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            Delivery Progress
            <span>{deliveryPct}% complete</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <ProgressBar value={delivered} max={todayOrders.length} color="#16A34A" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-3)" }}>
              <span>✓ {delivered} Delivered</span>
              <span style={{ color: "var(--red)" }}>✗ {failed} Failed</span>
              <span>○ {pending} Pending</span>
            </div>
          </div>
          {zoneStats.map(z => (
            <div key={z.zone} className="stat-row">
              <div className="stat-label">{z.zone.replace(" Bengaluru", "")}</div>
              <div className="stat-bar">
                <ProgressBar value={z.done} max={Math.max(z.total, 1)} color={z.done === z.total ? "#16A34A" : "#1A6FE8"} />
              </div>
              <div className="stat-val">{z.done}/{z.total}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            Weekly Deliveries
            <span>Last 7 days</span>
          </div>
          <MiniChart data={weekData} color="#1A6FE8" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--text-4)" }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span style={{ color: "var(--accent)" }}>Today</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Inventory Overview</div>
          {INVENTORY.slice(0, 4).map(inv => {
            const gap = inv.available - inv.required;
            const ok = gap >= 0;
            return (
              <div key={inv.productId} className="inventory-row">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div className="inv-name">{inv.productName} ({inv.unit})</div>
                  <span className={`badge ${ok ? "badge-green" : "badge-red"}`}>{ok ? `+${gap.toFixed(0)}L surplus` : `${Math.abs(gap).toFixed(0)}L short`}</span>
                </div>
                <ProgressBar value={Math.min(inv.available, inv.required)} max={inv.required} color={ok ? "#16A34A" : "#DC2626"} />
                <div className="inv-numbers">
                  <span>Available: <span className="inv-num-val">{inv.available.toFixed(0)}L</span></span>
                  <span>Required: <span className="inv-num-val">{inv.required.toFixed(0)}L</span></span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">🚨 Alerts</div>
          <div className="scroll-fade">
            {lowBalance > 0 && (
              <div className="alert-item" style={{ background: "var(--red-bg)" }}>
                <div className="alert-icon">⚠</div>
                <div className="alert-text">
                  <strong>{lowBalance} customers with negative wallet balance</strong>
                  Deliveries may be auto-paused
                </div>
              </div>
            )}
            {atRisk > 0 && (
              <div className="alert-item" style={{ background: "var(--yellow-bg)" }}>
                <div className="alert-icon">⚡</div>
                <div className="alert-text">
                  <strong>{atRisk} customers at risk</strong>
                  Wallet balance below ₹200 threshold
                </div>
              </div>
            )}
            {failed > 0 && (
              <div className="alert-item" style={{ background: "var(--red-bg)" }}>
                <div className="alert-icon">❌</div>
                <div className="alert-text">
                  <strong>{failed} deliveries failed today</strong>
                  Action required — retry or issue refund
                </div>
              </div>
            )}
            <div className="alert-item" style={{ background: "var(--yellow-bg)" }}>
              <div className="alert-icon">⏰</div>
              <div className="alert-text">
                <strong>Order cutoff at 10:00 PM tonight</strong>
                {SUBS.filter(s => s.status === "active").length} subscriptions locked after cutoff
              </div>
            </div>
            <div className="alert-item" style={{ background: "var(--blue-bg)" }}>
              <div className="alert-icon">🚚</div>
              <div className="alert-text">
                <strong>Driver Venkat Rao on leave tomorrow</strong>
                West Bengaluru routes need reassignment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomersPage({ onView }) {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = CUSTOMERS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchZone = zone === "all" || c.zone === zone;
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchZone && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="page-title">Customers</div>
          <div className="page-sub">{filtered.length} customers found</div>
        </div>
        <button className="btn btn-primary">+ Add Customer</button>
      </div>

      <div className="search-filter">
        <div className="search-input">
          <span style={{ color: "var(--text-4)", fontSize: 13 }}>🔍</span>
          <input placeholder="Search name or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={zone} onChange={e => { setZone(e.target.value); setPage(1); }}>
          <option value="all">All Zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Zone</th>
                <th>Subscriptions</th>
                <th>Wallet</th>
                <th>Bottles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const custSubs = SUBS.filter(s => s.customerId === c.id).length;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 1 }}>{c.phone}</div>
                    </td>
                    <td><span style={{ fontSize: 12, color: "var(--text-3)" }}>{c.zone.replace(" Bengaluru", "")}</span></td>
                    <td><span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{custSubs}</span></td>
                    <td><WalletBadge amount={c.wallet} /></td>
                    <td><span style={{ fontSize: 12, color: "var(--text-3)" }}>🍶 {c.bottles_pending} pending</span></td>
                    <td>{statusBadge(c.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => onView(c)}>View</button>
                        <button className="btn btn-sm" style={{ color: "var(--text-3)" }}>✏</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Page {page} of {totalPages}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerProfile({ customer, onClose }) {
  const [tab, setTab] = useState("subscriptions");
  const custSubs = SUBS.filter(s => s.customerId === customer.id);
  const custOrders = ORDERS.filter(o => o.customerId === customer.id).slice(0, 10);
  const walletTx = Array.from({ length: 8 }, (_, i) => ({
    date: `2024-01-${String(28 - i).padStart(2, "0")}`,
    type: i % 3 === 0 ? "credit" : "debit",
    amount: i % 3 === 0 ? randInt(200, 1000) : randInt(20, 80),
    note: i % 3 === 0 ? "Wallet recharge" : "Daily delivery charge",
  }));

  return (
    <Drawer
      title={`Customer — ${customer.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-danger btn-sm">Pause Account</button>
          <button className="btn btn-primary btn-sm">Edit Profile</button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 16, padding: 14, background: "var(--bg)", borderRadius: 8 }}>
        <div className="driver-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
          {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{customer.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{customer.phone} · {customer.email}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 2 }}>{customer.address}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>{statusBadge(customer.status)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Wallet", val: `₹${customer.wallet.toLocaleString()}`, color: customer.wallet < 0 ? "var(--red)" : "var(--green)" },
          { label: "Total Orders", val: customer.totalOrders },
          { label: "Bottles Out", val: customer.bottles_pending },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: s.color || "var(--text)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {["subscriptions","orders","wallet","assets","notes"].map(t => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === "subscriptions" && (
        <div>
          {custSubs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No subscriptions</div></div>
          ) : custSubs.map(s => (
            <div key={s.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 500, fontSize: 12.5 }}>{s.productName} {s.productUnit} × {s.quantity}</div>
                {statusBadge(s.status)}
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "var(--text-3)" }}>
                <span>{statusBadge(s.type)}</span>
                <span>₹{s.price}/day</span>
                <span>Since {formatDate(s.startDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {custOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5 }}>{o.date}</td>
                  <td>{o.productName} {o.productUnit}</td>
                  <td>{o.quantity}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace" }}>₹{o.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "wallet" && (
        <div>
          <div style={{ background: customer.wallet < 0 ? "var(--red-bg)" : "var(--green-bg)", borderRadius: 8, padding: 14, textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: customer.wallet < 0 ? "#991B1B" : "#15803D", marginBottom: 4 }}>Current Balance</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: customer.wallet < 0 ? "var(--red)" : "var(--green)" }}>₹{customer.wallet.toLocaleString()}</div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
            <tbody>
              {walletTx.map((tx, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5 }}>{tx.date}</td>
                  <td><span className={`badge ${tx.type === "credit" ? "badge-green" : "badge-gray"}`}>{tx.type}</span></td>
                  <td style={{ fontFamily: "'DM Mono',monospace", color: tx.type === "credit" ? "var(--green)" : "var(--text)" }}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </td>
                  <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>{tx.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "assets" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Issued", val: customer.bottles_issued, color: "var(--blue)" },
              { label: "Returned", val: customer.bottles_returned, color: "var(--green)" },
              { label: "Pending", val: customer.bottles_pending, color: customer.bottles_pending > 3 ? "var(--red)" : "var(--yellow)" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Bottles {s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: s.color }}>🍶 {s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", background: "var(--bg)", padding: 12, borderRadius: 8 }}>
            {customer.bottles_pending > 2 ? (
              <span style={{ color: "var(--red)" }}>⚠ High pending bottle count — follow up with customer</span>
            ) : (
              <span style={{ color: "var(--green)" }}>✓ Asset balance within acceptable range</span>
            )}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div>
          <div className="form-group">
            <label className="form-label">Add Note</label>
            <textarea className="form-input" style={{ height: 80, paddingTop: 8, resize: "vertical" }} placeholder="Enter note about this customer..." />
          </div>
          <button className="btn btn-primary btn-sm">Save Note</button>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-3)" }}>No previous notes</div>
        </div>
      )}
    </Drawer>
  );
}

function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedSub, setSelectedSub] = useState(null);
  const [overrideModal, setOverrideModal] = useState(null);
  const [subs, setSubs] = useState(SUBS);

  const filtered = subs.filter(s => {
    const m1 = !search || s.customerName.toLowerCase().includes(search.toLowerCase());
    const m2 = type === "all" || s.type === type;
    const m3 = status === "all" || s.status === status;
    return m1 && m2 && m3;
  });

  const toggleStatus = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s));
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="page-title">Subscriptions</div>
          <div className="page-sub">{filtered.length} subscriptions</div>
        </div>
        <button className="btn btn-primary">+ New Subscription</button>
      </div>

      <div className="search-filter">
        <div className="search-input">
          <span style={{ color: "var(--text-4)" }}>🔍</span>
          <input placeholder="Search customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="daily">Daily</option>
          <option value="alternate">Alternate</option>
          <option value="custom">Custom</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price/day</th>
                <th>Zone</th>
                <th>Status</th>
                <th>Override</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.customerName}</td>
                  <td>{s.productName} <span style={{ color: "var(--text-4)", fontSize: 11 }}>{s.productUnit}</span></td>
                  <td>{statusBadge(s.type)}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace" }}>×{s.quantity}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace" }}>₹{s.price}</td>
                  <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>{s.zone.replace(" Bengaluru","")}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>
                    {s.override ? (
                      <span className="badge badge-yellow">Override Active</span>
                    ) : (
                      <span style={{ color: "var(--text-4)", fontSize: 11.5 }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => setSelectedSub(s)}>Edit</button>
                      <button className="btn btn-sm" style={{ color: s.status === "active" ? "var(--yellow)" : "var(--green)" }} onClick={() => toggleStatus(s.id)}>
                        {s.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button className="btn btn-sm" style={{ color: "var(--blue)" }} onClick={() => setOverrideModal(s)}>Override</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSub && (
        <Drawer
          title={`Edit Subscription — ${selectedSub.customerName}`}
          onClose={() => setSelectedSub(null)}
          footer={
            <>
              <button className="btn" onClick={() => setSelectedSub(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setSelectedSub(null)}>Save Changes</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Customer</label>
            <div style={{ fontWeight: 500, padding: "8px 0", fontSize: 13 }}>{selectedSub.customerName}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Product</label>
            <select className="form-select" defaultValue={selectedSub.productId}>
              {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input type="number" className="form-input" defaultValue={selectedSub.quantity} min={1} max={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Type</label>
            <select className="form-select" defaultValue={selectedSub.type}>
              <option value="daily">Daily</option>
              <option value="alternate">Alternate Days</option>
              <option value="custom">Custom Days</option>
            </select>
          </div>
          {selectedSub.type === "custom" && (
            <div className="form-group">
              <label className="form-label">Custom Days</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked={selectedSub.customDays?.includes(i + 1)} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
          )}
        </Drawer>
      )}

      {overrideModal && (
        <Modal
          title={`Subscription Override — ${overrideModal.customerName}`}
          onClose={() => setOverrideModal(null)}
          footer={
            <>
              <button className="btn" onClick={() => setOverrideModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setOverrideModal(null)}>Apply Override</button>
            </>
          }
        >
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14, padding: "8px 12px", background: "var(--blue-bg)", borderRadius: 7 }}>
            Override temporarily changes this subscription for a date range without cancelling it.
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" defaultValue={TODAY} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Override Product (leave blank to keep same)</label>
            <select className="form-select">
              <option value="">— Keep current product —</option>
              {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Override Quantity</label>
            <input type="number" className="form-input" placeholder="Leave blank to keep same" min={0} max={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <input type="text" className="form-input" placeholder="e.g. Customer travelling, Guest arriving..." />
          </div>
        </Modal>
      )}
    </div>
  );
}

function OrdersPage() {
  const [dateFilter, setDateFilter] = useState(TODAY);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [failModal, setFailModal] = useState(null);

  const filtered = ORDERS.filter(o => {
    const m1 = !dateFilter || o.date === dateFilter;
    const m2 = statusFilter === "all" || o.status === statusFilter;
    return m1 && m2;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Orders</div>
        <div className="page-sub">{filtered.length} orders</div>
      </div>

      <div className="search-filter">
        <input type="date" className="form-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn">Export</button>
          <button className="btn btn-primary">Bulk Action</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Zone</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Fail Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: "var(--text-3)" }}>{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                  <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>{o.zone.replace(" Bengaluru","")}</td>
                  <td>{o.productName} <span style={{ color: "var(--text-4)", fontSize: 11 }}>{o.productUnit}</span></td>
                  <td>×{o.quantity}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace" }}>₹{o.amount}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ fontSize: 11.5, color: "var(--red)", maxWidth: 140 }}>
                    {o.failReason || <span style={{ color: "var(--text-4)" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => setSelectedOrder(o)}>Details</button>
                      {o.status === "failed" && (
                        <button className="btn btn-sm" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => setFailModal(o)}>
                          Retry
                        </button>
                      )}
                      {(o.status === "pending" || o.status === "in_transit") && (
                        <button className="btn btn-sm btn-primary">Mark Delivered</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <Drawer title={`Order ${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Customer", val: selectedOrder.customerName },
              { label: "Date", val: selectedOrder.date },
              { label: "Product", val: `${selectedOrder.productName} (${selectedOrder.productUnit})` },
              { label: "Quantity", val: `×${selectedOrder.quantity}` },
              { label: "Amount", val: `₹${selectedOrder.amount}` },
              { label: "Zone", val: selectedOrder.zone },
            ].map(r => (
              <div key={r.label} style={{ background: "var(--bg)", padding: "10px 12px", borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{r.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="form-label">Status</div>
            <div style={{ marginTop: 4 }}>{statusBadge(selectedOrder.status)}</div>
          </div>
          {selectedOrder.failReason && (
            <div style={{ padding: "10px 12px", background: "var(--red-bg)", borderRadius: 7, marginBottom: 12 }}>
              <div style={{ fontSize: 11.5, color: "#991B1B" }}><strong>Failure Reason:</strong> {selectedOrder.failReason}</div>
            </div>
          )}
          {selectedOrder.deliveredAt && (
            <div style={{ padding: "10px 12px", background: "var(--green-bg)", borderRadius: 7 }}>
              <div style={{ fontSize: 11.5, color: "#15803D" }}>✓ Delivered at {selectedOrder.deliveredAt}</div>
            </div>
          )}
        </Drawer>
      )}

      {failModal && (
        <Modal
          title="Delivery Failure — Action Required"
          onClose={() => setFailModal(null)}
          footer={
            <>
              <button className="btn" onClick={() => setFailModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setFailModal(null)}>Retry Tomorrow</button>
              <button className="btn btn-danger" onClick={() => setFailModal(null)}>Issue Refund</button>
            </>
          }
        >
          <div style={{ padding: "10px 12px", background: "var(--red-bg)", borderRadius: 7, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: "#991B1B", marginBottom: 2 }}>Failed Delivery</div>
            <div style={{ fontSize: 12, color: "#991B1B" }}>{failModal.customerName} — {failModal.failReason}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Failure Reason (confirm/update)</label>
            <select className="form-select" defaultValue={failModal.failReason}>
              {FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Action</label>
            <select className="form-select">
              <option>Retry tomorrow at same time</option>
              <option>Retry at specific time</option>
              <option>Issue wallet refund</option>
              <option>Cancel and refund</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Driver Notes</label>
            <textarea className="form-input" style={{ height: 70, paddingTop: 8 }} placeholder="Add notes for retry driver..." />
          </div>
        </Modal>
      )}
    </div>
  );
}

function DeliverySchedule() {
  const [timeLeft, setTimeLeft] = useState("02:34:17");
  const cutoffPassed = false;

  const scheduleByZone = ZONES.map(z => {
    const zoneOrders = ORDERS.filter(o => o.zone === z && o.date === TODAY);
    const products = PRODUCTS.slice(0, 3).map(p => ({
      name: p.name,
      qty: randInt(5, 40),
    }));
    return { zone: z, orders: zoneOrders.length, products };
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Delivery Schedule (T+1)</div>
        <div className="page-sub">Planning for tomorrow's deliveries</div>
      </div>

      <div className="cutoff-timer">
        <span style={{ fontSize: 13 }}>⏰</span>
        <span style={{ fontSize: 12, color: "var(--yellow)", fontWeight: 500 }}>Order cutoff in</span>
        <span className="cutoff-time">{timeLeft}</span>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>— no changes after 10:00 PM</span>
        {!cutoffPassed && <button className="btn btn-sm" style={{ marginLeft: "auto" }}>Extend Cutoff</button>}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btn-primary">Generate Tomorrow's Orders</button>
        <button className="btn">Lock Schedule</button>
        <button className="btn">Export Plan</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {scheduleByZone.map(z => (
          <div key={z.zone} className="card">
            <div className="card-title">
              📍 {z.zone}
              <span>{z.orders} orders</span>
            </div>
            {z.products.map(p => (
              <div key={p.name} className="stat-row">
                <div className="stat-label" style={{ fontSize: 12 }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 500 }}>{p.qty}L</div>
              </div>
            ))}
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <button className="btn btn-sm">View Orders</button>
              <button className="btn btn-sm">Assign Driver</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="page-title">Routes</div>
          <div className="page-sub">{ROUTES.length} routes configured</div>
        </div>
        <button className="btn btn-primary">+ New Route</button>
      </div>

      <div className="grid-2">
        <div>
          {ROUTES.map(r => {
            const driver = DRIVERS.find(d => d.id === r.driverId);
            return (
              <div key={r.id} className="card" style={{ marginBottom: 10, cursor: "pointer", border: selectedRoute?.id === r.id ? "2px solid var(--accent)" : "1px solid var(--border)" }} onClick={() => setSelectedRoute(r)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Route {r.name}</div>
                  {statusBadge(r.status)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>{r.zone}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "var(--text-3)" }}>
                  <span>🛑 {r.stops} stops</span>
                  <span>👤 {driver?.name || "Unassigned"}</span>
                </div>
                <ProgressBar value={r.status === "completed" ? r.stops : r.status === "in_progress" ? Math.floor(r.stops * 0.6) : 0} max={r.stops} color={r.status === "completed" ? "#16A34A" : "#1A6FE8"} />
                <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>
                  {r.status === "completed" ? `All ${r.stops} stops done` : r.status === "in_progress" ? `${Math.floor(r.stops * 0.6)}/${r.stops} stops complete` : "Not started"}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="map-placeholder">
            <div className="map-pin">🗺️</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
              {selectedRoute ? `Route ${selectedRoute.name} — ${selectedRoute.zone}` : "Select a route to view map"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-4)" }}>
              {selectedRoute ? `${selectedRoute.stops} delivery stops` : "Map integration placeholder"}
            </div>
            {selectedRoute && (
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-primary">View Stops</button>
                <button className="btn btn-sm">Reassign Driver</button>
              </div>
            )}
          </div>

          {selectedRoute && (
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-title">Route Details — {selectedRoute.name}</div>
              {Array.from({ length: Math.min(selectedRoute.stops, 8) }, (_, i) => {
                const c = CUSTOMERS[i % CUSTOMERS.length];
                const done = i < Math.floor(selectedRoute.stops * 0.6);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div className="timeline-dot" style={{ background: done ? "var(--green)" : selectedRoute.status === "in_progress" && i === Math.floor(selectedRoute.stops * 0.6) ? "var(--accent)" : "var(--border-strong)" }} />
                      {i < 7 && <div className="timeline-line" />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 2 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)" }}>Stop {i + 1} — {c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 1 }}>{c.address}</div>
                    </div>
                    <span className={`badge ${done ? "badge-green" : "badge-gray"}`} style={{ fontSize: 10 }}>{done ? "Done" : "Pending"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="page-title">Drivers</div>
          <div className="page-sub">{DRIVERS.length} drivers on team</div>
        </div>
        <button className="btn btn-primary">+ Add Driver</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {DRIVERS.map(d => {
          const driverRoutes = ROUTES.filter(r => r.driverId === d.id);
          return (
            <div key={d.id} className="driver-card" onClick={() => setSelectedDriver(d)} style={{ cursor: "pointer" }}>
              <div className="driver-avatar">
                {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  {statusBadge(d.status)}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6 }}>
                  📱 {d.phone} · 🚗 {d.vehicle}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 8 }}>📍 {d.zone}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: "var(--text)" }}>{d.deliveries}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-4)" }}>Total Deliveries</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: "var(--green)" }}>⭐ {d.rating}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-4)" }}>Rating</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: "var(--accent)" }}>{driverRoutes.length}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-4)" }}>Routes Today</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDriver && (
        <Drawer title={`Driver — ${selectedDriver.name}`} onClose={() => setSelectedDriver(null)}>
          <div style={{ background: "var(--bg)", padding: 16, borderRadius: 8, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <div className="driver-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
              {selectedDriver.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{selectedDriver.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{selectedDriver.phone}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 1 }}>{selectedDriver.vehicle} · {selectedDriver.zone}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>{statusBadge(selectedDriver.status)}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Total Deliveries", val: selectedDriver.deliveries },
              { label: "Rating", val: `⭐ ${selectedDriver.rating}` },
              { label: "Routes Today", val: ROUTES.filter(r => r.driverId === selectedDriver.id).length },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'DM Mono',monospace", color: "var(--text)" }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Assigned Routes</div>
            {ROUTES.filter(r => r.driverId === selectedDriver.id).map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 7, marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 12.5 }}>Route {r.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{r.stops} stops</div>
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Weekly Performance</div>
            <MiniChart data={[34, 28, 41, 38, 45, 32, 22]} color="#1A6FE8" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10.5, color: "var(--text-4)" }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

function InventoryPage() {
  const totalRequired = INVENTORY.reduce((a, i) => a + i.required, 0);
  const totalAvailable = INVENTORY.reduce((a, i) => a + i.available, 0);
  const deficitItems = INVENTORY.filter(i => i.available < i.required);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Inventory</div>
        <div className="page-sub">Today's milk demand vs available stock</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Required</div>
          <div className="kpi-value">{totalRequired.toFixed(0)}L</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>Across all products</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Available</div>
          <div className="kpi-value">{totalAvailable.toFixed(0)}L</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>In stock at hubs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Deficit Products</div>
          <div className="kpi-value" style={{ color: deficitItems.length > 0 ? "var(--red)" : "var(--green)" }}>{deficitItems.length}</div>
          <div className="kpi-change" style={{ color: deficitItems.length > 0 ? "var(--red)" : "var(--green)" }}>
            {deficitItems.length > 0 ? "⚠ Action needed" : "✓ All covered"}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Buffer Stock</div>
          <div className="kpi-value">{INVENTORY.reduce((a, i) => a + i.buffer, 0).toFixed(0)}L</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>Reserved for extras</div>
        </div>
      </div>

      {deficitItems.length > 0 && (
        <div style={{ padding: "10px 14px", background: "var(--red-bg)", border: "1px solid #FECACA", borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span>⚠</span>
          <span style={{ fontSize: 12.5, color: "#991B1B" }}><strong>{deficitItems.length} products have insufficient stock.</strong> Contact procurement immediately.</span>
          <button className="btn btn-sm btn-danger" style={{ marginLeft: "auto" }}>Alert Procurement</button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 12.5 }}>Inventory Breakdown</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Required</th>
                <th>Available</th>
                <th>Buffer</th>
                <th>Gap</th>
                <th>Coverage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map(inv => {
                const gap = inv.available - inv.required;
                const pct = Math.min(100, Math.round((inv.available / inv.required) * 100));
                return (
                  <tr key={inv.productId}>
                    <td style={{ fontWeight: 500 }}>{inv.productName} <span style={{ color: "var(--text-4)", fontSize: 11 }}>({inv.unit})</span></td>
                    <td style={{ fontFamily: "'DM Mono',monospace" }}>{inv.required.toFixed(1)}L</td>
                    <td style={{ fontFamily: "'DM Mono',monospace" }}>{inv.available.toFixed(1)}L</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text-3)" }}>{inv.buffer.toFixed(1)}L</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: gap >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                      {gap >= 0 ? "+" : ""}{gap.toFixed(1)}L
                    </td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar value={inv.available} max={inv.required} color={gap >= 0 ? "#16A34A" : "#DC2626"} />
                        </div>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, width: 32 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>{gap >= 0 ? <span className="badge badge-green">Sufficient</span> : <span className="badge badge-red">Deficit</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WalletPage() {
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = CUSTOMERS.filter(c => {
    const m1 = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const m2 = riskFilter === "all" ||
      (riskFilter === "negative" && c.wallet < 0) ||
      (riskFilter === "low" && c.wallet >= 0 && c.wallet < 200) ||
      (riskFilter === "healthy" && c.wallet >= 200);
    return m1 && m2;
  });

  const totalBalance = CUSTOMERS.reduce((a, c) => a + c.wallet, 0);
  const negativeCount = CUSTOMERS.filter(c => c.wallet < 0).length;
  const atRiskCount = CUSTOMERS.filter(c => c.wallet >= 0 && c.wallet < 200).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Wallet & Payments</div>
        <div className="page-sub">Customer wallet balances and risk indicators</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Wallet Balance</div>
          <div className="kpi-value" style={{ color: totalBalance > 0 ? "var(--green)" : "var(--red)" }}>₹{totalBalance.toLocaleString()}</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>Across all customers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Negative Balance</div>
          <div className="kpi-value" style={{ color: "var(--red)" }}>{negativeCount}</div>
          <div className="kpi-change kpi-down">Auto-pause candidates</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">At Risk (&lt;₹200)</div>
          <div className="kpi-value" style={{ color: "var(--yellow)" }}>{atRiskCount}</div>
          <div className="kpi-change" style={{ color: "var(--yellow)" }}>⚡ Recharge reminder needed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Healthy Balance</div>
          <div className="kpi-value" style={{ color: "var(--green)" }}>{CUSTOMERS.length - negativeCount - atRiskCount}</div>
          <div className="kpi-change kpi-up">✓ No action needed</div>
        </div>
      </div>

      <div className="search-filter">
        <div className="search-input">
          <span style={{ color: "var(--text-4)" }}>🔍</span>
          <input placeholder="Search customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="all">All Balances</option>
          <option value="negative">Negative Balance</option>
          <option value="low">Low (&lt;₹200)</option>
          <option value="healthy">Healthy</option>
        </select>
        <button className="btn btn-primary">Send Recharge Reminder</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Zone</th>
                <th>Wallet Balance</th>
                <th>Balance Bar</th>
                <th>Risk Level</th>
                <th>Subscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map(c => {
                const risk = c.wallet < 0 ? "critical" : c.wallet < 200 ? "warning" : "healthy";
                const activeSubs = SUBS.filter(s => s.customerId === c.id && s.status === "active").length;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.zone.replace(" Bengaluru","")}</td>
                    <td>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: c.wallet < 0 ? "var(--red)" : c.wallet < 200 ? "var(--yellow)" : "var(--green)" }}>
                        ₹{c.wallet.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ minWidth: 100 }}>
                      <ProgressBar
                        value={Math.max(0, c.wallet + 200)}
                        max={2200}
                        color={risk === "critical" ? "#DC2626" : risk === "warning" ? "#D97706" : "#16A34A"}
                      />
                    </td>
                    <td>
                      <div className="risk-indicator">
                        <div className="risk-dot" style={{ background: risk === "critical" ? "var(--red)" : risk === "warning" ? "var(--yellow)" : "var(--green)" }} />
                        <span style={{ color: risk === "critical" ? "var(--red)" : risk === "warning" ? "var(--yellow)" : "var(--green)" }}>
                          {risk === "critical" ? "Critical" : risk === "warning" ? "Warning" : "Healthy"}
                        </span>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: "'DM Mono',monospace" }}>{activeSubs} active</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm">Add Credit</button>
                        {risk !== "healthy" && <button className="btn btn-sm" style={{ color: "var(--yellow)" }}>Remind</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssetTracking() {
  const totalIssued = CUSTOMERS.reduce((a, c) => a + c.bottles_issued, 0);
  const totalReturned = CUSTOMERS.reduce((a, c) => a + c.bottles_returned, 0);
  const totalPending = CUSTOMERS.reduce((a, c) => a + c.bottles_pending, 0);
  const highPending = CUSTOMERS.filter(c => c.bottles_pending > 3);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Asset Tracking</div>
        <div className="page-sub">Glass bottle and crate ledger</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Issued</div>
          <div className="kpi-value">🍶 {totalIssued}</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>All time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Returned</div>
          <div className="kpi-value" style={{ color: "var(--green)" }}>🍶 {totalReturned}</div>
          <div className="kpi-change kpi-up">Good return rate</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Return</div>
          <div className="kpi-value" style={{ color: totalPending > 100 ? "var(--red)" : "var(--yellow)" }}>🍶 {totalPending}</div>
          <div className="kpi-change" style={{ color: "var(--text-3)" }}>With customers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">High Overdue</div>
          <div className="kpi-value" style={{ color: "var(--red)" }}>{highPending.length}</div>
          <div className="kpi-change kpi-down">More than 3 bottles out</div>
        </div>
      </div>

      {highPending.length > 0 && (
        <div style={{ padding: "10px 14px", background: "var(--yellow-bg)", border: "1px solid #FDE68A", borderRadius: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, color: "#92400E" }}>⚡ {highPending.length} customers have 3+ bottles pending. Send reminder to recover assets.</span>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Zone</th>
                <th>Issued</th>
                <th>Returned</th>
                <th>Pending</th>
                <th>Return Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.slice(0, 20).map(c => {
                const returnRate = c.bottles_issued > 0 ? Math.round((c.bottles_returned / c.bottles_issued) * 100) : 0;
                const risk = c.bottles_pending > 3 ? "high" : c.bottles_pending > 1 ? "medium" : "low";
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.zone.replace(" Bengaluru","")}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace" }}>{c.bottles_issued}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--green)" }}>{c.bottles_returned}</td>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: c.bottles_pending > 3 ? "var(--red)" : "var(--text)" }}>{c.bottles_pending}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 60 }}>
                          <ProgressBar value={returnRate} max={100} color={returnRate > 70 ? "#16A34A" : returnRate > 40 ? "#D97706" : "#DC2626"} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace" }}>{returnRate}%</span>
                      </div>
                    </td>
                    <td>
                      {risk === "high" ? <span className="badge badge-red">Overdue</span> : risk === "medium" ? <span className="badge badge-yellow">Monitor</span> : <span className="badge badge-green">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DemandForecast() {
  const productDemand = PRODUCTS.map(p => {
    const subs = SUBS.filter(s => s.productId === p.id && s.status === "active");
    const qty = subs.reduce((a, s) => a + s.quantity, 0);
    return { ...p, demand: qty, revenue: qty * p.price };
  });

  const maxDemand = Math.max(...productDemand.map(p => p.demand));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Demand Forecast</div>
        <div className="page-sub">Product-wise demand for tomorrow's deliveries</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Demand by Product</div>
          {productDemand.map(p => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name} <span style={{ color: "var(--text-4)", fontWeight: 400 }}>({p.unit})</span></div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12.5, fontWeight: 600 }}>{p.demand} units</div>
              </div>
              <ProgressBar value={p.demand} max={maxDemand} color={p.color} />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>
                Est. revenue: <strong>₹{p.revenue.toLocaleString()}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Zone-wise Demand</div>
          {ZONES.map(z => {
            const zoneSubs = SUBS.filter(s => s.zone === z && s.status === "active");
            const total = zoneSubs.reduce((a, s) => a + s.quantity, 0);
            const rev = zoneSubs.reduce((a, s) => a + s.price, 0);
            return (
              <div key={z} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{z}</div>
                  <div>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{total} pkts</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 8 }}>₹{rev.toLocaleString()}/day</span>
                  </div>
                </div>
                <ProgressBar value={total} max={150} color="#1A6FE8" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">7-Day Demand Trend</div>
        <div style={{ display: "flex", gap: 16, paddingTop: 8 }}>
          {[["Mon","Full Cream",{daily:[28,32,30,35,31,29,33]}],["","Toned",{daily:[18,20,19,22,20,17,21]}],["","Double Toned",{daily:[12,11,14,13,12,11,13]}]].map(([,label,data], i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
              <MiniChart data={data?.daily || [10,12,11,13,12,11,12]} color={PRODUCTS[i]?.color || "#1A6FE8"} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6, fontSize: 10.5, color: "var(--text-4)" }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Tomorrow"].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    cutoffTime: "22:00",
    walletThreshold: 200,
    autoPause: true,
    smsReminder: true,
    bufferPct: 10,
    retryAttempts: 2,
    refundOnFailure: false,
  });

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Operations configuration</div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Order Management</div>
          <div className="form-group">
            <label className="form-label">Daily Order Cutoff Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="time" className="form-input" style={{ width: 140 }} value={settings.cutoffTime} onChange={e => update("cutoffTime", e.target.value)} />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Orders after this time count for day+2</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Inventory Buffer %</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="number" className="form-input" style={{ width: 80 }} value={settings.bufferPct} onChange={e => update("bufferPct", +e.target.value)} min={0} max={50} />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Extra stock buffer above demand</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Wallet & Payments</div>
          <div className="form-group">
            <label className="form-label">Low Balance Threshold (₹)</label>
            <input type="number" className="form-input" style={{ width: 120 }} value={settings.walletThreshold} onChange={e => update("walletThreshold", +e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Customers below this will be flagged at risk</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 12.5 }}>Auto-pause on negative balance</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Automatically pause subscriptions when wallet goes negative</div>
            </div>
            <Toggle checked={settings.autoPause} onChange={v => update("autoPause", v)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 12.5 }}>SMS recharge reminders</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Send SMS when balance falls below threshold</div>
            </div>
            <Toggle checked={settings.smsReminder} onChange={v => update("smsReminder", v)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Delivery Failures</div>
          <div className="form-group">
            <label className="form-label">Max Retry Attempts</label>
            <input type="number" className="form-input" style={{ width: 80 }} value={settings.retryAttempts} onChange={e => update("retryAttempts", +e.target.value)} min={0} max={5} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 12.5 }}>Auto-refund on permanent failure</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Automatically credit wallet if all retries fail</div>
            </div>
            <Toggle checked={settings.refundOnFailure} onChange={v => update("refundOnFailure", v)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary">Save Settings</button>
          <button className="btn">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────────

const NAV = [
  { key: "dashboard", icon: "◈", label: "Dashboard", group: "main" },
  { key: "customers", icon: "👥", label: "Customers", group: "customers" },
  { key: "subscriptions", icon: "📋", label: "Subscriptions", group: "customers" },
  { key: "orders", icon: "📦", label: "Orders", group: "orders", badge: ORDERS.filter(o => o.status === "failed").length },
  { key: "schedule", icon: "📅", label: "Delivery Schedule", group: "orders" },
  { key: "inventory", icon: "🧮", label: "Inventory", group: "products" },
  { key: "forecast", icon: "📈", label: "Demand Forecast", group: "products" },
  { key: "routes", icon: "🗺", label: "Routes", group: "delivery" },
  { key: "drivers", icon: "🚗", label: "Drivers", group: "delivery" },
  { key: "wallet", icon: "💳", label: "Wallet", group: "payments" },
  { key: "assets", icon: "🍶", label: "Asset Tracking", group: "assets" },
  { key: "settings", icon: "⚙", label: "Settings", group: "system" },
];

const GROUP_LABELS = { main: null, customers: "Customers", orders: "Operations", products: "Products", delivery: "Delivery", payments: "Finance", assets: "Assets", system: "System" };

const PAGE_TITLES = {
  dashboard: "Dashboard", customers: "Customers", subscriptions: "Subscriptions",
  orders: "Orders", schedule: "Delivery Schedule", inventory: "Inventory",
  forecast: "Demand Forecast", routes: "Routes", drivers: "Drivers",
  wallet: "Wallet", assets: "Asset Tracking", settings: "Settings",
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [viewCustomer, setViewCustomer] = useState(null);
  const [notifs] = useState(5);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNav={setPage} />;
      case "customers": return <CustomersPage onView={c => setViewCustomer(c)} />;
      case "subscriptions": return <SubscriptionsPage />;
      case "orders": return <OrdersPage />;
      case "schedule": return <DeliverySchedule />;
      case "inventory": return <InventoryPage />;
      case "forecast": return <DemandForecast />;
      case "routes": return <RoutesPage />;
      case "drivers": return <DriversPage />;
      case "wallet": return <WalletPage />;
      case "assets": return <AssetTracking />;
      case "settings": return <SettingsPage />;
      default: return <Dashboard onNav={setPage} />;
    }
  };

  let prevGroup = null;
  const navItems = [];
  NAV.forEach(item => {
    const label = GROUP_LABELS[item.group];
    if (item.group !== prevGroup && label) {
      navItems.push(<div key={`g-${item.group}`} className="nav-label">{label}</div>);
    }
    prevGroup = item.group;
    navItems.push(
      <div key={item.key} className={`nav-item ${page === item.key ? "active" : ""}`} onClick={() => setPage(item.key)}>
        <span className="nav-icon">{item.icon}</span>
        {item.label}
        {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
      </div>
    );
  });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">M</div>
            <div>
              <div className="logo-text">MilkRide</div>
              <div className="logo-sub">Ops Console</div>
            </div>
          </div>
          <div className="nav-section">{navItems}</div>
        </div>

        <div className="main-area">
          <div className="topbar">
            <div>
              <div className="topbar-title">{PAGE_TITLES[page]}</div>
            </div>
            <div className="topbar-right">
              <div className="topbar-search">
                <span style={{ color: "var(--text-4)", fontSize: 12 }}>🔍</span>
                <input placeholder="Quick search..." />
              </div>
              <div className="icon-btn">
                🔔
                {notifs > 0 && <div className="notif-dot" />}
              </div>
              <div className="avatar">OP</div>
            </div>
          </div>
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>

      {viewCustomer && (
        <CustomerProfile customer={viewCustomer} onClose={() => setViewCustomer(null)} />
      )}
    </>
  );
}
