'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Avatar, Spinner } from '@/components/ui/Components'
import { timeAgo, cn } from '@/lib/utils'

/**
 * MessagesPanel — full real-time chat UI
 *
 * Props:
 *   currentUserId — the logged-in user's profile ID
 *   currentUserName — display name
 *
 * Features:
 *   - Conversation list on the left
 *   - Message thread on the right with real-time updates
 *   - Send message on Enter or button click
 *   - Auto-scroll to latest message
 *   - Unread indicators on conversation list
 */
export default function MessagesPanel({ currentUserId, currentUserName }) {
  const supabase = useMemo(() => createClient(), [])

  const [conversations, setConversations]   = useState([])
  const [activeConvId,  setActiveConvId]    = useState(null)
  const [messages,      setMessages]         = useState([])
  const [draft,         setDraft]            = useState('')
  const [sending,       setSending]          = useState(false)
  const [loadingConvs,  setLoadingConvs]     = useState(true)
  const [loadingMsgs,   setLoadingMsgs]      = useState(false)

  const bottomRef  = useRef(null)
  const channelRef = useRef(null)

  // ── Load conversations ────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return

    const loadConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          p1:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, headline),
          p2:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, headline)
        `)
        .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false })

      setConversations(data || [])
      setLoadingConvs(false)

      // Auto-open first conversation
      if (data?.length && !activeConvId) {
        setActiveConvId(data[0].id)
      }
    }

    loadConversations()
  }, [activeConvId, currentUserId, supabase])

  // ── Load messages when conversation changes ───────────────────
  useEffect(() => {
    if (!activeConvId) return

    setLoadingMsgs(true)

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
        .eq('conversation_id', activeConvId)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages(data || [])
      setLoadingMsgs(false)

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', activeConvId)
        .neq('sender_id', currentUserId)
    }

    loadMessages()

    // Unsubscribe from previous channel
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConvId}`,
      }, async (payload) => {
        // Fetch sender info for the new message
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single()

        setMessages(prev => [...prev, { ...payload.new, sender }])
      })
      .subscribe()

    channelRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [activeConvId, currentUserId, supabase])

  // ── Auto-scroll to bottom ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = draft.trim()
    if (!content || !activeConvId || sending) return

    setSending(true)
    setDraft('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id:       currentUserId,
      content,
    })

    if (!error) {
      // Update conversation's last_message
      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', activeConvId)
    }

    setSending(false)
  }, [draft, activeConvId, currentUserId, sending, supabase])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const getOtherParticipant = (conv) => {
    return conv.participant_1 === currentUserId ? conv.p2 : conv.p1
  }

  const activeConv = conversations.find(c => c.id === activeConvId)
  const otherUser  = activeConv ? getOtherParticipant(activeConv) : null

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-130px)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

      {/* ── Conversation list ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          )}

          {!loadingConvs && conversations.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Messages from employers and clients will appear here
              </p>
            </div>
          )}

          {conversations.map(conv => {
            const other = getOtherParticipant(conv)
            const isActive = conv.id === activeConvId
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Avatar name={other?.full_name} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold truncate',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'
                  )}>
                    {other?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.last_message || 'Start a conversation'}
                  </p>
                </div>
                {conv.last_message_at && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Message thread ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm font-semibold">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <Avatar name={otherUser?.full_name} size="sm" />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {otherUser?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-400">{otherUser?.headline}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {loadingMsgs && (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              )}

              {messages.map(msg => {
                const isOwn = msg.sender_id === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2 items-end', isOwn && 'flex-row-reverse')}
                  >
                    {!isOwn && <Avatar name={msg.sender?.full_name} size="xs" />}

                    <div className={cn(
                      'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
                      isOwn
                        ? 'bg-brand-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                    )}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>

                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                )
              })}

              {/* Scroll anchor */}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 items-end">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700',
                  'bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white',
                  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500',
                  'max-h-32 overflow-y-auto'
                )}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  draft.trim()
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                )}
              >
                {sending ? '…' : '↑'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
