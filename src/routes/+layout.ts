import { QrwcSvelte, type ConnectionOptions } from '$lib/index.js';
import type { LayoutLoad } from './$types.js';
import { PUBLIC_COREIP } from '$env/static/public';
import { browser } from '$app/environment';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ params }) => {
	if (browser) {
		return {
			qrwc: new QrwcSvelte({
				coreIp: "172.18.1.82"
			})
		};
	}
};
