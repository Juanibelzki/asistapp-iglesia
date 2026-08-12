import { createFileRoute } from '@tanstack/react-router'
import Concept9 from '../components/figma/Concept9'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <Concept9 />
}
