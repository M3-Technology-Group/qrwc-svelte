import { Qrwc } from "@q-sys/qrwc"
import { qrwcEvents } from '@q-sys/qrwc/dist/constants'

export async function createQrwcInstance(coreIp:string, secure = false) :Promise<Qrwc>
    {
        return new Promise((resolve, reject) => {
            const qrwc = new Qrwc();
            const ws = new WebSocket(`${secure ? 'wss' :'ws'}://${coreIp}/qrc-public-api/v0`);
    
            //add it to the window object so it can be killed if necessary
            (window as any).qrwcInstance = qrwc;
    
            const timeoutHandle = setTimeout(() => {
                if(ws && (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CONNECTING))
                {
                    ws.close();
                }
                reject(new Error('Timeout while creating Qrwc instance'));
            }, 20000);
    
            //wait for the websocket to open
            ws.onopen = () => {
                qrwc.attachWebSocket(ws);
            }
    
            //wait for qrwc to attach to the websocket
            qrwc.on(qrwcEvents.webSocketAttached, () => {
                clearTimeout(timeoutHandle);
                resolve(qrwc);
            });
        });
    }