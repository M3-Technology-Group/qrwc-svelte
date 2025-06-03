import type { Control, Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js'

/**
 * Represents a button control that can be used in a Svelte component.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param state - $state of the control's value (boolean), set to command the control to change its value.
 * @param toggle - function to toggle the state of the control.
 */
export interface ButtonControl extends ControlMetadata {
    state: boolean;
    toggle: () => void;
}


export function fetchButton(control:Control): ButtonControl {
    const ctl = fetchControl(control);
    if(ctl.Type !== "Boolean")
        console.error(`Attempted to use a Button on a non-boolean control: ${control.name} in component ${control.component.name} sent type: ${ctl.Type}`);

    const toggle = () => {
        if(ctl.Direction === "Read Only") {
            console.error(`Attempted to toggle a read-only control ${control.name} in component ${control.component.name}`);
            return;
        }

        if(ctl.position ?? 0 > 0.5) ctl.value = 0;
        else ctl.value = 1;
    }
    const set = (state:boolean) => {
        if(ctl.Direction === "Read Only") {
            console.error(`Attempted to toggle a read-only control ${control.name} in component ${control.component.name}`);
            return;
        }

        ctl.value = state ? 1 : 0;
    }
    const state = $derived<boolean>(ctl.value ?? 0 > 0.5 ? true : false);

    return {
        get ControlName() { return ctl.ControlName },
        get Direction() { return ctl.Direction },
        get Type() { return ctl.Type },
        get rawControl() { return ctl.rawControl},
        get state() {return state },
        set state(val:boolean) { set(val); },
        toggle,
    }
}