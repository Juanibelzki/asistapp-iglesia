import React from 'react';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

export default function FeatureCard({ title, icon: Icon }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.border}></div>
      <div className={styles.content}>
        <div className={styles.logo}>
            <Icon size={32} color="#bd9f67" />
        </div>
        <span className={styles.logoBottomText}>{title}</span>
        <div className={styles.trail}></div>
      </div>
      <span className={styles.bottomText}></span>
    </div>
  );
}
