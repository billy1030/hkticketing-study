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

  private activeEvent: EventDetail = {
    projectId: '50000001568003',
    projectName: 'BIGBANG CONCERT / TOUR IN HONG KONG',
    venueName: '啟德體育園主場館 (Kai Tak Stadium)',
    coverUrl: 'https://gw.alicdn.com/imgextra/i3/O1CN01WOCr2D21WqpJENE48_!!6000000006993-1-tps-200-200.gif',
    waitingRoomStartTime: this.getTimestamp(1, 15, 30), // Tomorrow 15:30 (DayOffset = 1)
    saleStartTime: this.getTimestamp(1, 16, 0),        // Tomorrow 16:00 (DayOffset = 1)
    saleEndTime: this.getTimestamp(1, 23, 59),
    serverTime: Date.now(),
    status: 'UPCOMING',
    sessions: [
      {
        sessionId: 'sess_17nov',
        sessionName: '17 Nov 2026 (Tuesday) 19:00',
        bizDate: '2026-11-17 19:00',
        tiers: [
          {
            priceId: 'tier_vip1',
            priceName: 'VIP1',
            price: 3099,
            stockStatus: 'AVAILABLE',
            maxPurchase: 2,
            isStanding: false,
          },
          {
            priceId: 'tier_vip2',
            priceName: 'VIP2',
            price: 2699,
            stockStatus: 'AVAILABLE',
            maxPurchase: 2,
            isStanding: false,
          },
          {
            priceId: 'tier_vip3',
            priceName: 'VIP3',
            price: 2399,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_2099_ground',
            priceName: 'HKD 2,099 (Ground)',
            price: 2099,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_2099_riser',
            priceName: 'HKD 2,099 (Riser)',
            price: 2099,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_2099_rv',
            priceName: 'HKD 2,099 (RV - Restricted View)',
            price: 2099,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_1899',
            priceName: 'HKD 1,899',
            price: 1899,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_1699_rv',
            priceName: 'HKD 1,699 (RV - Restricted View)',
            price: 1699,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_1299',
            priceName: 'HKD 1,299',
            price: 1299,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_899',
            priceName: 'HKD 899',
            price: 899,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_899_rv',
            priceName: 'HKD 899 (RV - Restricted View)',
            price: 899,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
          {
            priceId: 'tier_699_rv',
            priceName: 'HKD 699 (RV - Restricted View)',
            price: 699,
            stockStatus: 'AVAILABLE',
            maxPurchase: 4,
            isStanding: false,
          },
        ],
      },
    ],
  };

  /**
   * Calibrate client clock against server timestamp
   */
  public calibrateTime(serverTimestamp: number) {
    this.serverTimeOffset = serverTimestamp - Date.now();
  }

  public getCalibratedNow(): number {
    return Date.now() + this.serverTimeOffset;
  }

  public async getEventDetail(projectId: string): Promise<EventDetail> {
    // In production, hits https://hkticketing.com/api/ticketSale/detail
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...this.activeEvent,
          projectId,
          serverTime: this.getCalibratedNow(),
        });
      }, 150);
    });
  }

  public setEventSaleTime(newStartTime: number) {
    this.activeEvent.saleStartTime = newStartTime;
  }

  public setSaleTimes(waitingRoomTime: number, saleTime: number) {
    this.activeEvent.waitingRoomStartTime = waitingRoomTime;
    this.activeEvent.saleStartTime = saleTime;
  }
}

export const eventService = new EventService();
