<!-- ============================================
  PUSH NOTIFICATIONS SETUP
  Yeh code har HTML file mein </body> se PEHLE paste karo
  (Floating chatbot button ke saath ya baad mein)
============================================ -->

<script>
// ── Push Notification Manager ──
const AGRI_API = 'http://localhost:5000';

async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js');

    // Check permission
    if (Notification.permission === 'denied') return;

    // Ask permission if not granted
    if (Notification.permission !== 'granted') {
      // Show custom prompt after 3 seconds
      setTimeout(() => showNotifPrompt(reg), 3000);
    }
  } catch(err) { console.log('SW error:', err); }
}

function showNotifPrompt(reg) {
  const token = localStorage.getItem('agriToken');
  if (!token) return; // Only for logged in users

  // Create prompt UI
  const prompt = document.createElement('div');
  prompt.id = 'notifPrompt';
  prompt.innerHTML = `
    <div style="position:fixed;bottom:90px;right:24px;background:white;border:1.5px solid #d1d5db;border-radius:12px;padding:14px 16px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9998;font-family:'Poppins',sans-serif;animation:slideUp .3s ease">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:1.2rem">🔔</span>
        <span style="font-size:0.85rem;font-weight:700;color:#0B3D2E">Notifications Enable Karo?</span>
        <button onclick="document.getElementById('notifPrompt').remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#6b7280;font-size:1rem">✕</button>
      </div>
      <p style="font-size:0.75rem;color:#6b7280;margin-bottom:10px">Booking updates, payment alerts aur offers ke liye!</p>
      <div style="display:flex;gap:8px">
        <button onclick="enableNotifications('${reg ? 'yes' : 'no'}')" style="flex:1;background:#0B3D2E;color:white;border:none;border-radius:6px;padding:7px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif">✅ Haan, Enable Karo</button>
        <button onclick="document.getElementById('notifPrompt').remove()" style="flex:1;background:#f3f4f6;color:#374151;border:none;border-radius:6px;padding:7px;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif">Baad Mein</button>
      </div>
    </div>
    <style>@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}</style>
  `;
  document.body.appendChild(prompt);
}

async function enableNotifications() {
  document.getElementById('notifPrompt')?.remove();

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      showToastNotif('❌ Notification permission denied');
      return;
    }

    const reg = await navigator.serviceWorker.ready;

    // Subscribe to push
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZkFZmkufggkt3rfcA55bEdOPog')
    });

    // Save to backend
    const token = localStorage.getItem('agriToken');
    await fetch(`${AGRI_API}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify(sub)
    });

    showToastNotif('🔔 Notifications enabled! Booking updates milenge.');

    // Test notification
    setTimeout(() => {
      new Notification('🌾 AgriShare', {
        body: 'Notifications successfully enable ho gayi! Ab booking updates milenge.',
        icon: '/favicon.ico'
      });
    }, 1000);

  } catch(err) {
    showToastNotif('Notification setup failed: ' + err.message);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function showToastNotif(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0B3D2E;color:white;padding:10px 20px;border-radius:8px;font-size:0.82rem;font-weight:500;z-index:99999;font-family:Poppins,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Auto init when page loads
document.addEventListener('DOMContentLoaded', initPushNotifications);
</script>