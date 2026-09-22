import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } =
    useFinance();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={16} className="notif-type-icon warning" />;
      case 'success':
        return <CheckCircle2 size={16} className="notif-type-icon success" />;
      default:
        return <Info size={16} className="notif-type-icon info" />;
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notif-header">
        <div className="notif-header-left">
          <h4>Notifications</h4>
          {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount} new</span>}
        </div>
        <div className="notif-actions-top">
          {unreadCount > 0 && (
            <button
              className="notif-btn-action"
              title="Mark all as read"
              onClick={markAllNotificationsRead}
            >
              <CheckCheck size={16} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notif-btn-action"
              title="Clear all"
              onClick={clearAllNotifications}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={28} />
            <p>No new notifications</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => markNotificationRead(n.id)}
            >
              <div className="notif-icon-col">{getIcon(n.type)}</div>
              <div className="notif-content-col">
                <div className="notif-title-row">
                  <h5>{n.title}</h5>
                  <span className="notif-time">{n.timestamp}</span>
                </div>
                <p className="notif-msg">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
