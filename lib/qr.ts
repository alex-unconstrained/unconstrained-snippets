import QRCode from "qrcode";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://unconstrained-snippets.vercel.app";

export async function qrCodeSvg(pagePath: string): Promise<string> {
  return QRCode.toString(`${SITE_URL}${pagePath}`, {
    type: "svg",
    margin: 1,
    width: 192,
    color: { dark: "#0A0B14", light: "#FFFFFF" },
  });
}
