import logoUrl from '../assets/logo.png'

interface AppLogoProps {
  className?: string
}

export const AppLogo = ({ className = 'h-10 w-auto' }: AppLogoProps) => {
  return <img src={logoUrl} alt="AsistApp Logo" className={className} />
}
