'use client'
import { cn, timeAgo } from '@/lib/utils'

/**
 * NotificationsPanel — slide-in panel showing recent notifications
 *
 * Props:
 *   notifications — array of notification rows from DB
 *   onMarkAllRead — callback to mark all as read
 *   onClose       — callback to close the panel
 */
export default function NotificationsPanel({ notifications = [], onMarkAllRead, onClose }) {

  // Icon map per notification type
  const ICONS = {
    application: { icon: '📥', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    message:     { icon: '💬', bg: 'bg-blue-50 dark:bg-blue-900/20'  },
    offer:       { icon: '🎉', bg: 'bg-green-50 dark:bg-green-900/20' },
    milestone:   { icon: '💰', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    dispute:     { icon: '⚖️', bg: 'bg-red-50 dark:bg-red-900/20'    },
    match:       { icon: '🤖', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    alert:       { icon: '🔔', bg: 'bg-gray-50 dark:bg-gray-800'     },
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl z-40 overflow-hidden animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
        <div className="flex gap-3">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-brand-500 font-semibold hover:text-brand-600"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(n => {
            const style = ICONS[n.type] || ICONS.alert
            return (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer transition-colors',
                  !n.is_read
                    ? 'bg-brand-50/50 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm',
                  style.bg
                )}>
                  {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs leading-relaxed',
                    !n.is_read
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  )}>
                    {n.body || n.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <button className="text-xs text-brand-500 font-semibold hover:text-brand-600 w-full text-center">
          View all notifications →
        </button>
      </div>
    </div>
  )
}

