import type { ConnectionOptions, ConnectionEvent } from "../types/connection-options.svelte.js";
import type { Qrwc } from "@q-sys/qrwc"
import { qrwcEvents } from '@q-sys/qrwc/dist/constants'
import { createQrwcInstance } from './qrwc-factory.js'
import type { ControlDecorator } from "@q-sys/qrwc/dist/managers/components/ControlDecorator.js";
import type { IComponent, IComponentFilter } from "@q-sys/qrwc/dist/index.interface.js";

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
    private onInitialValues: (arg0:Qrwc)=>void;
    private onComponentUpdate: (arg0:IComponent)=>void;

    /**
     * Create a new QRWC Instance and connect to the QRWC WebSocket
     * 
     * @param options - Connection options for the QRWC WebSocket
     * @param onInitialValues - Callback function to be invoked when the initial values are received from the QRWC WebSocket
     * @param onComponentUpdate - Callback function to be invoked when a control is updated
     */
    constructor(options: ConnectionOptions, onInitialValues: (arg0:Qrwc)=>void, onComponentUpdate: (arg0:IComponent)=>void) {
        this.options = options;
        this.onInitialValues = onInitialValues;
        this.onComponentUpdate = onComponentUpdate;
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
        if(this.connectionState !== "disconnected"){
            console.log(`QRWC wrapper attempted to connect to Qrwc while already ${this.connectionState}, aborting.`);
            return
        }

        const connectionTimeout = setTimeout(() => {
            console.error("QRWC connection attempt timed out");
            this.connectionAttempts++;
            this.handleDisconnect();
        }, 30000);

        try {
            this.connectionState = "connecting";

            //figure out which core to connect to - if the connection attempts are even, use the redundant core
            let coreIp = this.options.coreIp;
            if(this.options.redundantCoreIp && this.connectionAttempts > 1 && this.connectionAttempts % 2 === 0){
                console.log(`QRWC Attempting connection to redundant core at ${this.options.redundantCoreIp}`);
                coreIp = this.options.redundantCoreIp;
            }

            this.qrwc = await createQrwcInstance(coreIp, this.options.secure);
            await this.startAndSubscribe();
            this.qrwc.on(qrwcEvents.disconnected, ()=> {
                console.log("QRWC Disconnected by QRWC instance");
                this.handleDisconnect()
            });
            clearTimeout(connectionTimeout);
            this.connectionAttempts = 0;
            console.log("QRWC Connection established. Ready to handle control subscriptions");
            this.connectionState = "connected";
            
        }
        catch (e) {
            console.error("QRWC connection Error",e);
            clearTimeout(connectionTimeout);
            this.connectionAttempts++;
            this.handleDisconnect();
        }
    }
    
    private handleDisconnect(): void {
        if(this.connectionState === "disconnected") return;

        try {
            this.qrwc?.close();
        } catch {
            //do nothing - the instance is likely already closed, but just in case we close it again here
        }
        
        this.connectionState = "disconnected";
    
        this.qrwc = null;
    
        //if the user has manually disconnected, we will not attempt to reconnect
        if(!this.allowReconnect) return;

        console.log(`QRWC Connection lost. Re-connection attempt: ${this.connectionAttempts}`);
        setTimeout(() => {
            this.connectToQrwc();
        },this.connectionAttempts > 5 ? 15000 : 1000);
    }

    private async startAndSubscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
        
            const startTimeout = setTimeout(() => {
                reject("Initial Control subscription timed out");
            }, 10000);
    
            if(!this.qrwc) {
                reject("Qrwc instance not created. Call createQrwcInstance first");
                return;
            }
    
            //subscribe to the controls updated event
            this.qrwc.on(qrwcEvents.controlsUpdated, (event) => this.onComponentUpdate(event as IComponent));
    
            this.qrwc.on(qrwcEvents.startComplete, () => {
                this.onInitialValues(this.qrwc!);
                clearTimeout(startTimeout);
                resolve();
            });
    

            if(this.options.controlFilter){
                let componentFilter:IComponentFilter;

                if(Object.prototype.toString.call(this.options.controlFilter) === '[object Array]'){
                    componentFilter = (componentId:IComponent) => {
                        const filter = this.options.controlFilter as string[];
                        return filter.includes(componentId.ID);
                    }
                } else {
                    componentFilter = this.options.controlFilter as IComponentFilter;
                }

                //start with component filter - catch if it throws an error
                try {
                    this.qrwc.start({pollingInterval: this.options.poleInterval ?? 35, componentFilter});
                } catch (e) {
                    console.error("Error starting QRWC with component filter", e);
                    reject(e);
                }
            } else {
                //start without component filter
                this.qrwc.start({pollingInterval: this.options.poleInterval ?? 35});
            }
            
        });
    }
}