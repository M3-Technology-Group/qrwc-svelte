import type { Qrwc } from "@q-sys/qrwc";


export function getQrwcComponentList(qrwc: Qrwc | null): string[] {
    if(!qrwc) {
        console.warn("QRWC instance is not available, cannot fetch component list. Returning empty array.");
        return [];
    }

    return Object.keys(qrwc.components);
}

export function getQrwcControlList(qrwc: Qrwc | null, componentId: string): string[] {
    if(!qrwc) {
        console.warn("QRWC instance is not available, cannot fetch control list. Returning empty array.");
        return [];
    }

    if(!qrwc.components[componentId]) {
        console.warn(`Component with ID ${componentId} does not exist in the QRWC instance. Returning empty array.`);
        return [];
    }

    return Object.keys(qrwc.components[componentId]);
}