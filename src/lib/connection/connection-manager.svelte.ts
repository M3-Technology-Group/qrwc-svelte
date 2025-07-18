import type { ConnectionOptions, ConnectionEvent } from '../types/connection-options.svelte.js';
import type { Qrwc, IStartOptions } from '@q-sys/qrwc';
import { createQrwcInstance } from './qrwc-factory.js';

/**
 * Handles the connection to the QRWC WebSocket and manages the connection state.
 *
 * @fires connectionState - The current state of the connection. "connecting" means the QRWC Wrapper is attempting to connect. "connected" means the QRWC Wrapper is ready to accept subscriptions. "disconnected" means the QRWC Wrapper is not connected to the QRWC WebSocket.
 * @fires connectionAttempts - The number of connection attempts made by the QRWC Wrapper.
 */
export class ConnectionManager {
	private options: ConnectionOptions;
	protected qrwc: Qrwc | null = null;

	//we will attempt reconnection if the sock drops, unless the user manually kills it, in which case we
	//will not attempt to reconnect
	private allowReconnect = true;

	protected connectionAttempts = $state<number>(0);
	protected connectionState = $state<ConnectionEvent>('disconnected');
	protected activeCoreState = $state< "primary" | "redundant" >("primary");
	protected coreIpState = $state<string>("");

	/**
	 * Create a new QRWC Instance and connect to the QRWC WebSocket
	 *
	 * @param options - Connection options for the QRWC WebSocket
	 * @param onInitialValues - Callback function to be invoked when the initial values are received from the QRWC WebSocket
	 * @param onComponentUpdate - Callback function to be invoked when a control is updated
	 */
	constructor(options: ConnectionOptions) {
		this.options = options;
		this.connectToQrwc();
	}

	/**
	 * Manually disconnect the QRWC WebSocket, and no longer attempt to reconnect.
	 */
	protected killConnection(): void {
		this.allowReconnect = false;
		this.handleDisconnect();
	}

	private async connectToQrwc(): Promise<void> {
		if (this.connectionState !== 'disconnected') {
			console.log(
				`QRWC wrapper attempted to connect to Qrwc while already ${this.connectionState}, aborting.`
			);
			return;
		}

		const connectionTimeout = setTimeout(() => {
			console.error('QRWC connection attempt timed out');
			this.connectionAttempts++;
			this.handleDisconnect();
		}, 30000);

		try {
			this.connectionState = 'connecting';

			//figure out which core to connect to - if the connection attempts are even, use the redundant core
			let coreIp = this.options.coreIp;
			if (
				this.options.redundantCoreIp &&
				this.connectionAttempts > 1 &&
				this.connectionAttempts % 2 === 0
			) {
				console.log(
					`QRWC Attempting connection to redundant core at ${this.options.redundantCoreIp}`
				);
				this.activeCoreState = 'redundant';
				coreIp = this.options.redundantCoreIp;
			} else {
				this.activeCoreState = 'primary';
			}
			this.coreIpState = coreIp;

			this.qrwc = await this.startAndSubscribe();

			this.qrwc.on('disconnected', () => {
				console.log('QRWC Disconnected by QRWC instance');
				this.handleDisconnect();
			});
			clearTimeout(connectionTimeout);
			this.connectionAttempts = 0;
			console.log('QRWC Connection established. Ready to handle control subscriptions');
			this.connectionState = 'connected';
		} catch (e) {
			console.error('QRWC connection Error', e);
			clearTimeout(connectionTimeout);
			this.connectionAttempts++;
			this.handleDisconnect();
		}
	}

	private activeConnectionTimeout: number | null = null;
	private handleDisconnect(): void {
		if (this.connectionState === 'disconnected') return;

		try {
			this.qrwc?.close();
		} catch {
			//do nothing - the instance is likely already closed, but just in case we close it again here
		}

		this.connectionState = 'disconnected';

		this.qrwc = null;

		//if the user has manually disconnected, we will not attempt to reconnect
		if (!this.allowReconnect) return;

		console.log(`QRWC Connection lost. Re-connection attempt: ${this.connectionAttempts}`);
		if (this.activeConnectionTimeout) {
			clearTimeout(this.activeConnectionTimeout);
			this.activeConnectionTimeout = null;
		}
		this.activeConnectionTimeout = setTimeout(
			() => {
				this.activeConnectionTimeout = null;
				this.connectToQrwc();
			},
			this.connectionAttempts > 5 ? 25000 : 10000
		);
	}

	private async startAndSubscribe(): Promise<Qrwc> {
		let componentFilter: IStartOptions['componentFilter'] = undefined;
		if (this.options.controlFilter) {
			if (Object.prototype.toString.call(this.options.controlFilter) === '[object Array]') {
				componentFilter = (componentId) => {
					const filter = this.options.controlFilter as string[];
					return filter.includes(componentId.ID);
				};
			} else {
				componentFilter = this.options.controlFilter as IStartOptions['componentFilter'];
			}
		}

		const opts: Partial<IStartOptions> = {
			componentFilter: componentFilter,
			pollingInterval: this.options.poleInterval ?? 35
		};

		const qrwc = await createQrwcInstance(this.coreIpState, opts, this.options.secure);

		return qrwc;
	}
}
