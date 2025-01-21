import type { Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js'
import type { ControlSubscriber } from '$lib/connection/control-subscriber.svelte.js';

/**
 * Represents a text control that can be used in a Svelte component.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param string - $state of the control's string (string), set to command the control to change its string.
 */
export interface TextControl extends ControlMetadata {
    string: string;
}

export function fetchText(component:string, control:string, qrwcInstance:Qrwc | null, subscriber:ControlSubscriber) {
    const ctl = fetchControl(component, control,qrwcInstance, subscriber);
    if(ctl.Type !== "Text") console.error("Attempted to use a text input on a non-text control");

    const setText = (val:string) => {
        if(ctl.Direction === "Read Only") {
            console.error(`Attempted to set a read-only control ${control} in component ${component}`);
            return;
        }

        ctl.string = val;
    }

    let string = $derived<string>(ctl.string as string ?? "");

    return {
        get ControlName() { return ctl.ControlName },
        get Direction() { return ctl.Direction },
        get Type() { return ctl.Type },
        get rawControl() { return ctl.rawControl},
        get string() { return string },
        set string(val:string) { setText(val); },
    }
}