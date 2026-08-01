import { Button } from '@repo/ui'
import clsx from 'clsx'
import classes from './page.module.css'

export default function HomePage() {
  return <Button className={clsx(classes.button)}>12</Button>
}