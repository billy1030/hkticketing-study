import React, { useState, useEffect } from 'react';
import {
  Layers,
  Zap,
  Play,
  Square,
  Clock,
  Ticket,
  ShieldCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Terminal,
  Code2,
  Copy,
  ExternalLink,
  RotateCcw,
  FastForward,
  Radar,
  Activity,
} from 'lucide-react';
import type { EventDetail, QueueSlot } from './types';
import { eventService } from './services/eventService';
import { slotManager } from './services/slotManager';

export const App: React.FC = () => {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [slots, setSlots] = useState<QueueSlot[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [checkoutNotice, setCheckoutNotice] = useState<string>('');
  const [targetPid, setTargetPid] = useState<string>('50000001568003');
  const [autoHandoff, setAutoHandoff] = useState<boolean>(true);
  const [engineMode, setEngineMode] = useState<'LIVE' | 'SIMULATION'>('LIVE');
  const [confidence, setConfidence] = useState<{ live: boolean; queueActive: boolean; score: number } | null>(null);

  useEffect(() => {
    // Initial fetch for target Project ID
    eventService.getEventDetail(targetPid).then(setEvent);
    eventService.probeProjectConfidence(targetPid).then((res) => {
      setConfidence({ live: res.live, queueActive: res.queueActive, score: res.confidence });
    });

    // BroadcastChannel listener for userscript auto-discovered events
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hkt_live_events') : null;
    if (channel) {
      channel.onmessage = (msg) => {
        if (msg.data && msg.data.projectId) {
          eventService.registerDiscoveredEvent(msg.data);
          if (msg.data.projectId === targetPid) {
            setEvent(msg.data);
          }
        }
      };
    }

    // Subscribe to multi-slot updates
    const unsubscribe = slotManager.subscribe((slotList) => {
      setSlots(slotList);
      if (slotList.length > 0 && !selectedSlotId) {
        setSelectedSlotId(slotList[0].id);
      }
    });

    // 100ms clock ticker for precise countdown
    const ticker = setInterval(() => {
      setNow(eventService.getCalibratedNow());
    }, 100);

    return () => {
      if (channel) channel.close();
      unsubscribe();
      clearInterval(ticker);
    };
  }, [targetPid]);

  // Time remaining to 15:30 waiting room and 16:00 public sale
  const msToWaitingRoom = event?.waitingRoomStartTime ? Math.max(0, event.waitingRoomStartTime - now) : 0;
  const isWaitingRoomOpen = msToWaitingRoom === 0;

  const msToSale = event ? Math.max(0, event.saleStartTime - now) : 0;
  const isSaleOpen = msToSale === 0;

  const formatCountdown = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleInstantSaleTrigger = () => {
    eventService.setEventSaleTime(Date.now() - 1000);
    eventService.getEventDetail(targetPid).then(setEvent);
  };

  const handleResetSaleTimer = () => {
    const wr = new Date();
    wr.setDate(wr.getDate() + 1);
    wr.setHours(15, 30, 0, 0);

    const sale = new Date();
    sale.setDate(sale.getDate() + 1);
    sale.setHours(16, 0, 0, 0);

    eventService.setSaleTimes(wr.getTime(), sale.getTime());
    eventService.getEventDetail(targetPid).then(setEvent);
  };

  const [copiedSlotId, setCopiedSlotId] = useState<string>('');

  const getCheckoutUrl = (slot: QueueSlot) => {
    if (!slot.previewToken) return '';
    return `https://hkt.hkticketing.com/en/#/allEvents/detail/selectTicket?activityId=${targetPid}&previewToken=${slot.previewToken}${slot.visibleToken ? `&visibleToken=${slot.visibleToken}` : ''}`;
  };

  const handleCopyLink = (slot: QueueSlot) => {
    const url = getCheckoutUrl(slot);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlotId(slot.id);
      setTimeout(() => setCopiedSlotId(''), 2500);
    });
  };

  const handleProceedCheckout = (slot: QueueSlot) => {
    const realCheckoutUrl = getCheckoutUrl(slot);
    if (!realCheckoutUrl) return;
    
    setCheckoutNotice(
      `[QUALIFIED DISPATCH] Successfully captured release pass previewToken: ${slot.previewToken}. Official direct ticket checkout link generated!`
    );

    // Automatically open the official ticket selection page in a new window with legitimate previewToken
    window.open(realCheckoutUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(18, 20, 28, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>
              HK Ticketing Pro Client
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Maitix Cloud / Aliyun ESA v0.0.201
            </div>
          </div>
        </div>

        {/* Live Clock / Dual Precision Countdown (15:30 Waiting Room & 16:00 Sale) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-surface)',
            padding: '6px 16px',
            borderRadius: '30px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* 15:30 Waiting Room Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isWaitingRoomOpen ? '#10b981' : '#6366f1',
                boxShadow: isWaitingRoomOpen ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Waiting Room:
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '11px',
                color: isWaitingRoomOpen ? '#10b981' : '#818cf8',
              }}
            >
              {isWaitingRoomOpen ? 'OPENED' : formatCountdown(msToWaitingRoom)}
            </span>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }} />

          {/* Public Sale Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color={isSaleOpen ? '#10b981' : '#f59e0b'} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Public Sale:
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '11px',
                color: isSaleOpen ? '#10b981' : '#f59e0b',
              }}
            >
              {isSaleOpen ? 'ON SALE' : formatCountdown(msToSale)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
            <button
              onClick={handleInstantSaleTrigger}
              title="Sale Rehearsal: Force countdown to zero to simulate release (Fast-forward)"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
            >
              <FastForward size={14} />
            </button>
            <button
              onClick={handleResetSaleTimer}
              title="Reset Clock: Restore countdown to Tomorrow 16:00"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Live Mode Toggle & Target Project ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '2px 4px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => {
                setEngineMode('LIVE');
                slotManager.setMode('LIVE');
              }}
              style={{
                background: engineMode === 'LIVE' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: engineMode === 'LIVE' ? '#fff' : 'var(--text-dim)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ● LIVE PROXY
            </button>
            <button
              onClick={() => {
                setEngineMode('SIMULATION');
                slotManager.setMode('SIMULATION');
              }}
              style={{
                background: engineMode === 'SIMULATION' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: engineMode === 'SIMULATION' ? 'var(--accent-purple)' : 'var(--text-dim)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              SIMULATION
            </button>
          </div>

          {/* Auto Handoff Toggle */}
          <button
            onClick={() => {
              const next = !autoHandoff;
              setAutoHandoff(next);
              slotManager.autoOpenOnQualified = next;
              if (next && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
                Notification.requestPermission();
              }
            }}
            title="Automatically open official ticket checkout page when slot is qualified"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: autoHandoff ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
              color: autoHandoff ? '#10b981' : 'var(--text-dim)',
              border: autoHandoff ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={13} color={autoHandoff ? '#10b981' : 'var(--text-dim)'} />
            {autoHandoff ? 'AUTO-BUY: ON' : 'AUTO-BUY: OFF'}
          </button>

          {/* Tampermonkey Script Button */}
          <a
            href="/tampermonkey-hkt-fastlock.user.js"
            target="_blank"
            rel="noopener noreferrer"
            title="Install Tampermonkey Auto-Pick & Fast-Lock Userscript (Auto select 17 Nov / HK$699 / 3 tickets)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <Code2 size={13} color="#38bdf8" />
            Install Userscript
          </a>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => slotManager.startAll()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Play size={13} fill="#fff" /> Start All Slots
          </button>
          <button
            onClick={() => slotManager.stopAll()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Square size={13} fill="#f87171" /> Stop All
          </button>
          <button
            onClick={() => slotManager.createSlot()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-bright)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> New Slot
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Event Details & Seat Tiers */}
        <aside
          style={{
            width: '340px',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          {event && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--accent-indigo)',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Radar size={13} color="var(--accent-indigo)" />
                    Target Concert
                  </div>

                  {confidence && (
                    <span
                      title="Real-time connectivity confidence against official HK Ticketing waitingroom gateway"
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: confidence.live ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: confidence.live ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Activity size={10} />
                      {confidence.score}% CONFIDENCE
                    </span>
                  )}
                </div>

                {/* Concert Quick-Selector Dropdown */}
                <select
                  value={targetPid}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setTargetPid(pid);
                    slotManager.setProjectId(pid);
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    marginBottom: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {eventService.getAvailableConcerts().map((c) => (
                    <option key={c.projectId} value={c.projectId} style={{ background: '#12141c', color: '#fff' }}>
                      {c.projectName} ({c.projectId.slice(-6)})
                    </option>
                  ))}
                </select>

                <h2 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px' }}>
                  {event.projectName}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{event.venueName}</div>
              </div>

              {/* Status Badge & Health Indicator */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Project ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '12px' }}>
                    {event.projectId}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Queue Gateway</div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: confidence?.live ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {confidence?.queueActive ? 'WAITING ROOM ACTIVE' : 'OPEN / QUALIFIED'}
                  </div>
                </div>
              </div>

              {/* Ticket Tiers */}
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Ticket size={14} /> Price Tiers ({event.sessions[0]?.sessionName})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {event.sessions[0]?.tiers.map((tier) => (
                    <div
                      key={tier.priceId}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{tier.priceName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {tier.isStanding ? 'Standing Zone' : 'Reserved Seat'} · Max {tier.maxPurchase}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--accent-purple)',
                          }}
                        >
                          HK${tier.price}
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          STOCK READY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Bot Security Status */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Aliyun Baxia Shield
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                  Virtual TabId bypass active. Independent cookie jar per slot.
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Center / Right: Multi-Slot Monitor & Console */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {/* Slots Horizontal Matrix Grid */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Concurrent Queuing Slots ({slots.length})
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Bypassing official single-tab restriction via isolated storage contexts
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {slots.map((s, index) => {
                const isSelected = s.id === selectedSlotId;
                const isQualified = s.status === 'QUALIFIED';

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={isQualified ? 'pulse-qualified' : ''}
                    style={{
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      border: isSelected
                        ? '1px solid var(--accent-indigo)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: isQualified
                              ? '#10b981'
                              : s.status === 'WAITING'
                              ? '#6366f1'
                              : 'var(--border-bright)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {index + 1}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Slot #{index + 1}</span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background:
                            s.status === 'QUALIFIED'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : s.status === 'WAITING'
                              ? 'rgba(99, 102, 241, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                          color:
                            s.status === 'QUALIFIED'
                              ? '#10b981'
                              : s.status === 'WAITING'
                              ? '#818cf8'
                              : 'var(--text-dim)',
                        }}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                      TabId: {s.tabId}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.progress}%</span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${s.progress}%`,
                            background: isQualified
                              ? 'linear-gradient(90deg, #10b981, #34d399)'
                              : 'linear-gradient(90deg, #6366f1, #a855f7)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {s.status === 'IDLE' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            slotManager.startQueue(s.id);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-purple)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Start Queue
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            slotManager.stopQueue(s.id);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Pause
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          slotManager.forcePass(s.id);
                        }}
                        title="Simulate queue completion and grab token"
                        style={{
                          padding: '6px 10px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Pass Now
                      </button>

                      {isQualified && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(s);
                            }}
                            title="Copy official direct checkout URL (with previewToken)"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              background: copiedSlotId === s.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                              color: copiedSlotId === s.id ? '#10b981' : '#38bdf8',
                              border: copiedSlotId === s.id ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.35)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Copy size={12} />
                            {copiedSlotId === s.id ? 'Copied!' : 'Copy Link'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProceedCheckout(s);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <ExternalLink size={12} />
                            Lock & Buy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Details Panel & Live Console */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Slot Detailed Info & Simulation Area */}
            <div
              style={{
                flex: 1,
                padding: '24px',
                borderRight: '1px solid var(--border-subtle)',
                overflowY: 'auto',
              }}
            >
              {checkoutNotice && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle2 size={20} color="#10b981" />
                  <div>{checkoutNotice}</div>
                </div>
              )}

              {selectedSlot ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                      Inspector: {selectedSlot.id.toUpperCase()}
                    </h4>
                    {selectedSlot.previewToken && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={14} /> Qualified & Ready for Checkout
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        Visible Token (WAF Entry)
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {selectedSlot.visibleToken || 'None (Queueing)'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Preview Token (Checkout Pass)</span>
                        {selectedSlot.previewToken && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleCopyLink(selectedSlot)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: copiedSlotId === selectedSlot.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                                color: copiedSlotId === selectedSlot.id ? '#10b981' : '#38bdf8',
                                border: copiedSlotId === selectedSlot.id ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.35)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Copy size={10} />
                              {copiedSlotId === selectedSlot.id ? 'Copied URL!' : 'Copy URL'}
                            </button>
                            <button
                              onClick={() => handleProceedCheckout(selectedSlot)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <ExternalLink size={10} />
                              Open Now
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                        {selectedSlot.previewToken || 'None (Awaiting Turn)'}
                      </div>
                    </div>
                  </div>

                  {/* Architecture Flow Diagram */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>
                      ⚡ Protocol State Machine
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        1. Edge Check (wr-static)
                      </div>
                      ➔
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--accent-purple)',
                        }}
                      >
                        2. Query Qualified (/api)
                      </div>
                      ➔
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: selectedSlot.previewToken
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: selectedSlot.previewToken ? '#10b981' : 'var(--text-dim)',
                          fontWeight: selectedSlot.previewToken ? 700 : 400,
                        }}
                      >
                        3. Token Release (/selectTicket)
                      </div>
                      ➔
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        4. MaiPay Checkout
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Real-time Telemetry & Log Console */}
            <div
              style={{
                width: '420px',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                <Terminal size={14} /> Telemetry & Protocol Logs
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  color: '#94a3b8',
                  overflowY: 'auto',
                }}
              >
                {selectedSlot?.logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '4px',
                      color: log.includes('QUALIFIED')
                        ? '#34d399'
                        : log.includes('Connecting')
                        ? '#818cf8'
                        : '#94a3b8',
                    }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
