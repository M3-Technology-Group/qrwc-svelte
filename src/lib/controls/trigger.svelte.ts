import type { Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js'
import type { ControlSubscriber } from '$lib/connection/control-subscriber.svelte.js';

/**
 * Represents a button control that can be used in a Svelte component.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param trigger - function to trigger the control.
 */
export interface TriggerControl extends ControlMetadata {
    trigger: () => void;
}

export function fetchTrigger(component:string, control:string, qrwcInstance:Qrwc | null, subscriber:ControlSubscriber): TriggerControl {
    const ctl = fetchControl(component, control, qrwcInstance, subscriber);
    if(ctl.Type !== "Trigger") console.error("Attempted to use a trigger on a non-trigger control");

    const trigger = () => {
        if(ctl.Direction === "Read Only") {
            console.error(`Attempted to trigger a read-only control ${control} in component ${component}`);
            return;
        }

        ctl.value = 1;
    }

    return {
        get ControlName() { return ctl.ControlName },
        get Direction() { return ctl.Direction },
        get Type() { return ctl.Type },
        get rawControl() { return ctl.rawControl},
        trigger,
    }
}