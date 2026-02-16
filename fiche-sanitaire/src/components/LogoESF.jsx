export default function LogoESF({ size = 'md' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <div className="flex flex-col items-center">
      <span className={sizes[size]} role="img" aria-label="Piou Piou">🐥</span>
      <span className="font-bold text-esf-red text-sm tracking-wider">MAISON DES ENFANTS</span>
    </div>
  )
}
