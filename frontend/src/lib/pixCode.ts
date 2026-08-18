// Static PIX BR-Code (EMVCo) generator - "Copia e Cola" payload.
// Encodes a static PIX key with optional amount. CRC16-CCITT over full payload.

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Remove diacritics + non ASCII printable
function sanitize(s: string, max: number): string {
  const cleaned = (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase();
  return cleaned.slice(0, max);
}

export function buildPixPayload(opts: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txid = "***" } = opts;

  const gui = tlv("00", "BR.GOV.BCB.PIX");
  const key = tlv("01", pixKey);
  const merchantAccountInfo = tlv("26", gui + key);

  const payloadFormat = tlv("00", "01");
  const merchantCategory = tlv("52", "0000");
  const currency = tlv("53", "986"); // BRL
  const amountField = amount && amount > 0 ? tlv("54", amount.toFixed(2)) : "";
  const country = tlv("58", "BR");
  const name = tlv("59", sanitize(merchantName, 25) || "IGREJA");
  const city = tlv("60", sanitize(merchantCity, 15) || "BRASIL");
  const additional = tlv("62", tlv("05", sanitize(txid, 25) || "***"));

  const base =
    payloadFormat +
    merchantAccountInfo +
    merchantCategory +
    currency +
    amountField +
    country +
    name +
    city +
    additional +
    "6304";

  return base + crc16(base);
}
