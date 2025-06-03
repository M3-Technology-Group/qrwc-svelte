import type { IStartOptions } from "@q-sys/qrwc";

/**
 * @param coreIp - The IP of the core system to connect to. In a Primary/Secondary configuration, this should be the IP of the primary core.
 * @param redundantCoreIp - If this system uses a redundant core, specify the IP of the redundant core here. This will enable automatic failover.
 * @param secure - If true, the connection will use wss instead of ws.
 * @param poleInterval - The interval in milliseconds at which the system will poll the core for updates. Default is 35ms.
 * @param controlFilter - An array of control names to subscribe to. If provided, only controls in this array will be sent to the system. If a function is provided, it will be called with the control name as an argument and should return a boolean indicating whether to subscribe to that control.
 */
export interface ConnectionOptions {
    coreIp: string;
    redundantCoreIp?: string;
    secure?: boolean;
    poleInterval?: number;
    controlFilter?: string[] | IStartOptions['componentFilter'];
}

/**
 * Connection status for QRWC WebSocket. "connected" means the QRWC Wrapper is ready to accept subscriptions.
 */
export type ConnectionEvent = "connecting" | "connected" | "disconnected";