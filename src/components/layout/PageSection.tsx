import { ReactNode } from 'react';

interface PageSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageSection({ title, description, actions, children, className }: PageSectionProps) {
  return (
    <section className={className}>
      {(title || description || actions) && (
        <div className="card-modern p-4 flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold heading-modern">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
} 