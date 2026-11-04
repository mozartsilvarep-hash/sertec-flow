import Image from "next/image";
export default function SertecLogo() {
  return (
    <Image
      src="/brand/sertec-flow-logo-horizontal-color.svg"
      alt="SerTec Flow"
      width={329}
      height={64}
      priority
      className="sf-logo"
    />
  );
}
