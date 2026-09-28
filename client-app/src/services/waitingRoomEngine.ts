import type { QueueCheckResponse } from '../types';

/**
 * Waiting Room Core Engine
 * Implements the dual-track detection derived from waitingRoom.js:
 * Track 1: CDN Edge probe (wr-static.maitix.com/check)
 * Track 2: Core API check (/api/waitingRoom/queryQualified)
 */
export class WaitingRoomEngine {
  private projectId: string;
  public userId: string;
  public tabId: string;
  private pollingTimer: any = null;
  private isDegraded: boolean = false;
  private currentProgress: number = 0;
  public infoToken?: string;

  private onUpdateCallback?: (data: QueueCheckResponse) => void;
  private onQualifiedCallback?: (data: QueueCheckResponse) => void;

  constructor(projectId: string, tabId: string, userId?: string) {
    this.projectId = projectId;
    this.tabId = tabId;
    this.userId = userId || 'usr_' + Math.random().toString(36).substring(2, 9);
  }

  public setCallbacks(
    onUpdate: (data: QueueCheckResponse) => void,
    onQualified: (data: QueueCheckResponse) => void
  ) {
    this.onUpdateCallback = onUpdate;
    this.onQualifiedCallback = onQualified;
  }

  /**
   * Start dual-track polling
   */
  public start() {
    this.stop();
    this.currentProgress = 0;
    this.poll();
  }

  public stop() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  public mode: 'LIVE' | 'SIMULATION' = 'LIVE';

  /**
   * Dual-track polling against real /api/waitingRoom/queryQualified or fallback simulation
   */
  private async poll() {
    try {
      if (this.mode === 'LIVE') {
        // Direct probe to proxied live API: /api/waitingRoom/queryQualified
        const res = await fetch(`/api/waitingRoom/queryQualified?projectId=${this.projectId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'X-User-Id': this.userId,
          },
        });

        if (res.ok) {
          const json = await res.json();
          // Real server response format: { success: true, code: "200", data: { waitingroomStatus: 0, qualified: ... } }
          const data = json.data || {};
          const isPass = data.waitingroomStatus === 0 || data.qualified === true;

          const response: QueueCheckResponse = {
            projectId: this.projectId,
            waitingroomStatus: data.waitingroomStatus ?? 0,
            qualified: isPass,
            progress: isPass ? 100 : (data.progress ?? 50),
            degradeLoad: data.degradeLoad ?? false,
            passEndTime: data.passEndTime,
            infoToken: data.infoToken,
            visibleToken: data.visibleToken || (isPass ? 'live_vis_' + this.projectId : undefined),
            previewToken: data.previewToken || (isPass ? 'live_prv_' + Math.random().toString(36).slice(2, 10) : undefined),
            estimatedWaitSeconds: isPass ? 0 : 30,
          };

          if (this.onUpdateCallback) this.onUpdateCallback(response);

          if (isPass) {
            if (this.onQualifiedCallback) this.onQualifiedCallback(response);
            return;
          }

          const interval = data.degradeLoad ? 5000 : 2500;
          this.pollingTimer = setTimeout(() => this.poll(), interval);
          return;
        }
      }

      // Fallback / SIMULATION mode:
      const delta = Math.floor(Math.random() * 8) + 4;
      this.currentProgress = Math.min(100, this.currentProgress + delta);

      const isPass = this.currentProgress >= 100;

      const mockResponse: QueueCheckResponse = {
        projectId: this.projectId,
        waitingroomStatus: isPass ? 0 : 1,
        qualified: isPass,
        progress: this.currentProgress,
        degradeLoad: this.isDegraded,
        passEndTime: isPass ? Date.now() + 600 * 1000 : undefined,
        infoToken: 'inf_' + Math.random().toString(36).substring(2, 8),
        visibleToken: isPass ? 'vis_' + Math.random().toString(36).substring(2, 10) : undefined,
        previewToken: isPass ? 'prv_' + Math.random().toString(36).substring(2, 12) : undefined,
        estimatedWaitSeconds: Math.max(0, Math.ceil((100 - this.currentProgress) * 0.8)),
      };

      if (this.onUpdateCallback) {
        this.onUpdateCallback(mockResponse);
      }

      if (isPass) {
        if (this.onQualifiedCallback) {
          this.onQualifiedCallback(mockResponse);
        }
        return;
      }

      const interval = this.isDegraded ? 5000 : 2200;
      this.pollingTimer = setTimeout(() => this.poll(), interval);
    } catch (err) {
      console.error('WaitingRoom check error:', err);
      this.pollingTimer = setTimeout(() => this.poll(), 4000);
    }
  }

  public forcePass() {
    this.currentProgress = 100;
    if (this.pollingTimer) clearTimeout(this.pollingTimer);
    this.poll();
  }
}
