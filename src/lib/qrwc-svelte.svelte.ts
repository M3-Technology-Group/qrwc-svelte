import { ConnectionManager } from "./connection/connection-manager.svelte.js";
import type { ConnectionEvent, ConnectionOptions } from "./types/connection-options.svelte.js";
import { getQrwcComponentList } from "./controls/global-metadata.svelte.js";
import { Component } from "./components/component.js";

/**
 * Svelte Wrapper for the @q-sys/qrwc library.
 * Automatically connects to a Q-SYS Core and provides reactive control objects.
 * 
 * @prop {$state<ConnectionEvent>} connectionStatus - $state - The current state of the connection. "connecting" means the QRWC Wrapper is attempting to connect. "connected" means the QRWC Wrapper is ready to accept subscriptions. "disconnected" means the QRWC Wrapper is not connected to the QRWC WebSocket.
 * @prop {$state<number>} connectionAttemptCount - $state - The number of connection attempts made by the QRWC Wrapper.
 * @prop {$state<boolean>} isConnected - $state - True if the connection is "connected", false otherwise.
 */
export class QrwcSvelte extends ConnectionManager {

    /**
     * Starts a new instance of the QRWC Wrapper. This will automatically connect to the specified Q-SYS core.
     * Connection will be maintained until the instance is disconnected.
     * This version of the constructor will connect via non-secure WebSocket, subscribe to all external components, and poll at 35ms.
     * 
     * @param coreIP - The IP or Hostname of the core system to connect to.
     */
    constructor(coreIP:string);
    /**
     * Starts a new instance of the QRWC Wrapper. This will automatically connect to the specified Q-SYS core.
     * Connection will be maintained until the instance is disconnected.
     * This version of the constructor allows for more advanced connection options.
     * 
     * @param connectionOptions - Connection options for the QRWC WebSocket, See {@link ConnectionOptions}
     */
    constructor(connectionOptions: ConnectionOptions)
    constructor(options: ConnectionOptions | string) {

        if(typeof options === 'string'){
            options = {coreIp: options}
        }

        super(options);
    }
    

    /********** Public API **********/

    /**
     * $state Connection Status of the QRWC instance.
     * Can be "connected", "disconnected", or "connecting".
     * This is a read-only property.
     */
    public connectionStatus = $derived<ConnectionEvent>(this.connectionState);

    /**
     * $state Boolean value of the connection status.
     * True if the connection is "connected", false otherwise.
     * 
     * When true the QRWC Wrapper is ready to accept subscriptions.
     */
    public isConnected = $derived<boolean>(this.connectionState === "connected");

    /**
     * $state Number of connection attempts made by the QRWC Wrapper.
     * This is a read-only property.
     */
    public connectionAttemptCount = $derived<number>(this.connectionAttempts);


    /**
     * Fetch a specific component in the current Q-SYS design.
     * This will return a component instance that provides metadata and access to controls within the component.
     * Controls within the component can be fetched using the appropriate use method.
     * 
     * @param componentId ID of the component to use. This is the "Code Name" under Script Access in Q-SYS Designer
     * @returns component instance that provides metadata and access to controls within the component.
     * @throws {Error} If the component does not exist in the Q-SYS design or is excluded by the control filter.
     */
    public useComponent = (componentId:string):Component => new Component(componentId, this.qrwc);

    /**
     * Get the list of components in the current Q-SYS design.
     * Only returns components that have external script access, and are not excluded by a component filter
     * passed into this wrapper instance.
     * 
     * @returns Array of component names with external script access in the current Q-SYS design.
     */
    public getComponentList = ():string[] => getQrwcComponentList(this.qrwc);


    /**
     * Manually disconnect the QRWC WebSocket, and no longer attempt to reconnect.
     * This method should be called when the QRWC instance is no longer needed.
     * 
     * This method will flush all subscriptions and disconnect the WebSocket.
     * A new instance of the QRWC Wrapper will need to be created to reconnect.
     * 
     * Any controls that were fetched will no longer be valid and will need to be re-fetched.
     */
    public disconnect = ():void => {
        this.killConnection();  
    }
}