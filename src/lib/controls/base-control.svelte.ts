import { getDirectionProperty, getTypeProperty, type ControlDirection, type ControlType } from "$lib/connection/control-data-parser.svelte.js";
import type { Control } from "@q-sys/qrwc";

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
    rawControl: Control | undefined;
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
export function fetchControl(control:Control, controlUpdatedCallback?:(arg0:Control['state'])=>void): GenericControl {

    let ControlName = control.name;
    let Direction:ControlDirection= getDirectionProperty(control);
    let Type:ControlType = getTypeProperty(control);
    let value = $state<string | number | boolean | undefined>(control.state.Value);
    let position = $state<number | undefined>(control.state.Position);
    let string = $state<string | undefined>(control.state.String);

    $effect(() => {

        const listener = (ctl: Control['state']) => {
            value = ctl.Value;
            position = ctl.Position;
            string = ctl.String;
            try {
                if(controlUpdatedCallback)
                    controlUpdatedCallback(ctl);
            }
            catch (e) {
                console.error(`Error updating control ${control} in component ${control.component.name} due to ${e}`);
            }
        }
        control.on('update', listener);

        return () => {
            control.removeListener('update', listener);
        }
    });

    const setValue = (val:string | number | boolean | undefined) => {
        try {
            if (control.state && val !== undefined) {
                control.update(val);
            } else {
                console.error(`Control ${control.name} in component ${control.component.name} not found`);
            }
        }
        catch {
            console.error(`Error setting value for control ${control.name} in component ${control.component.name}`);
        }
    };

    const setPosition = (val:number | undefined) => {
        console.error("NOT IMPLEMENTED: Position is not settable in current version");
        /*
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
        }*/
    }

    const setString = (val:string | undefined) => {
        try {
            if (control.state && val !== undefined) {
                control.update(val);
            } else {
                console.error(`Control ${control.name} in component ${control.component.name} not found`);
            }
        }
        catch {
            console.error(`Error setting string for control ${control.name} in component ${control.component.name}`);
        }
    }

    return {
        get ControlName() { return ControlName },
        get Direction() { return Direction },
        get Type() { return Type },
        get rawControl() { return control},
        get value() { return value },
        get position() { return position },
        get string() { return string },
        set value(val:string | number | boolean | undefined) { setValue(val); },
        set position(val:number | undefined) { setPosition(val); },
        set string(val:string | undefined) { setString(val); }
    }
}