import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const STORAGE_KEY = 'foodbridge_seen_critical_alerts';
const POLL_INTERVAL_MS = 60 * 1000;

const getSeenAlerts = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch (error) {
    return new Set();
  }
};

const saveSeenAlerts = (seenAlerts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenAlerts].slice(-100)));
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
};

const ExpiryAlertNotifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const seenAlertsRef = useRef(getSeenAlerts());

  useEffect(() => {
    if (user?.role !== 'ngo') return undefined;

    let isMounted = true;

    const showAlert = (donation) => {
      const minutesLeft = donation.insights?.minutesLeft || 60;
      const title = `Critical pickup: ${donation.foodName}`;
      const body = `${minutesLeft} min left • ${donation.distance?.toFixed(1) || 'nearby'} km away`;

      toast.warn(body, {
        toastId: `critical-${donation._id}`,
        onClick: () => navigate('/map-view')
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          tag: `foodbridge-critical-${donation._id}`,
          requireInteraction: true
        });
        notification.onclick = () => {
          window.focus();
          navigate('/map-view');
          notification.close();
        };
      }
    };

    const pollCriticalAlerts = async () => {
      try {
        await requestNotificationPermission();
        const res = await api.get('/donations/critical-alerts');

        if (!isMounted) return;

        const seenAlerts = seenAlertsRef.current;
        res.data.forEach((donation) => {
          const alertKey = `${donation._id}:${donation.notificationCreatedAt || donation.updatedAt}`;
          if (!seenAlerts.has(alertKey)) {
            seenAlerts.add(alertKey);
            showAlert(donation);
          }
        });

        saveSeenAlerts(seenAlerts);
      } catch (error) {
        console.error('Failed to fetch critical expiry alerts:', error);
      }
    };

    pollCriticalAlerts();
    const intervalId = window.setInterval(pollCriticalAlerts, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [navigate, user]);

  return null;
};

export default ExpiryAlertNotifications;
