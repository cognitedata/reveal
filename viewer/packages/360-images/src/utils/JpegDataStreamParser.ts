/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Scans a JPEG byte buffer and returns whether it is progressive (SOF2) or
 * baseline (SOF0/SOF1) by fecthing segment headers until the SOF marker is found.
 * Returns 'unknown' if the buffer does not yet contain the SOF marker.
 *
 * The SOF marker appears in the first 1–4 KB of any JPEG file, well before image data.
 */
export function detectJpegType(buffer: Uint8Array): 'progressive' | 'baseline' | 'unknown' {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return 'unknown';
  let i = 2;
  while (i < buffer.length - 1) {
    if (buffer[i] !== 0xff) return 'unknown';
    const marker = buffer[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    if (marker === 0xc0 || marker === 0xc1) return 'baseline'; // SOF0 / SOF1
    if (marker === 0xc2) return 'progressive'; // SOF2
    if (marker === 0xd9) return 'unknown'; // EOI before SOF — malformed
    if (i + 3 >= buffer.length) return 'unknown'; // need more data
    const segLen = (buffer[i + 2] << 8) | buffer[i + 3];
    i += 2 + segLen;
  }
  return 'unknown';
}

/**
 * Scans a JPEG byte buffer and returns the byte offsets at which each progressive
 * scan ends (i.e. where the next segment marker begins after the entropy-coded data).
 *
 * Taking buffer[0..cutpoint] + FF D9 (EOI) produces a valid, decodable JPEG that
 * shows the image quality as of that scan pass.
 *
 * Progressive JPEG structure:
 * SOI -> APP... -> DQT -> SOF2 -> (DHT -> SOS -> <entropy data>)* -> EOI
 *
 * Inside entropy-coded scan data, FF bytes are escaped as FF 00 (byte stuffing).
 * FF D0-D7 are restart markers (RST) and are also valid inside scan data.
 * FF FF sequences are fill bytes before a real marker and must be skipped.
 * Any other FF XX sequence is a real segment marker and ends the current scan.
 *
 * A cutpoint is only recorded when the terminating marker is actually found in
 * the buffer. If the buffer runs out mid-scan, no cutpoint is recorded for that
 * scan — the caller should wait for more data.
 */
export function findProgressiveScanCutpoints(buffer: Uint8Array): number[] {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return [];
  }

  const cutpoints: number[] = [];
  let i = 2; // skip SOI (FF D8)

  while (i < buffer.length - 1) {
    if (buffer[i] !== 0xff) {
      i++;
      continue;
    }

    const marker = buffer[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }

    if (marker === 0xd9) {
      // EOI — full image complete; treat current position as a cutpoint
      cutpoints.push(i);
      break;
    }

    if (marker === 0xda) {
      // SOS — Start of Scan; skip the scan header then walk entropy-coded data
      if (i + 3 >= buffer.length) break; // need more bytes
      const hdrLen = (buffer[i + 2] << 8) | buffer[i + 3];
      i += 2 + hdrLen; // now at first byte of entropy-coded scan data

      // Walk entropy data until a real segment marker appears.
      // Only record a cutpoint when we actually find the terminating marker —
      // if the buffer runs out first, this scan is incomplete; don't push.
      let foundEndOfScan = false;
      while (i < buffer.length - 1) {
        if (buffer[i] === 0xff) {
          const b = buffer[i + 1];
          if (b === 0x00) {
            i += 2; // byte stuffing — literal 0xFF in data
            continue;
          }
          if (b >= 0xd0 && b <= 0xd7) {
            i += 2; // RST0-RST7 restart marker — valid inside scan data
            continue;
          }
          if (b === 0xff) {
            i++; // fill byte (FF FF ... FF XX) — skip and re-examine
            continue;
          }
          foundEndOfScan = true;
          break; // real marker: scan data has ended
        }
        i++;
      }

      if (foundEndOfScan && buffer[i + 1] !== 0xd9) {
        cutpoints.push(i); // buffer[0..i] + EOI = decodable JPEG
      }
      continue;
    }

    // All other segments have a 2-byte length field immediately after the marker byte
    if (i + 3 >= buffer.length) break; // need more bytes
    const segLen = (buffer[i + 2] << 8) | buffer[i + 3];
    i += 2 + segLen;
  }

  return cutpoints;
}

/**
 * Creates a Blob containing a valid JPEG by taking the first `cutpoint` bytes
 * of `buffer` and appending an EOI (FF D9) marker.
 */
export function makePartialJpegBlob(buffer: Uint8Array<ArrayBuffer>, cutpoint: number): Blob {
  return new Blob([buffer.subarray(0, cutpoint), new Uint8Array([0xff, 0xd9])], { type: 'image/jpeg' });
}
