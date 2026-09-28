/**
 * HK Ticketing Core Types & Schema
 * Derived from reverse engineered mz-web & UmiJS runtime
 */

export interface EventDetail {
  projectId: string;
  projectName: string;
  venueName: string;
  coverUrl: string;
  waitingRoomStartTime: number; // Unix timestamp ms for queue room open (15:30)
  saleStartTime: number; // Unix timestamp ms for public sale (16:00)
  saleEndTime: number;
  serverTime: number; // For synchronization
  status: 'UPCOMING' | 'ON_SALE' | 'SOLD_OUT' | 'ENDED';
  sessions: EventSession[];
}

export interface EventSession {
  sessionId: string;
  sessionName: string;
  bizDate: string; // e.g. "2026-10-15 20:00"
  tiers: TicketTier[];
}

export interface TicketTier {
  priceId: string;
  priceName: string; // e.g. "Zone A 企位", "Zone B 坐位"
  price: number; // e.g. 1080
  stockStatus: 'AVAILABLE' | 'FEW' | 'SOLDOUT';
  maxPurchase: number; // default 2 or 4
  isStanding: boolean;
}

export interface QueueCheckResponse {
  projectId: string;
  waitingroomStatus: number; // 0 = Pass / Not required, 1 = Waiting Room Active
  qualified: boolean; // true = Qualified, can proceed to ticket selection
  progress?: number; // 0 - 100 percentage
  degradeLoad?: boolean; // Rate limit flag
  passEndTime?: number; // Qualified expiry timestamp ms
  infoToken?: string;
  visibleToken?: string;
  previewToken?: string;
  estimatedWaitSeconds?: number;
}

export interface QueueSlot {
  id: string; // slot-1, slot-2...
  tabId: string; // Virtual tabId bypassing WAITINGROOM_ACTIVE_TAB_ mutex
  userId?: string; // Virtual or actual X-User-Id
  status: 'IDLE' | 'CONNECTING' | 'WAITING' | 'QUALIFIED' | 'PASSED' | 'ERROR';
  progress: number; // 0 - 100
  startTime?: number;
  qualifiedTime?: number;
  expiryTime?: number;
  previewToken?: string;
  visibleToken?: string;
  logs: string[];
}

export interface CartLockState {
  locked: boolean;
  orderId?: string;
  activityId?: string;
  expireTimestamp?: number;
  items: {
    tierName: string;
    qty: number;
    price: number;
  }[];
}
