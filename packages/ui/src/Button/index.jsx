import classes from './index.module.css'
import {clsx} from 'clsx'
export const Button = ({ className }) => {
  return (
    <button className={clsx(className,classes.button)}>123</button>
  )
}