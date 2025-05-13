import { Qrwc } from '@q-sys/qrwc';

export async function createQrwcInstance(coreIp: string, secure = false): Promise<Qrwc> {
	return new Promise((resolve, reject) => {
		//clean up any orphaned QRWC instances
		if ((window as any).qrwcInstance) {
			try {
				((window as any).qrwcInstance as Qrwc).close();
			} catch (e) {
				//Ignore
			}
		}

		const qrwc = new Qrwc();
		const ws = new WebSocket(`${secure ? 'wss' : 'ws'}://${coreIp}/qrc-public-api/v0`);

		//add it to the window object so it can be killed if necessary
		(window as any).qrwcInstance = qrwc;

		const timeoutHandle = setTimeout(() => {
			if (ws && (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CONNECTING)) {
				ws.close();
			}
			reject(new Error('Timeout while creating Qrwc instance'));
		}, 20000);

		//wait for the websocket to open
		ws.onopen = async () => {
			await qrwc.attachWebSocket(ws);

			//signal that the instance has a connected websocket
			clearTimeout(timeoutHandle);
			resolve(qrwc);
		};
	});
}
