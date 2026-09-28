import type { EventDetail } from '../types';

/**
 * Event Metadata Service
 * Fetches event listings, seat tiers, and precise server time calibration
 */
class EventService {
  private serverTimeOffset: number = 0; // Local time + offset = Server time

  // Helper to compute timestamp for today or tomorrow
  private getTimestamp(dayOffset: number, hour: number, minute: number): number {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }



  /**
   * Calibrate client clock against server timestamp
   */
  public calibrateTime(serverTimestamp: number) {
    this.serverTimeOffset = serverTimestamp - Date.now();
  }

  public getCalibratedNow(): number {
    return Date.now() + this.serverTimeOffset;
  }

  // Registry of verified HK Ticketing projects
  private catalog: Map<string, EventDetail> = new Map([
    [
      '50000001568003',
      {
        projectId: '50000001568003',
        projectName: 'BIGBANG CONCERT / TOUR IN HONG KONG',
        venueName: '啟德體育園主場館 (Kai Tak Stadium)',
        coverUrl: 'https://gw.alicdn.com/imgextra/i3/O1CN01WOCr2D21WqpJENE48_!!6000000006993-1-tps-200-200.gif',
        waitingRoomStartTime: this.getTimestamp(1, 15, 30),
        saleStartTime: this.getTimestamp(1, 16, 0),
        saleEndTime: this.getTimestamp(1, 23, 59),
        serverTime: Date.now(),
        status: 'UPCOMING',
        sessions: [
          {
            sessionId: 'sess_17nov',
            sessionName: '17 Nov 2026 (Tuesday) 19:00',
            bizDate: '2026-11-17 19:00',
            tiers: [
              { priceId: 'tier_vip1', priceName: 'VIP1', price: 3099, stockStatus: 'AVAILABLE', maxPurchase: 2, isStanding: false },
              { priceId: 'tier_vip2', priceName: 'VIP2', price: 2699, stockStatus: 'AVAILABLE', maxPurchase: 2, isStanding: false },
              { priceId: 'tier_vip3', priceName: 'VIP3', price: 2399, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_2099_ground', priceName: 'HKD 2,099 (Ground)', price: 2099, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_2099_riser', priceName: 'HKD 2,099 (Riser)', price: 2099, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_2099_rv', priceName: 'HKD 2,099 (RV)', price: 2099, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_1899', priceName: 'HKD 1,899', price: 1899, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_1699_rv', priceName: 'HKD 1,699 (RV)', price: 1699, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_1299', priceName: 'HKD 1,299', price: 1299, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_899', priceName: 'HKD 899', price: 899, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_899_rv', priceName: 'HKD 899 (RV)', price: 899, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_699_rv', priceName: 'HKD 699 (RV - Restricted View)', price: 699, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
            ],
          },
        ],
      },
    ],
    [
      '50000001568001',
      {
        projectId: '50000001568001',
        projectName: 'COLDPLAY: MUSIC OF THE SPHERES (HONG KONG)',
        venueName: '啟德體育園主場館 (Kai Tak Stadium)',
        coverUrl: 'https://gw.alicdn.com/imgextra/i3/O1CN01WOCr2D21WqpJENE48_!!6000000006993-1-tps-200-200.gif',
        waitingRoomStartTime: this.getTimestamp(0, 10, 0),
        saleStartTime: this.getTimestamp(0, 10, 30),
        saleEndTime: this.getTimestamp(0, 23, 59),
        serverTime: Date.now(),
        status: 'UPCOMING',
        sessions: [
          {
            sessionId: 'sess_coldplay_1',
            sessionName: '11 Apr 2026 (Saturday) 20:00',
            bizDate: '2026-04-11 20:00',
            tiers: [
              { priceId: 'tier_cp_vip', priceName: 'Ultimate Spheres Experience', price: 6599, stockStatus: 'AVAILABLE', maxPurchase: 2, isStanding: false },
              { priceId: 'tier_cp_ga', priceName: 'General Admission Standing', price: 1399, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: true },
              { priceId: 'tier_cp_seated', priceName: 'Reserved Seated Level 1', price: 2099, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
              { priceId: 'tier_cp_entry', priceName: 'Restricted View Entry', price: 699, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
            ],
          },
        ],
      },
    ],
  ]);

  /**
   * Get all registered or discovered concert events
   */
  public getAvailableConcerts(): { projectId: string; projectName: string; venueName: string }[] {
    return Array.from(this.catalog.values()).map((e) => ({
      projectId: e.projectId,
      projectName: e.projectName,
      venueName: e.venueName,
    }));
  }

  /**
   * Register or update discovered event (e.g. from Userscript BroadcastChannel)
   */
  public registerDiscoveredEvent(detail: EventDetail) {
    this.catalog.set(detail.projectId, detail);
  }

  /**
   * Check queue health / live confidence against official endpoint
   */
  public async probeProjectConfidence(projectId: string): Promise<{ live: boolean; queueActive: boolean; confidence: number; raw: any }> {
    try {
      const res = await fetch(`/api/waitingRoom/queryQualified?projectId=${projectId}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        return {
          live: json.success === true,
          queueActive: data.waitingroomStatus === 1,
          confidence: json.success ? 98 : 45,
          raw: data,
        };
      }
      return { live: false, queueActive: false, confidence: 20, raw: null };
    } catch {
      return { live: false, queueActive: false, confidence: 10, raw: null };
    }
  }

  public async getEventDetail(projectId: string): Promise<EventDetail> {
    const existing = this.catalog.get(projectId);
    if (existing) {
      return {
        ...existing,
        serverTime: this.getCalibratedNow(),
      };
    }

    // Default dynamic fallback
    return {
      projectId,
      projectName: `HK Ticketing Live Event (PID: ${projectId})`,
      venueName: 'AsiaWorld-Expo / Kai Tak Stadium',
      coverUrl: 'https://gw.alicdn.com/imgextra/i3/O1CN01WOCr2D21WqpJENE48_!!6000000006993-1-tps-200-200.gif',
      waitingRoomStartTime: this.getTimestamp(0, 15, 30),
      saleStartTime: this.getTimestamp(0, 16, 0),
      saleEndTime: this.getTimestamp(0, 23, 59),
      serverTime: this.getCalibratedNow(),
      status: 'UPCOMING',
      sessions: [
        {
          sessionId: 'sess_default',
          sessionName: 'Upcoming Session',
          bizDate: new Date().toISOString().slice(0, 10),
          tiers: [
            { priceId: 'tier_def_1', priceName: 'Tier 1 Standard', price: 1299, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
            { priceId: 'tier_def_2', priceName: 'Tier 2 Entry', price: 699, stockStatus: 'AVAILABLE', maxPurchase: 4, isStanding: false },
          ],
        },
      ],
    };
  }

  public setEventSaleTime(newStartTime: number) {
    const current = this.catalog.get('50000001568003');
    if (current) current.saleStartTime = newStartTime;
  }

  public setSaleTimes(waitingRoomTime: number, saleTime: number) {
    const current = this.catalog.get('50000001568003');
    if (current) {
      current.waitingRoomStartTime = waitingRoomTime;
      current.saleStartTime = saleTime;
    }
  }
}

export const eventService = new EventService();
