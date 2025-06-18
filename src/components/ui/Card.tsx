import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  const classes = `card ${hover ? "card-hover" : ""} ${className}`;

  return <div className={classes}>{children}</div>;
}
