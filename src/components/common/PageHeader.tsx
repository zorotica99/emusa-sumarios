interface PageHeaderProps {
  title: string;
  description?: string;
}

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>
    </header>
  );
}

export default PageHeader;