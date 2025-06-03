import { Qrwc, type IStartOptions } from '@q-sys/qrwc';

export async function createQrwcInstance(coreIp: string,opts: Partial<IStartOptions>, secure = false): Promise<Qrwc> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(`${secure ? 'wss' : 'ws'}://${coreIp}/qrc-public-api/v0`);

		const timeoutHandle = setTimeout(() => {
			if (ws && (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CONNECTING)) {
				ws.close();
			}
			reject(new Error('Timeout while creating Qrwc instance'));
		}, 20000);

		//wait for the websocket to open
		ws.onopen = async () => {
			opts.socket = ws;
			const qrwc = await Qrwc.createQrwc(opts as IStartOptions);

			//signal that the instance has a connected websocket
			clearTimeout(timeoutHandle);
			resolve(qrwc);
		};
	});
}
