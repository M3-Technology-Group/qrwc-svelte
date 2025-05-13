import { getDirectionProperty, getTypeProperty, type ControlDirection, type ControlType } from "$lib/connection/control-data-parser.svelte.js";
import type { ControlSubscriber } from "$lib/connection/control-subscriber.svelte.js";
import type { Qrwc } from "@q-sys/qrwc";
import type { ControlDecorator } from "@q-sys/qrwc/dist/managers/components/ControlDecorator.js";

/**
 * Represents a generic control that can be used in a Svelte component.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param value - $state of the control's value (string, number, or boolean), set to command the control to change its value.
 * @param position - $state of the control's position (number), set to command the control to change its position.
 * @param string - $state of the control's string (string), set to command the control to change its string.
 */
export interface GenericControl extends ControlMetadata {
    
    value: string | number | boolean | undefined;
    position: number | undefined;
    string: string | undefined;
}

/**
 * Metadata Properties shared by all controls.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 */
export interface ControlMetadata {
    ControlName: string;
    Direction: ControlDirection;
    Type: ControlType;
    rawControl: ControlDecorator | undefined;
}

/**
 * 
 * @param component Component code name in Q-SYS Designer
 * @param control Control name inside the component to use
 * @param qrwcInstance An instance of the Qrwc class
 * @param subscriber An instance of the ControlSubscriber class
 * @param controlUpdatedCallback Optional callback that is invoked when the control is updated by the Core.
 * @returns {GenericControl} object that can be used in a Svelte component (or used to build a more specific control).
 */
export function fetchControl(component:string, control:string, qrwcInstance:Qrwc | null, subscriber:ControlSubscriber, controlUpdatedCallback?:(arg0:ControlDecorator)=>void): GenericControl {
    if(!qrwcInstance) console.error("Attempted to access control prior to connection to Qrwc, using default values.");

    let controlData: ControlDecorator | undefined = qrwcInstance?.components[component]?.Controls?.[control] ?? undefined;
    
    let ControlName = controlData?.Name ?? "";
    let Direction:ControlDirection= getDirectionProperty(controlData);
    let Type:ControlType = getTypeProperty(controlData);
    let value = $state<string | number | boolean | undefined>(controlData?.Value ?? undefined);
    let position = $state<number | undefined>(controlData?.Position ?? undefined);
    let string = $state<string | undefined>(controlData?.String ?? undefined);

    $effect(() => {
        const subscriptionId = subscriber.subscribeControl(component, control, (ctl) => {

            value = ctl.Value;
            position = ctl.Position;
            string = ctl.String;
            try {
                if(controlUpdatedCallback)
                    controlUpdatedCallback(ctl);
            }
            catch (e) {
                console.error(`Error updating control ${control} in component ${component} due to ${e}`);
            }
        });

        return () => {
            subscriber.unsubscribeControl(subscriptionId);
        }
    });

    const setValue = (val:string | number | boolean | undefined) => {
        if(!qrwcInstance) return;
        try {
            const controlObj = qrwcInstance.components[component]?.Controls?.[control];
            if (controlObj && val !== undefined) {
                controlObj.Value = val;
            } else {
                console.error(`Control ${control} in component ${component} not found`);
            }
        }
        catch {
            console.error(`Error setting value for control ${control} in component ${component}`);
        }
    };

    const setPosition = (val:number | undefined) => {
        if(!qrwcInstance) return;
        try {
            const controlObj = qrwcInstance.components[component]?.Controls?.[control];
            if (controlObj && val !== undefined) {
                controlObj.Position = val;
            } else {
                console.error(`Control ${control} in component ${component} not found`);
            }
        }
        catch {
            console.error(`Error setting position for control ${control} in component ${component}`);
        }
    }

    const setString = (val:string | undefined) => {
        if(!qrwcInstance) return;
        try {
            const controlObj = qrwcInstance.components[component]?.Controls?.[control];
            if (controlObj && val !== undefined) {
                controlObj.String = val;
            } else {
                console.error(`Control ${control} in component ${component} not found`);
            }
        }
        catch {
            console.error(`Error setting string for control ${control} in component ${component}`);
        }
    }

    return {
        get ControlName() { return ControlName },
        get Direction() { return Direction },
        get Type() { return Type },
        get rawControl() { return controlData},
        get value() { return value },
        get position() { return position },
        get string() { return string },
        set value(val:string | number | boolean | undefined) { setValue(val); },
        set position(val:number | undefined) { setPosition(val); },
        set string(val:string | undefined) { setString(val); }
    }
}