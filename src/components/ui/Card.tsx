import React from 'react'
import styles from './Card.module.css'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={`${styles.card} ${className || ''}`} {...props}>
            {children}
        </div>
    )
}
