import type { Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js'
import type { ControlSubscriber } from '$lib/connection/control-subscriber.svelte.js';



export function fetchComboBox(component:string, control:string, qrwcInstance:Qrwc | null, subscriber:ControlSubscriber) {

    throw new Error("Not implemented");
}