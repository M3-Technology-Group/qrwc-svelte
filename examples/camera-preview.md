---
title: Camera Preview Example
group: Examples
category: Examples
---

# Camera Preview Example

**WARNING: This camera preview implementation is experimental**
As of now this is the only way to render a camera preview in a QRWC based UI. This method involves subscribing to the static JPEG data from the camera, which means that it will only provide a 1 frame per second preview. It is unknown weather Q-SYS will provide an alternate method of rendering camera previews in the future.

## Setup

All Examples assume a connected and ready QrwcSvelte instance provided globally.

In these examples using vanilla Svelte, this is done by creating the following file in the `lib` directory:

src/lib/qrwc-svelte.ts
```typescript
import { QrwcSvelte } from 'qrwc-svelte';

export const qrwcSvelte = new QrwcSvelte("core-ip-or-hostname");
```

## Camera Preview

```svelte
<script lang="ts">
  import { qrwcSvelte } from "./lib/qrwc-svelte";

  const cameraImage = qrwcSvelte.useText("USB_Video_Bridge_NickPs-NV-32", "jpeg.data");

  let jpegData = $derived(JSON.parse(cameraImage.string).IconData as string);

</script>

<img src="data:image/jpeg;base64,{jpegData}" alt="Camera Preview">
```

This was tested with an NC-110 where the camera component was given the code name `Cam`. The jpeg.data control is hidden, but accessible through the API. Subscribing to the `jpeg.data` control yields a JSON object that contains metadata along with the actual image data as a base64 string, which is stored in the `IconData` property. This data can then be used to display the image in an `img` tag.

The `jpeg.data` control is updated at a rate of 1 frame per second, so the image will update at that rate.

The method above has been tested to work on both the camera component itself, and the accompanying USB Video Bridge component.

Simply exposing a Camera component by setting script access to `external` or `all` means that the image data is always transferred over the QRWC Websocket connection, weather the data is subscribed to or not in the UI, which can be a lot of data. 

It is recommended that you use the USB Video bridge component to interact with cameras if there is more than one camera in a design and set all camera components script access to `internal` or `none` to reduce the amount of data transferred over the websocket connection. (you can also exclude camera components with a component filter in the QrwcSvelte constructor)