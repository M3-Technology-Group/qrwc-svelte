import type { Qrwc } from "@q-sys/qrwc";
import { ConnectionManager } from "./connection/connection-manager.svelte.js";
import type { ConnectionEvent, ConnectionOptions } from "./types/connection-options.svelte.js";
import type { ControlDecorator } from "@q-sys/qrwc/dist/managers/components/ControlDecorator.js";
import { ControlSubscriber } from "./connection/control-subscriber.svelte.js";
import { fetchControl, type GenericControl } from "./controls/base-control.svelte.js";
import { fetchButton, type ButtonControl } from "./controls/button.svelte.js";
import { fetchTrigger, type TriggerControl } from "./controls/trigger.svelte.js";
import { fetchKnob, type KnobControl } from "./controls/knob.svelte.js";
import { fetchText, type TextControl } from "./controls/text.svelte.js";
import { fetchComboBox } from "./controls/combo-box.svelte.js";
import { getQrwcComponentList, getQrwcControlList } from "./controls/global-metadata.svelte.js";

/**
 * Svelte Wrapper for the @q-sys/qrwc library.
 * Automatically connects to a Q-SYS Core and provides reactive control objects.
 * 
 * @prop {$state<ConnectionEvent>} connectionStatus - $state - The current state of the connection. "connecting" means the QRWC Wrapper is attempting to connect. "connected" means the QRWC Wrapper is ready to accept subscriptions. "disconnected" means the QRWC Wrapper is not connected to the QRWC WebSocket.
 * @prop {$state<number>} connectionAttemptCount - $state - The number of connection attempts made by the QRWC Wrapper.
 * @prop {$state<boolean>} isConnected - $state - True if the connection is "connected", false otherwise.
 */
export class QrwcSvelte extends ConnectionManager {

    private subscriber: ControlSubscriber = new ControlSubscriber();

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

        super(options, 
            (qrwc: Qrwc) => {this.subscriber.propagateInitialValues(qrwc)}, 
            (controlData: Record<string, ControlDecorator>) => {this.subscriber.processControlEvent(controlData)});
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
     * Fetch and subscribe to a generic component in a Q-SYS design. 
     * This should only be used for components that do not have a specific
     * use method defined by this library (EG: Buttons, Knobs, Text).
     * 
     * Reactive String, Position and Value properties are returned.
     * If the control subscribed to does not support one of these properties,
     * the property will be left as undefined.
     * 
     * An error may be thrown if string, position or value is set on a control
     * that does not support that property.
     * 
     * @param component Code Name of the component in Q-SYS Designer. 
     * @param control Control name inside the component to use.
     * @returns {GenericControl} object that can be used in a Svelte component.
     */
    public useControl = (component:string, control:string):GenericControl => fetchControl(component, control, this.qrwc, this.subscriber);

    /**
     * Fetch and Subscribe to a Button control in a Q-SYS design.
     * This can be use with Monetary or Toggle buttons.
     * 
     * State is reactive and provides feedback, state can be set to command the control.
     * 
     * @param component Code Name of the component in Q-SYS Designer. 
     * @param control Control name inside the component to use.
     * @returns {ButtonControl} object that can be used in a Svelte component.
     */
    public useButton = (component:string, control:string):ButtonControl => fetchButton(component, control, this.qrwc, this.subscriber);

    /**
     * Fetch a Trigger button control in a Q-SYS design.
     * 
     * Trigger buttons are one-way and don't provide feedback.
     * Trigger controls only provide a trigger method and control metadata.
     * 
     * @param component Code Name of the component in Q-SYS Designer. 
     * @param control Control name inside the component to use.
     * @returns {TriggerControl} object that can be used in a Svelte component.
     */
    public useTrigger = (component:string, control:string):TriggerControl => fetchTrigger(component, control, this.qrwc, this.subscriber);

    /**
     * Fetch and Subscribe to a Knob control in a Q-SYS design.
     * This can be used with Float, Integer, and Time controls. 
     * This includes: faders, gains, frequency controls, pans, etc.
     * 
     * String includes applicable units (db, Hz, etc).
     * Position is a float from 0-1.
     * Value is the numeric value of the control.
     * String, position and Value are all reactive and can be set to command the control.
     * 
     * Min an Max values are provided for Value and String.
     * 
     * @param component Code Name of the component in Q-SYS Designer. 
     * @param control Control name inside the component to use.
     * @returns { KnobControl } object that can be used in a Svelte component.
     */
    public useKnob = (component:string, control:string):KnobControl => fetchKnob(component, control, this.qrwc, this.subscriber);

    /**
     * Fetch and Subscribe to a Text control in a Q-SYS design.
     * 
     * This can be used with any text control in Q-SYS.
     * 
     * String is reactive and can be set to command the control.
     * 
     * @param component Code Name of the component in Q-SYS Designer. 
     * @param control Control name inside the component to use.
     * @returns { TextControl } object that can be used in a Svelte component.
     */
    public useText = (component:string, control:string):TextControl => fetchText(component, control, this.qrwc, this.subscriber);

    /**
     * @note This method is not yet implemented.
     * 
     * @param component 
     * @param control 
     * @returns 
     */
    public useComboBox = (component:string, control:string):unknown => fetchComboBox(component, control, this.qrwc, this.subscriber);

    /**
     * Get the list of components in the current Q-SYS design.
     * Only returns components that have external script access, and are not excluded by a component filter
     * passed into this wrapper instance.
     * 
     * @returns Array of component names with external script access in the current Q-SYS design.
     */
    public getComponentList = ():string[] => getQrwcComponentList(this.qrwc);

    /**
     * Get the list of controls in a specific component in the current Q-SYS design.
     * Only returns controls that have external script access, and are not excluded by a control filter
     * passed into this wrapper instance.
     * 
     * @param componentId Code Name of the component in Q-SYS Designer.
     * @returns Array of control names in the specified component. Empty array if the component does not exist.
     */
    public getControlList = (componentId: string):string[] => getQrwcControlList(this.qrwc, componentId);

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
        this.subscriber.flushSubscriptions();
    }
}