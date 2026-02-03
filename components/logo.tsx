import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "normal" | "large"
  responsive?: boolean
}

export function Logo({ size = "normal", responsive = true }: LogoProps) {
  // Базовые размеры в зависимости от параметра size
  const baseHeight = size === "large" ? 16 : 10
  const baseWidth = size === "large" ? 64 : 40

  // Если логотип адаптивный, используем разные классы для разных размеров экрана
  if (responsive) {
    return (
      <Link href="/" className="flex items-center">
        <div className="relative">
          {/* На мобильных устройствах логотип меньше */}
          <div
            className="block sm:hidden"
            style={{ height: `${baseHeight * 0.6 * 0.25}rem`, width: `${baseWidth * 0.6 * 0.25}rem` }}
          >
            <Image
              src="/logo.png"
              alt="Цветы OFF"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>

          {/* На планшетах средний размер */}
          <div
            className="hidden sm:block md:hidden"
            style={{ height: `${baseHeight * 0.8 * 0.25}rem`, width: `${baseWidth * 0.8 * 0.25}rem` }}
          >
            <Image
              src="/logo.png"
              alt="Цветы OFF"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* На десктопах полный размер */}
          <div
            className="hidden md:block"
            style={{ height: `${baseHeight * 0.25}rem`, width: `${baseWidth * 0.25}rem` }}
          >
            <Image src="/logo.png" alt="Цветы OFF" fill className="object-contain" priority sizes="100vw" />
          </div>
        </div>
      </Link>
    )
  }

  // Если логотип не адаптивный, используем фиксированный размер
  return (
    <Link href="/" className="flex items-center">
      <div className="relative" style={{ height: `${baseHeight * 0.25}rem`, width: `${baseWidth * 0.25}rem` }}>
        <Image src="/logo.png" alt="Цветы OFF" fill className="object-contain" priority sizes="100vw" />
      </div>
    </Link>
  )
}
