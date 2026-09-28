import type { QueueSlot } from '../types';
import { WaitingRoomEngine } from './waitingRoomEngine';

/**
 * Slot Manager
 * Manages multiple isolated queuing workers.
 * Each slot has its own tabId and user session context,
 * circumventing the browser WAITINGROOM_ACTIVE_TAB_ mutex limit.
 */
class SlotManager {
  private slots: Map<string, { slot: QueueSlot; engine: WaitingRoomEngine }> = new Map();
  private subscribers: ((slots: QueueSlot[]) => void)[] = [];
  public autoOpenOnQualified: boolean = true;
  public projectId: string = '50000001568003';

  constructor() {
    this.createSlot('Main Chrome Profile');
    this.createSlot('Incognito Session');
  }

  public subscribe(fn: (slots: QueueSlot[]) => void) {
    this.subscribers.push(fn);
    this.notify();
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }

  private notify() {
    const list = Array.from(this.slots.values()).map((item) => ({ ...item.slot }));
    this.subscribers.forEach((fn) => fn(list));
  }

  public createSlot(label?: string): string {
    const id = `slot-${Date.now().toString(36).slice(-4)}`;
    const tabId = `tab_${Math.random().toString(36).slice(2, 10)}`;
    const slot: QueueSlot = {
      id,
      tabId,
      status: 'IDLE',
      progress: 0,
      logs: [`[${new Date().toLocaleTimeString()}] Slot created (${label || 'Default'}). TabId: ${tabId}`],
    };

    const engine = new WaitingRoomEngine('50000001568003', tabId);

    engine.setCallbacks(
      (data) => {
        const target = this.slots.get(id);
        if (!target) return;
        target.slot.progress = data.progress || 0;
        target.slot.status = 'WAITING';
        target.slot.logs.unshift(
          `[${new Date().toLocaleTimeString()}] Poll wr-static: ${data.progress}% (ETA: ${data.estimatedWaitSeconds}s)`
        );
        this.notify();
      },
      (data) => {
        const target = this.slots.get(id);
        if (!target) return;
        target.slot.progress = 100;
        target.slot.status = 'QUALIFIED';
        target.slot.previewToken = data.previewToken;
        target.slot.visibleToken = data.visibleToken;
        target.slot.qualifiedTime = Date.now();
        target.slot.expiryTime = data.passEndTime;
        target.slot.logs.unshift(
          `[${new Date().toLocaleTimeString()}] 🚀 QUALIFIED! Acquired previewToken: ${data.previewToken?.slice(0, 10)}...`
        );
        this.notify();
        this.playSuccessChime();

        // Trigger OS Notification & Auto-Handoff if enabled
        if (this.autoOpenOnQualified && data.previewToken) {
          const url = `https://hkt.hkticketing.com/en/#/allEvents/detail/selectTicket?activityId=${this.projectId}&previewToken=${data.previewToken}${data.visibleToken ? `&visibleToken=${data.visibleToken}` : ''}`;
          window.open(url, '_blank');
        }

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('HK Ticketing 排隊成功！', {
            body: `Slot #${id} 已獲取通行憑證 previewToken，請立即前往選座！`,
            icon: 'https://gw.alicdn.com/imgextra/i3/O1CN01WOCr2D21WqpJENE48_!!6000000006993-1-tps-200-200.gif',
          });
        }
      }
    );

    this.slots.set(id, { slot, engine });
    this.notify();
    return id;
  }

  public startQueue(id: string) {
    const target = this.slots.get(id);
    if (!target) return;
    target.slot.status = 'CONNECTING';
    target.slot.startTime = Date.now();
    target.slot.logs.unshift(`[${new Date().toLocaleTimeString()}] Connecting to waiting room...`);
    target.engine.start();
    this.notify();
  }

  public stopQueue(id: string) {
    const target = this.slots.get(id);
    if (!target) return;
    target.engine.stop();
    target.slot.status = 'IDLE';
    target.slot.logs.unshift(`[${new Date().toLocaleTimeString()}] Queue paused by user.`);
    this.notify();
  }

  public forcePass(id: string) {
    const target = this.slots.get(id);
    if (!target) return;
    target.engine.forcePass();
  }

  public setMode(mode: 'LIVE' | 'SIMULATION') {
    this.slots.forEach((item) => {
      item.engine.mode = mode;
      item.slot.logs.unshift(`[${new Date().toLocaleTimeString()}] Mode switched to: ${mode}`);
    });
    this.notify();
  }

  public setProjectId(projectId: string) {
    this.projectId = projectId;
    this.slots.forEach((item) => {
      item.engine.stop();
      item.engine.setProjectId(projectId);
      item.slot.status = 'IDLE';
      item.slot.progress = 0;
      item.slot.logs.unshift(`[${new Date().toLocaleTimeString()}] Switched target Project ID: ${projectId}`);
    });
    this.notify();
  }

  public startAll() {
    this.slots.forEach((item) => {
      if (item.slot.status !== 'QUALIFIED') {
        this.startQueue(item.slot.id);
      }
    });
  }

  public stopAll() {
    this.slots.forEach((item) => {
      this.stopQueue(item.slot.id);
    });
  }

  private playSuccessChime() {
    try {
      // Web Audio API chime
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext unavailable or restricted
    }
  }
}

export const slotManager = new SlotManager();
