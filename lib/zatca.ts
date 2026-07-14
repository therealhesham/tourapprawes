// ZATCA e-invoicing Phase 1 (Generation) — simplified tax invoice QR code.
// The QR payload is a base64-encoded TLV (Tag-Length-Value) structure with
// five mandatory tags, per ZATCA's "Electronic Invoice QR Code" specification:
//   1: seller name, 2: seller VAT number, 3: invoice timestamp (ISO 8601),
//   4: invoice total (with VAT), 5: VAT amount.
// Length is the byte length of the UTF-8 encoded value.

function tlvField(tag: number, value: string): Buffer {
  const v = Buffer.from(value, "utf8");
  if (v.length > 255) throw new Error(`ZATCA TLV field ${tag} exceeds 255 bytes`);
  return Buffer.concat([Buffer.from([tag, v.length]), v]);
}

export function zatcaQrBase64(data: {
  sellerName: string;
  vatNumber: string;
  timestamp: Date;
  total: number | string;
  vatAmount: number | string;
}): string {
  const fmt = (n: number | string) => Number(n).toFixed(2);
  return Buffer.concat([
    tlvField(1, data.sellerName),
    tlvField(2, data.vatNumber),
    tlvField(3, data.timestamp.toISOString()),
    tlvField(4, fmt(data.total)),
    tlvField(5, fmt(data.vatAmount)),
  ]).toString("base64");
}
